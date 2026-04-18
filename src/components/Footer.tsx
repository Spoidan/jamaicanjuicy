import Link from 'next/link';
import type { SiteContent } from '@/types';
import { Phone, Mail, MapPin, Clock, Instagram } from 'lucide-react';

interface Props {
  content: SiteContent['contact'];
}

export function Footer({ content }: Props) {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🧃</span>
              <span className="font-display font-bold text-2xl gradient-text">Jamaican Juicy</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-xs">
              Handcrafted Jamaican juices made with real fruit, real culture, and real love. No fillers. No nonsense.
            </p>
            <div className="flex gap-4">
              <a href={`https://instagram.com/${content.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center hover:bg-mango transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={`https://tiktok.com/${content.tiktok}`} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center hover:bg-mango transition-colors text-lg font-bold">
                𝕋
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest mb-4 text-neutral-300">Shop</h3>
            <ul className="space-y-3 text-neutral-400 text-sm">
              {[
                ['All Juices', '/shop'],
                ['Fresh Blends', '/shop'],
                ['Seasonal', '/shop'],
                ['Bundles', '/shop'],
                ['Our Story', '/about'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-mango transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest mb-4 text-neutral-300">Contact</h3>
            <ul className="space-y-3 text-neutral-400 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-mango flex-shrink-0" />
                <a href={`tel:${content.phone}`} className="hover:text-white transition-colors">{content.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-mango flex-shrink-0" />
                <a href={`mailto:${content.email}`} className="hover:text-white transition-colors">{content.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-mango flex-shrink-0 mt-0.5" />
                <span>{content.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-mango flex-shrink-0" />
                <span>{content.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Jamaican Juicy. All rights reserved.</p>
          <p>Made with 🧃 love in Jamaica</p>
        </div>
      </div>
    </footer>
  );
}
