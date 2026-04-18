'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Mail, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

type Step = 'address' | 'info' | 'verify' | 'done';

interface Props {
  onComplete: () => void;
}

export function AuthFlow({ onComplete }: Props) {
  const { setUser, setVerified } = useAuthStore();
  const [step, setStep] = useState<Step>('address');
  const [postcode, setPostcode] = useState('');
  const [canDeliver, setCanDeliver] = useState<boolean | null>(null);
  const [checkingZone, setCheckingZone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', agreedToPolicy: false });
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // UK postcode validation
  function isValidUKPostcode(raw: string): boolean {
    return /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(raw.trim());
  }

  // Extract the outward code (area + district), e.g. "SW1A" from "SW1A 1AA"
  function outwardCode(raw: string): string {
    return raw.trim().toUpperCase().replace(/\s+/g, '').slice(0, -3);
  }

  // Step 1: Address / delivery zone check
  async function checkAddress() {
    setCheckingZone(true);
    setError('');

    if (!isValidUKPostcode(postcode)) {
      setError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      setCanDeliver(null);
      setCheckingZone(false);
      return;
    }

    const res = await fetch('/api/site-config');
    const config = await res.json();
    const zones: string[] = (config.deliveryZones || []).map((z: string) => z.toUpperCase());
    const outward = outwardCode(postcode);

    // Match if the outward code starts with any covered zone (e.g. zone "SW" covers "SW1A", "SW2", etc.)
    const match = zones.some((z) => outward.startsWith(z));
    setCanDeliver(match);
    setCheckingZone(false);
    if (match) setTimeout(() => setStep('info'), 800);
  }

  // Step 2: Send email code
  async function sendCode() {
    setSending(true);
    setError('');
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to send code'); setSending(false); return; }
    if (data.devCode) setDevCode(data.devCode); // dev mode only
    setSending(false);
    setStep('verify');
  }

  // Step 3: Verify code
  async function verifyCode() {
    setVerifying(true);
    setError('');
    const res = await fetch('/api/auth/send-code', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, code }),
    });
    const data = await res.json();
    setVerifying(false);
    if (!res.ok) { setError(data.error || 'Invalid code'); return; }
    // Persist user
    const firstAddrId = `addr_${Date.now()}`;
    setUser({ name: form.name, email: form.email, phone: form.phone, addresses: [{ id: firstAddrId, label: 'Home', address: form.address, postcode }], selectedAddressId: firstAddrId });
    setVerified(true);
    setStep('done');
    setTimeout(onComplete, 800);
  }

  const stepLabel = { address: 'Delivery Check', info: 'Your Info', verify: 'Verify Email', done: 'Verified!' };
  const stepNum = { address: 1, info: 2, verify: 3, done: 3 };
  const totalSteps = 3;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {Object.entries(stepLabel).filter(([k]) => k !== 'done').map(([key, label], i) => {
          const active = stepNum[step as Step] === i + 1;
          const done = stepNum[step as Step] > i + 1 || step === 'done';
          return (
            <div key={key} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${done ? 'bg-green-500 text-white' : active ? 'bg-mango text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'}`}>
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-mango' : done ? 'text-green-500' : 'text-neutral-400'}`}>{label}</span>
              {i < totalSteps - 1 && <div className={`flex-1 h-px ${done ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 — Address check */}
        {step === 'address' && (
          <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-mango" />Can we deliver to you?</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Enter your UK postcode and we&apos;ll check if we deliver to your area.</p>
            </div>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="e.g. SW1A 1AA or E1 6RF"
                value={postcode}
                onChange={(e) => { setPostcode(e.target.value); setCanDeliver(null); }}
                onKeyDown={(e) => e.key === 'Enter' && postcode && checkAddress()}
              />
              <button onClick={checkAddress} disabled={!postcode || checkingZone} className="btn-primary px-4 py-2.5 disabled:opacity-50">
                {checkingZone ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
              </button>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </p>
            )}

            <AnimatePresence>
              {canDeliver === true && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Great news — we deliver to {postcode.trim().toUpperCase()}!
                </motion.div>
              )}
              {canDeliver === false && !error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" /> Sorry, we don&apos;t cover {postcode.trim().toUpperCase()} yet.
                  </div>
                  <p className="text-xs text-neutral-500">Leave your email and we&apos;ll let you know when we expand to your area.</p>
                  <input className="input-field text-sm py-2" placeholder="Your email" />
                  <button className="btn-outline text-sm py-2 px-4">Notify Me</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Step 2 — User info */}
        {step === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-1 flex items-center gap-2"><User className="w-4 h-4 text-mango" />Your Details</h3>
              <p className="text-sm text-neutral-500">We need a few details to complete your order.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field" placeholder="Full Name *" />
              </div>
              <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="Email *" />
              <input required value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input-field" placeholder="Phone *" />
              <div className="col-span-2">
                <input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  className="input-field" placeholder="Delivery Address" />
              </div>
            </div>

            {/* Privacy policy checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.agreedToPolicy}
                onChange={(e) => setForm(f => ({ ...f, agreedToPolicy: e.target.checked }))}
                className="mt-0.5 w-4 h-4 accent-mango rounded"
              />
              <span className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                I have read and agree to the{' '}
                <a href="/privacy" target="_blank" className="text-mango underline hover:no-underline">Privacy Policy</a>{' '}
                and{' '}
                <a href="/terms" target="_blank" className="text-mango underline hover:no-underline">Terms of Service</a>.
                My data will only be used to process this order.
              </span>
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={sendCode}
              disabled={!form.name || !form.email || !form.phone || !form.agreedToPolicy || sending}
              className="btn-primary w-full disabled:opacity-50"
            >
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</> : 'Send Verification Code'}
            </button>
          </motion.div>
        )}

        {/* Step 3 — Email verify */}
        {step === 'verify' && (
          <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-1 flex items-center gap-2"><Mail className="w-4 h-4 text-mango" />Verify Your Email</h3>
              <p className="text-sm text-neutral-500">We sent a 6-digit code to <strong className="text-neutral-700 dark:text-neutral-300">{form.email}</strong></p>
            </div>

            {devCode && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 text-sm">
                <span className="font-semibold text-yellow-700 dark:text-yellow-400">Dev mode:</span>{' '}
                <span className="font-mono font-bold text-yellow-800 dark:text-yellow-300">{devCode}</span>
              </div>
            )}

            {/* 6-digit code input */}
            <div>
              <input
                className="input-field text-center text-2xl font-mono tracking-[0.5em] py-4"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && verifyCode()}
                placeholder="••••••"
              />
            </div>

            {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}

            <button onClick={verifyCode} disabled={code.length !== 6 || verifying} className="btn-primary w-full disabled:opacity-50">
              {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify & Continue'}
            </button>

            <button onClick={() => { setSending(false); setStep('info'); }} className="w-full text-sm text-neutral-500 hover:text-mango transition-colors">
              ← Change email
            </button>
          </motion.div>
        )}

        {/* Done */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-bold text-lg">Identity Verified!</p>
            <p className="text-sm text-neutral-500">Taking you to checkout...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
