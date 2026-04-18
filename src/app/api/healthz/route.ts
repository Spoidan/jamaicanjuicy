import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const [ping, productCount, configCount] = await Promise.all([
      sql`SELECT 1 as ok`,
      sql`SELECT COUNT(*) as n FROM products`,
      sql`SELECT COUNT(*) as n FROM site_config`,
    ]);
    const sampleRows = await sql`SELECT id, data FROM products LIMIT 1`;
    const sample = sampleRows[0] ?? null;
    return NextResponse.json({
      db: 'ok',
      products: Number(productCount[0].n),
      site_config_rows: Number(configCount[0].n),
      sample_product_keys: sample ? Object.keys(sample.data ?? sample) : null,
      sample_id: sample?.id ?? null,
      env: { DATABASE_URL: !!process.env.DATABASE_URL, ADMIN_KEY: !!process.env.ADMIN_KEY },
    });
  } catch (err) {
    return NextResponse.json({ db: 'error', error: String(err) }, { status: 500 });
  }
}
