import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await sql`SELECT * FROM subscriptions ORDER BY created_at DESC`;
    return NextResponse.json(rows.map(toSub));
  } catch (err) {
    console.error('[subscriptions GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, address, frequency, flavors } = await req.json();
    if (!name || !email || !frequency) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const id = `SUB-${Date.now().toString(36).toUpperCase()}`;
    await sql`
      INSERT INTO subscriptions (id, name, email, phone, address, frequency, flavors, status)
      VALUES (${id}, ${name}, ${email}, ${phone ?? null}, ${address ?? null},
              ${frequency}, ${JSON.stringify(flavors ?? [])}, 'active')
    `;
    return NextResponse.json({ success: true, subscriptionId: id }, { status: 201 });
  } catch (err) {
    console.error('[subscriptions POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, status } = await req.json();
    await sql`UPDATE subscriptions SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscriptions PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function toSub(row: Record<string, unknown>) {
  return {
    id: row.id, name: row.name, email: row.email, phone: row.phone,
    address: row.address, frequency: row.frequency, flavors: row.flavors,
    status: row.status, createdAt: row.created_at,
  };
}
