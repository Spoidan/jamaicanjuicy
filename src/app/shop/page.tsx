import type { Metadata } from 'next';
import { ShopClient } from '@/components/ShopClient';
import { Footer } from '@/components/Footer';
import { siteContent } from '@/data/content';
import sql, { parseJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop Fresh Juices',
  description: 'Browse all Jamaican Juicy flavors — fresh, seasonal, and bundle options available.',
};

async function getProducts() {
  try {
    const rows = await sql`SELECT data FROM products ORDER BY created_at ASC`;
    if (rows.length > 0) return rows.map((r) => parseJson(r.data));
  } catch { /* fall through */ }
  return (await import('@/data/products-data.json')).default;
}

async function getContact() {
  try {
    const rows = await sql`SELECT config FROM site_config WHERE id = 1`;
    const cfg = rows[0] ? parseJson<Record<string, unknown>>(rows[0].config) : {};
    return (cfg.contact as typeof siteContent.contact) ?? siteContent.contact;
  } catch {
    return siteContent.contact;
  }
}

export default async function ShopPage() {
  const [products, contact] = await Promise.all([getProducts(), getContact()]);

  return (
    <>
      <div className="pt-20 min-h-screen">
        <div className="section-pad max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-2">The Menu</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">Fresh Every Day</h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-lg">
              All juices are made to order. No preservatives. No shortcuts. Just fruit.
            </p>
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ShopClient products={products as any} />
        </div>
      </div>
      <Footer content={contact} />
    </>
  );
}
