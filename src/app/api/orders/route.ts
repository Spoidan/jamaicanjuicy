import { NextRequest, NextResponse } from 'next/server';
import { generateOrderId } from '@/lib/utils';
import sql, { parseJson } from '@/lib/db';

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    return NextResponse.json(rows.map(toOrder));
  } catch (err) {
    console.error('[orders GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerEmail, customerPhone, items, deliveryType, deliveryAddress, notes } = await req.json();
    if (!customerName || !customerEmail || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const total = items.reduce(
      (sum: number, item: { selectedSize: { price: number }; quantity: number }) =>
        sum + item.selectedSize.price * item.quantity, 0
    );
    const id = generateOrderId();
    await sql`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, delivery_address, delivery_type, notes, items, total, status)
      VALUES (${id}, ${customerName}, ${customerEmail}, ${customerPhone ?? null}, ${deliveryAddress ?? null},
              ${deliveryType ?? 'delivery'}, ${notes ?? null}, ${JSON.stringify(items)}, ${total}, 'pending')
    `;
    return NextResponse.json({ success: true, orderId: id }, { status: 201 });
  } catch (err) {
    console.error('[orders POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { orderId, status } = await req.json();
    const result = await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${orderId} RETURNING id
    `;
    if (result.length === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[orders PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function toOrder(row: Record<string, unknown>) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_address,
    deliveryType: row.delivery_type,
    notes: row.notes,
    items: parseJson(row.items),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
