import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { MarqueeBanner } from '@/components/MarqueeBanner';
import { SocialSection } from '@/components/SocialSection';
import { AboutSection } from '@/components/AboutSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { OffersSection } from '@/components/OffersSection';
import { SubscriptionSection } from '@/components/SubscriptionSection';
import { Footer } from '@/components/Footer';

async function getSiteConfig() {
  try {
    const res = await fetch('http://localhost:3000/api/site-config', { cache: 'no-store' });
    return res.json();
  } catch {
    const { siteContent } = await import('@/data/content');
    const products = await import('@/data/products-data.json');
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

async function getProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store' });
    return res.json();
  } catch {
    return (await import('@/data/products-data.json')).default;
  }
}

export default async function HomePage() {
  const [config, products] = await Promise.all([getSiteConfig(), getProducts()]);
  const featured = products.filter((p: { featured: boolean }) => p.featured);

  return (
    <>
      <HeroSection config={config.hero} />
      <MarqueeBanner items={config.marquee} />
      <FeaturedProducts products={featured} />
      <OffersSection offers={config.offers} products={products} />
      <SubscriptionSection />
      <SocialSection social={config.social} />
      <AboutSection content={config.about} />
      <TestimonialsSection testimonials={config.testimonials} />
      <Footer content={config.contact} />
    </>
  );
}
