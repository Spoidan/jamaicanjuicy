'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';

type OfferAction = 'product' | 'shop' | 'category' | 'about';

interface Offer {
  id: string;
  emoji: string;
  title: string;
  description: string;
  cta: string;
  color: string;
  productId: string;
  actionType?: OfferAction;
  category?: string;
}

interface Product {
  id: string;
  name: string;
  sizes: { label: string; ml: number; price: number }[];
  [key: string]: unknown;
}

interface Props {
  offers?: Offer[];
  products?: Product[];
}

const DEFAULT_OFFERS: Offer[] = [
  { id: 'o1', emoji: '🎉', title: 'First Order Deal', description: 'Get 20% off your first order when you sign up.', cta: 'Claim Offer', color: 'from-orange-500 to-amber-400', productId: 'blue-lagoon' },
  { id: 'o2', emoji: '💧', title: 'Detox Bundle', description: '2× Activated Detox + 1× Blue Lagoon. Reset your body, island style.', cta: 'Add to Cart', color: 'from-teal-500 to-green-400', productId: 'activated-detox' },
  { id: 'o3', emoji: '🌺', title: 'Hibiscus Special', description: 'Our Hibiscus Pineapple Punch is selling fast. Limited quantities.', cta: 'Shop Now', color: 'from-pink-500 to-rose-400', productId: 'hibiscus-pineapple-punch' },
];

export function OffersSection({ offers = DEFAULT_OFFERS, products = [] }: Props) {
  const { addItem } = useCartStore();

  function handleAddProduct(productId: string) {
    const product = products.find((p) => p.id === productId) as Product | undefined;
    if (product) {
      const size = product.sizes[1] ?? product.sizes[0];
      addItem(product as unknown as Parameters<typeof addItem>[0], size);
    }
  }

  function resolveAction(offer: Offer): { href: string | null; onClick?: () => void } {
    const type = offer.actionType ?? 'product';
    if (type === 'shop')     return { href: '/shop' };
    if (type === 'about')    return { href: '/about' };
    if (type === 'category') return { href: offer.category ? `/shop?category=${offer.category}` : '/shop' };
    return { href: null, onClick: () => handleAddProduct(offer.productId) };
  }

  if (offers.length === 0) return null;

  return (
    <section className="section-pad max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-2">Deals</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold gradient-text">Today&apos;s Offers</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {offers.map((offer, i) => {
          const action = resolveAction(offer);
          const btnClass = 'mt-auto self-start bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors border border-white/30';
          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`bg-gradient-to-br ${offer.color} rounded-3xl p-6 sm:p-8 flex flex-col gap-4`}
            >
              <span className="text-5xl">{offer.emoji}</span>
              <div>
                <h3 className="font-display font-bold text-xl mb-2 text-white">{offer.title}</h3>
                <p className="text-sm leading-relaxed opacity-90 text-white">{offer.description}</p>
              </div>
              {action.href
                ? <Link href={action.href} className={btnClass}>{offer.cta}</Link>
                : <button onClick={action.onClick} className={btnClass}>{offer.cta}</button>}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
