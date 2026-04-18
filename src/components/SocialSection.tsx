'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Instagram } from 'lucide-react';

interface SocialConfig {
  instagram: string;
  tiktok: string;
  instagramUrl: string;
  tiktokUrl: string;
}

interface Props {
  social: SocialConfig;
}

function TikTokIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.28 8.28 0 004.84 1.55V7.07a4.85 4.85 0 01-1.07-.38z" />
    </svg>
  );
}

const SOCIAL_CARDS = [
  {
    key: 'instagram',
    label: 'Instagram',
    description: 'Behind-the-scenes, new drops, and community love.',
    cta: 'Follow on Instagram',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    icon: Instagram,
    getHandle: (s: SocialConfig) => `@${s.instagram}`,
    getUrl: (s: SocialConfig) => s.instagramUrl,
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    description: 'Watch us make your favorite blends from scratch, every batch.',
    cta: 'Follow on TikTok',
    gradient: 'from-neutral-900 via-neutral-800 to-neutral-700',
    icon: TikTokIcon,
    getHandle: (s: SocialConfig) => `@${s.tiktok}`,
    getUrl: (s: SocialConfig) => s.tiktokUrl,
  },
];

export function SocialSection({ social }: Props) {
  return (
    <section className="section-pad max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-2">Follow Along</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold gradient-text mb-3">
          Join the Community
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          See how it&apos;s made, catch exclusive offers, and be part of the Jamaican Juicy family.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {SOCIAL_CARDS.map(({ key, label, description, cta, gradient, icon: Icon, getHandle, getUrl }, i) => (
          <motion.a
            key={key}
            href={getUrl(social)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 flex flex-col gap-4 min-h-[220px] hover:scale-[1.02] transition-transform duration-300`}
          >
            {/* Subtle shine */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-3xl" />

            <div className="relative z-10 flex items-center justify-between">
              <Icon className="text-white" />
              <span className="text-white/60 text-sm font-medium">{getHandle(social)}</span>
            </div>

            <div className="relative z-10 flex-1">
              <h3 className="text-white font-display font-bold text-2xl mb-2">{label}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{description}</p>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-white font-semibold text-sm">
              {cta} <ExternalLink className="w-4 h-4" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
