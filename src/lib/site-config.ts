import { siteContent } from '@/data/content';
import sql, { parseJson } from '@/lib/db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export async function getSiteConfig(): Promise<AnyObj> {
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
