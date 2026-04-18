'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}

interface Props {
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 't1', name: 'Deja W.', location: 'Miami, FL', rating: 5, text: 'The Blue Lagoon is EVERYTHING. I\'ve never seen anything so beautiful and it tastes even better than it looks.', avatar: '🧕🏾' },
  { id: 't2', name: 'Marcus T.', location: 'Brooklyn, NY', rating: 5, text: 'The Hibiscus Punch reminds me of sorrel back home. My whole family is obsessed.', avatar: '👨🏿' },
  { id: 't3', name: 'Sarah K.', location: 'Atlanta, GA', rating: 5, text: 'I do the Activated Detox every Monday. It\'s become a ritual. Honestly changed my relationship with wellness.', avatar: '👩🏽' },
  { id: 't4', name: 'Calvin R.', location: 'Toronto, ON', rating: 5, text: 'Cane & Coconut is elite. I ordered 3 bottles and they were gone before I got home.', avatar: '🧔🏾' },
  { id: 't5', name: 'Aisha M.', location: 'Orlando, FL', rating: 5, text: 'The subscription saves me every week. Fresh juice without thinking — what more could you want?', avatar: '👩🏿‍🦱' },
  { id: 't6', name: 'Devon P.', location: 'Houston, TX', rating: 5, text: '10/10 no notes. Best juice I\'ve had outside of Jamaica. Fast delivery too.', avatar: '👨🏾' },
];

export function TestimonialsSection({ testimonials = DEFAULT_TESTIMONIALS }: Props) {
  const list = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950 section-pad">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-2">Reviews</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold gradient-text mb-3">The People Love It</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-mango text-mango" />)}</div>
            <span className="font-bold text-lg">4.9</span>
            <span className="text-neutral-500">(800+ reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {list.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{t.avatar}</span>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.location}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-mango text-mango" />)}
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
