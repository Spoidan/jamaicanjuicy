import { NextRequest, NextResponse } from 'next/server';
import sql, { parseJson } from '@/lib/db';

type Row = Record<string, unknown>;

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id            TEXT PRIMARY KEY,
      product_id    TEXT NOT NULL,
      order_id      TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment       TEXT NOT NULL DEFAULT '',
      status        TEXT NOT NULL DEFAULT 'pending',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const adminKey  = searchParams.get('key');

  try {
    await ensureTable();

    if (adminKey === process.env.ADMIN_KEY) {
      const rows = await sql`
        SELECT r.id, r.product_id, r.order_id, r.customer_name, r.customer_email,
               r.rating, r.comment, r.status, r.created_at,
               p.data->>'name' AS product_name
        FROM   product_reviews r
        LEFT JOIN products p ON p.id = r.product_id
        ORDER BY r.created_at DESC
      `;
      return NextResponse.json(rows);
    }

    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const rows = await sql`
      SELECT id, customer_name, rating, comment, created_at
      FROM   product_reviews
      WHERE  product_id = ${productId} AND status = 'approved'
      ORDER BY created_at DESC
    `;
    const count = rows.length;
    const avg   = count > 0
      ? Math.round((rows.reduce((s: number, r: Row) => s + Number(r.rating), 0) / count) * 10) / 10
      : null;

    return NextResponse.json({ reviews: rows, avg, count });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();

    const { productId, orderId, customerEmail, customerName, rating, comment } = await req.json();

    if (!productId || !orderId || !customerEmail || !customerName || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }

    const orders = await sql`
      SELECT id, items FROM orders
      WHERE  id = ${orderId}
        AND  customer_email = ${customerEmail}
        AND  status IN ('delivered', 'picked_up')
    `;
    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found or not yet delivered' }, { status: 403 });
    }

    const items = parseJson<{ product: { id: string } }[]>(orders[0].items as string);
    if (!items.some((item) => item.product?.id === productId)) {
      return NextResponse.json({ error: 'This product is not in that order' }, { status: 403 });
    }

    const dup = await sql`
      SELECT id FROM product_reviews
      WHERE order_id = ${orderId} AND product_id = ${productId}
    `;
    if (dup.length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this product for that order' }, { status: 409 });
    }

    const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await sql`
      INSERT INTO product_reviews (id, product_id, order_id, customer_email, customer_name, rating, comment)
      VALUES (${id}, ${productId}, ${orderId}, ${customerEmail}, ${customerName}, ${rating}, ${comment ?? ''})
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureTable();
    const { id, status } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existing = await sql`SELECT product_id FROM product_reviews WHERE id = ${id}`;
    if (existing.length === 0) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    const productId = existing[0].product_id as string;

    await sql`UPDATE product_reviews SET status = ${status} WHERE id = ${id}`;

    // Recompute and cache rating on the product
    const approved = await sql`
      SELECT rating FROM product_reviews
      WHERE  product_id = ${productId} AND status = 'approved'
    `;
    if (approved.length > 0) {
      const avg   = Math.round((approved.reduce((s: number, r: Row) => s + Number(r.rating), 0) / approved.length) * 10) / 10;
      const count = approved.length;
      await sql`
        UPDATE products
        SET    data = jsonb_set(
                 jsonb_set(data, '{rating}',      ${JSON.stringify(avg)}::jsonb),
                 '{reviewCount}', ${JSON.stringify(count)}::jsonb
               )
        WHERE  id = ${productId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
