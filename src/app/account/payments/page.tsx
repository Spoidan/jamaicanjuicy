'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft, Lock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PaymentMethodsPage() {
  const { verified } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!verified) router.push('/');
  }, [verified, router]);

  if (!verified) return null;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl">Payment Methods</h1>
            <p className="text-sm text-neutral-500">Manage your saved cards</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-mango/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-mango" />
          </div>
          <p className="font-semibold text-lg mb-1">No saved payment methods</p>
          <p className="text-neutral-400 text-sm max-w-xs mx-auto mb-6">
            Saved cards will appear here once Stripe payments are enabled.
          </p>
          <button disabled className="btn-primary opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4" /> Add Card
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-300 mt-6">
            <Lock className="w-3 h-3" />
            <span>Secured by Stripe — card details are never stored on our servers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
