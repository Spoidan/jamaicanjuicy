import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { MarqueeBanner } from '@/components/MarqueeBanner';
import { SocialSection } from '@/components/SocialSection';
import { AboutSection } from '@/components/AboutSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { OffersSection } from '@/components/OffersSection';
import { SubscriptionSection } from '@/components/SubscriptionSection';
import { Footer } from '@/components/Footer';
import { siteContent } from '@/data/content';
import sql, { parseJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

async function getSiteConfig(): Promise<AnyObj> {
  try {
    const rows = await sql`SELECT config FROM site_config WHERE id = 1`;
    const config: AnyObj = rows[0] ? parseJson<AnyObj>(rows[0].config) : {};
    return {
      hero: { ...siteContent.hero, ...(config.hero ?? {}) },
      marquee: config.marquee ?? ['🥭 Fresh Daily', '🌺 No Preservatives', '🍊 Real Fruit Only'],
      offers: config.offers ?? [],
      social: { instagram: 'jamaicanjuicy', tiktok: 'jamaicanjuicy', instagramUrl: '#', tiktokUrl: '#', ...(config.social ?? {}) },
      about: { ...siteContent.about, ...(config.about ?? {}) },
      contact: { ...siteContent.contact, ...(config.contact ?? {}) },
      testimonials: config.testimonials ?? [],
    };
  } catch {
    return {
      hero: siteContent.hero,
      marquee: ['🥭 Fresh Daily', '🌺 No Preservatives', '🍊 Real Fruit Only'],
      offers: [],
      social: { instagram: 'jamaicanjuicy', tiktok: 'jamaicanjuicy', instagramUrl: '#', tiktokUrl: '#' },
      about: siteContent.about,
      contact: siteContent.contact,
      testimonials: [],
    };
  }
}

async function getProducts(): Promise<AnyObj[]> {
  try {
    const rows = await sql`SELECT data FROM products ORDER BY created_at ASC`;
    if (rows.length > 0) return rows.map((r) => parseJson<AnyObj>(r.data));
  } catch { /* fall through */ }
  return (await import('@/data/products-data.json')).default as AnyObj[];
}

export default async function HomePage() {
  const [config, products] = await Promise.all([getSiteConfig(), getProducts()]);
  const featured = products.filter((p) => p.featured);

  return (
    <>
      <HeroSection config={config.hero} />
      <MarqueeBanner items={config.marquee} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FeaturedProducts products={featured as any} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <OffersSection offers={config.offers} products={products as any} />
      <SubscriptionSection />
      <SocialSection social={config.social} />
      <AboutSection content={config.about} />
      <TestimonialsSection testimonials={config.testimonials} />
      <Footer content={config.contact} />
    </>
  );
}
