'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

interface Offer {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
}

// Extract the first Tailwind from-color as a hex for inline style fallback
const GRADIENT_BG: Record<string, string> = {
  'from-orange-500': '#f97316',
  'from-teal-500':   '#14b8a6',
  'from-pink-500':   '#ec4899',
  'from-amber-500':  '#f59e0b',
  'from-green-500':  '#22c55e',
  'from-purple-500': '#a855f7',
  'from-blue-500':   '#3b82f6',
  'from-red-500':    '#ef4444',
};

function gradientToBg(color: string): string {
  const fromClass = color.split(' ').find((c) => c.startsWith('from-')) ?? '';
  return GRADIENT_BG[fromClass] ?? '#FF9B3D';
}

export function AnnouncementBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const key = 'jj-banner-dismissed-v2';
    if (sessionStorage.getItem(key)) return;

    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => {
        const pinnedId: string = data.pinnedBannerOfferId || '';
        if (!pinnedId) return;
        const found = (data.offers as Offer[])?.find((o) => o.id === pinnedId);
        if (found) { setOffer(found); setVisible(true); }
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem('jj-banner-dismissed-v2', '1');
  }

  if (!visible || !offer) return null;

  const bg = gradientToBg(offer.color);

  return (
    <div
      className="relative flex items-center justify-center gap-2 px-10 py-2.5 text-sm font-semibold text-white text-center"
      style={{ backgroundColor: bg }}
    >
      <span>{offer.emoji}</span>
      <span>{offer.title} — {offer.description}</span>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        aria-label="Close banner"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  );
}
