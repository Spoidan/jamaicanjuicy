import type { Metadata } from 'next';
import { ShopClient } from '@/components/ShopClient';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Shop Fresh Juices',
  description: 'Browse all Jamaican Juicy flavors — fresh, seasonal, and bundle options available.',
};

async function getProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store' });
    return res.json();
  } catch {
    return (await import('@/data/products-data.json')).default;
  }
}

async function getContact() {
  try {
    const res = await fetch('http://localhost:3000/api/site-config', { cache: 'no-store' });
    const config = await res.json();
    return config.contact;
  } catch {
    const { siteContent } = await import('@/data/content');
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
          <ShopClient products={products} />
        </div>
      </div>
      <Footer content={contact} />
    </>
  );
}
