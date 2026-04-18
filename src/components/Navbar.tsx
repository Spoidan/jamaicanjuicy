'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'Our Story' },
];

export function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  const { itemCount, toggleCart } = useCartStore();
  const { openSignIn, verified, user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = itemCount();

  return (
    <header
      className={cn(
        'transition-all duration-300',
        scrolled
          ? 'bg-cream/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="text-2xl">🧃</span>
          <span className="gradient-text">Jamaican Juicy</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-sm font-semibold transition-colors',
                pathname === href
                  ? 'text-mango'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sign In / Account — text on desktop, icon on mobile */}
          <button
            onClick={openSignIn}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-mango hover:text-mango transition-colors"
            aria-label={verified ? 'My account' : 'Sign in'}
          >
            {verified && user ? (
              <>
                <span className="w-5 h-5 rounded-full bg-mango text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                {user.name.split(' ')[0]}
              </>
            ) : (
              <>
                <UserCircle className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
          <button
            onClick={openSignIn}
            className="md:hidden p-2 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label={verified ? 'My account' : 'Sign in'}
          >
            {verified && user ? (
              <span className="w-7 h-7 rounded-full bg-mango text-white text-xs font-bold flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserCircle className="w-5 h-5 text-neutral-700" />
            )}
          </button>

          <button
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5 text-neutral-700" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-mango text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-neutral-100 px-4 pb-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'block py-3 text-base font-semibold border-b border-neutral-100',
                pathname === href ? 'text-mango' : 'text-neutral-700'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
