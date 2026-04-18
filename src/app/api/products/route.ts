import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

function authCheck(req: NextRequest) {
  return new URL(req.url).searchParams.get('key') === process.env.ADMIN_KEY;
}

export async function GET() {
  const rows = await sql`SELECT data FROM products ORDER BY created_at ASC`;
  return NextResponse.json(rows.map((r) => r.data));
}

export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const product = await req.json();
  await sql`
    INSERT INTO products (id, data)
    VALUES (${product.id}, ${JSON.stringify(product)})
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await sql`DELETE FROM products WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
