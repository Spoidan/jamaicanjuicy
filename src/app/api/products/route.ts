import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

function authCheck(req: NextRequest) {
  return new URL(req.url).searchParams.get('key') === process.env.ADMIN_KEY;
}

export async function GET() {
  try {
    const rows = await sql`SELECT data FROM products ORDER BY created_at ASC`;
    return NextResponse.json(rows.map((r) => r.data));
  } catch (err) {
    console.error('[products GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const product = await req.json();
    await sql`
      INSERT INTO products (id, data)
      VALUES (${product.id}, ${JSON.stringify(product)})
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[products POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await req.json();
    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[products DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
