'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface Props {
  products: Product[];
}

type Category = 'all' | Product['category'];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'All Juices' },
  { value: 'fresh', label: 'Fresh Blends' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'bundle', label: 'Bundles' },
  { value: 'bottled', label: 'Bottled' },
];

export function ShopClient({ products }: Props) {
  const [category, setCategory] = useState<Category>('all');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  let filtered = category === 'all' ? products : products.filter((p) => p.category === category);

  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap flex-1">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold border transition-all',
                category === value
                  ? 'bg-mango border-mango text-white shadow-juice'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-mango/60'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="input-field w-auto py-2 px-4 text-sm"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-neutral-500 py-20">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
