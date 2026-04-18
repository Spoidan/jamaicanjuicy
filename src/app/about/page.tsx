import type { Metadata } from 'next';
import { siteContent } from '@/data/content';
import { AboutSection } from '@/components/AboutSection';
import { Footer } from '@/components/Footer';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'Learn about the passion, culture, and family behind Jamaican Juicy.',
};

export default function AboutPage() {
  const { about, contact } = siteContent;

  return (
    <>
      <div className="pt-24 pb-0">
        {/* Header */}
        <div className="section-pad max-w-4xl mx-auto text-center">
          <p className="text-mango font-semibold tracking-widest uppercase text-sm mb-2">Who We Are</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold gradient-text mb-6">
            {about.headline}
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            {about.story}
          </p>
        </div>

        {/* Founder block */}
        <div className="section-pad max-w-5xl mx-auto">
          <div className="card p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-juice">
              <Image
                src={about.founderImage}
                alt={about.founderName}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold mb-1">{about.founderName}</h2>
              <p className="text-mango font-semibold text-sm mb-4">Founder & Head Juicer</p>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{about.founderBio}</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-mango/10 dark:bg-mango/5 section-pad">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-4xl md:text-5xl font-display font-bold leading-tight text-neutral-900 dark:text-white">
              &ldquo;{about.mission}&rdquo;
            </p>
          </div>
        </div>
      </div>
      <Footer content={contact} />
    </>
  );
}
