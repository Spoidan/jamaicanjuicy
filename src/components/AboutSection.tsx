'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { SiteContent } from '@/types';
import { Leaf, Heart, Zap } from 'lucide-react';

interface Props {
  content: SiteContent['about'];
}

const VALUES = [
  { icon: Leaf, title: 'All Natural', body: 'Every ingredient is whole, real, and unprocessed. We never use artificial flavors, colors, or preservatives.' },
  { icon: Heart, title: 'Made with Love', body: 'Every batch is crafted with the care of a home kitchen and the consistency of a professional operation.' },
  { icon: Zap, title: 'Fresh Daily', body: 'We make in small batches so you always get the freshest possible juice, not something that\'s been sitting on a shelf.' },
];

export function AboutSection({ content }: Props) {
  return (
    <section className="section-pad max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative h-80 sm:h-[500px] rounded-3xl overflow-hidden">
            <Image
              src={content.founderImage}
              alt={content.founderName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white font-display font-bold text-xl">{content.founderName}</p>
              <p className="text-white/80 text-sm">Founder & Head Juicer</p>
            </div>
          </div>
          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 bg-mango text-white rounded-2xl p-4 shadow-juice-lg">
            <p className="text-2xl font-bold">5K+</p>
            <p className="text-xs font-medium opacity-90">Happy Customers</p>
          </div>
        </motion.div>

        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-3">Our Story</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 leading-tight">
            {content.headline}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">{content.story}</p>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">{content.mission}</p>

          {/* Values */}
          <div className="space-y-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-mango/10 dark:bg-mango/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-mango" />
                </div>
                <div>
                  <p className="font-semibold mb-0.5">{title}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
