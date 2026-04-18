import { NextRequest, NextResponse } from 'next/server';
import sql, { parseJson } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get('email');
    if (!email) return NextResponse.json([]);

    const rows = await sql`
      SELECT * FROM orders WHERE lower(customer_email) = ${email.toLowerCase()} ORDER BY created_at DESC
    `;
    return NextResponse.json(rows.map((r) => ({
      id: r.id, status: r.status, total: Number(r.total),
      createdAt: r.created_at, deliveryType: r.delivery_type,
      items: parseJson(r.items),
    })));
  } catch (err) {
    console.error('[account/orders GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
