'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShieldCheck, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroConfig {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
}

interface Props {
  config: HeroConfig;
}

export function HeroSection({ config }: Props) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-amber-50">
      {/* Warm tropical blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #bbf7d0 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #fed7aa 0%, transparent 70%)', transform: 'translateY(-50%)' }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">

          {/* Left — Text */}
          <div>
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight mb-6 text-neutral-900"
            >
              <span>{config.headline.split('.')[0]}.</span>
              {config.headline.split('.').length > 1 && (
                <>
                  <br />
                  <span className="gradient-text">{config.headline.split('.').slice(1).join('.').trim()}</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-neutral-500 max-w-md mb-10 leading-relaxed"
            >
              {config.subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link href={config.ctaLink} className="btn-primary text-base px-7 py-3.5">
                {config.ctaText} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-neutral-300 text-neutral-700 text-base font-semibold hover:border-mango hover:text-mango transition-colors"
              >
                Our Story
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: Leaf, label: '100% Real Fruit' },
                { icon: ShieldCheck, label: 'Zero Preservatives' },
                { icon: Star, label: 'Made Fresh Daily' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-neutral-500 text-sm">
                  <Icon className="w-4 h-4 text-mango" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Product photo collage */}
          <div className="relative h-[480px] lg:h-[580px] hidden sm:block">
            {/* Soft glow behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-mango/20 rounded-full blur-3xl" />

            {/* Center feature card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-80 rounded-3xl overflow-hidden shadow-2xl z-20 ring-4 ring-white"
            >
              <Image src="/images/juice-3.jpeg" alt="Blue Lagoon" fill className="object-cover" sizes="224px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-sm">Blue Lagoon</p>
                <p className="text-white/70 text-xs">Butterfly Pea · Coconut · Kiwi</p>
              </div>
            </motion.div>

            {/* Top-left */}
            <motion.div
              initial={{ opacity: 0, x: -20, rotate: -4 }}
              animate={{ opacity: 1, x: 0, rotate: -4 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="absolute top-8 left-4 w-40 h-56 rounded-2xl overflow-hidden shadow-xl z-10 ring-2 ring-white"
            >
              <Image src="/images/juice-2.jpeg" alt="Hibiscus Punch" fill className="object-cover" sizes="160px" />
            </motion.div>

            {/* Top-right */}
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: 4 }}
              animate={{ opacity: 1, x: 0, rotate: 4 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute top-4 right-4 w-40 h-52 rounded-2xl overflow-hidden shadow-xl z-10 ring-2 ring-white"
            >
              <Image src="/images/juice-1.jpeg" alt="Activated Detox" fill className="object-cover" sizes="160px" />
            </motion.div>

            {/* Bottom-right */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 3 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="absolute bottom-4 right-10 w-44 h-56 rounded-2xl overflow-hidden shadow-xl z-10 ring-2 ring-white"
            >
              <Image src="/images/juice-4.jpeg" alt="Cane Coconut" fill className="object-cover" sizes="176px" />
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-amber-200/50 rounded-2xl overflow-hidden mt-8 border border-amber-200"
        >
          {[
            { value: '100%', label: 'Real Fruit' },
            { value: '4', label: 'Signature Flavors' },
            { value: '5K+', label: 'Happy Customers' },
            { value: '0', label: 'Preservatives' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/60 px-6 py-5 text-center">
              <p className="text-2xl font-display font-bold gradient-text">{value}</p>
              <p className="text-xs text-neutral-500 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom wave into next section */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L60 54C120 48 240 36 360 30C480 24 600 24 720 28C840 32 960 40 1080 40C1200 40 1320 32 1380 28L1440 24V60H0Z"
            fill="#FEFCE8" />
        </svg>
      </div>
    </section>
  );
}
