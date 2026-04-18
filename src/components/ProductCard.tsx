'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';

interface Props {
  product: Product;
  index?: number;
}

const BADGE_COLORS: Record<string, string> = {
  'Best Seller':  'bg-mango text-white',
  'New':          'bg-lime text-white',
  'Limited':      'bg-guava text-white',
  'Seasonal Fav': 'bg-juice-600 text-white',
  'Best Value':   'bg-green-500 text-white',
};

export function ProductCard({ product, index = 0 }: Props) {
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(1);
  const [liked, setLiked] = useState(false);
  const { addItem } = useCartStore();

  const selectedSize = product.sizes[selectedSizeIdx] ?? product.sizes[0];

  function handleAddToCart() {
    addItem(product, selectedSize);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card group flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-neutral-50 dark:bg-neutral-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className={cn('badge text-[10px]', BADGE_COLORS[product.badge] ?? 'bg-neutral-800 text-white')}>
              {product.badge}
            </span>
          )}
          {product.originalPrice && (
            <span className="badge bg-red-500 text-white text-[10px]">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
          aria-label="Wishlist"
        >
          <Heart className={cn('w-4 h-4 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-neutral-400')} />
        </button>
        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-full">Sold Out</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        {/* Name + rating */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-lg leading-tight">{product.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-mango text-mango" />
              <span className="text-xs font-semibold">{product.rating}</span>
              <span className="text-xs text-neutral-400">({product.reviewCount})</span>
            </div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{product.description}</p>
        </div>

        {/* Flavors */}
        <div className="flex flex-wrap gap-1">
          {product.flavor.map((f) => (
            <span key={f} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-mango/10 dark:bg-mango/20 text-mango">
              {f}
            </span>
          ))}
        </div>

        {/* Size selector */}
        {product.sizes.length > 1 && (
          <div className="flex gap-1.5">
            {product.sizes.map((size, i) => (
              <button
                key={size.label}
                onClick={() => setSelectedSizeIdx(i)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all',
                  selectedSizeIdx === i
                    ? 'border-mango bg-mango/10 text-mango'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-mango/50'
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatPrice(selectedSize.price)}
            </span>
            {product.originalPrice && selectedSizeIdx === product.sizes.indexOf(selectedSize) && (
              <span className="ml-2 text-sm text-neutral-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="btn-primary py-2.5 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
