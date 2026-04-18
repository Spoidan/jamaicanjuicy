import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

interface Props {
  products: Product[];
}

export function FeaturedProducts({ products }: Props) {
  return (
    <section className="section-pad max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-2">The Good Stuff</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold gradient-text">
            Fan Favorites
          </h2>
        </div>
        <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-mango transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link href="/shop" className="btn-outline">
          View All Juices <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
