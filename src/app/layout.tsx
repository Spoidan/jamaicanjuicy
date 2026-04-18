import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { SignInDrawer } from '@/components/SignInDrawer';
import { Toaster } from '@/components/Toaster';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://jamaicanjuicy.com'),
  title: {
    default: 'Jamaican Juicy | Fresh Handcrafted Jamaican Juices',
    template: '%s | Jamaican Juicy',
  },
  description: 'Authentic handcrafted Jamaican juices made with real fruit, real culture, and real love. Fresh, bold, and preservative-free.',
  keywords: ['jamaican juice', 'fresh juice', 'sorrel', 'mango juice', 'tropical drinks'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jamaicanjuicy.com',
    siteName: 'Jamaican Juicy',
    title: 'Jamaican Juicy | Fresh Handcrafted Jamaican Juices',
    description: 'Authentic handcrafted Jamaican juices. Real fruit. Real culture. Real love.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Jamaican Juicy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jamaican Juicy | Fresh Handcrafted Jamaican Juices',
    description: 'Authentic handcrafted Jamaican juices. Real fruit. Real culture. Real love.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream text-neutral-900 font-body">
        {/* Banner + Navbar share one fixed container so they stack naturally */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnnouncementBanner />
          <Navbar />
        </div>
        <main>{children}</main>
        <CartDrawer />
        <SignInDrawer />
        <Toaster />
      </body>
    </html>
  );
}
