'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, UserCircle, LogOut, MapPin, Mail, Phone, Eye, EyeOff,
  Package, CreditCard, ChevronRight, Loader2, CheckCircle,
  AlertCircle, ArrowLeft, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';

type TopMode = 'login' | 'register';
type RegStep = 'postcode' | 'details' | 'password' | 'review' | 'verify' | 'done';

function isValidUKPostcode(pc: string) {
  return /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(pc.trim());
}
function outwardCode(pc: string) {
  return pc.trim().toUpperCase().replace(/\s+/g, '').slice(0, -3);
}
function pwStrength(p: string): { level: 'weak' | 'medium' | 'strong'; label: string } {
  if (p.length < 8) return { level: 'weak', label: 'Too short (min 8 chars)' };
  const score = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
  if (score >= 4 && p.length >= 10) return { level: 'strong', label: 'Strong' };
  if (score >= 2) return { level: 'medium', label: 'Medium' };
  return { level: 'weak', label: 'Weak — add uppercase, numbers or symbols' };
}

const STEP_LABELS = ['Delivery', 'Details', 'Password', 'Review', 'Verify'] as const;
const REG_STEPS: RegStep[] = ['postcode', 'details', 'password', 'review', 'verify'];

function StepBar({ current }: { current: RegStep }) {
  const idx = REG_STEPS.indexOf(current);
  return (
    <div className="flex gap-1.5 mb-4">
      {STEP_LABELS.map((_, i) => (
        <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= idx ? 'bg-mango' : 'bg-neutral-200'}`} />
      ))}
    </div>
  );
}

function Drawer({ open, onClose, title, onBack, children }: {
  open: boolean; onClose: () => void; title: string; onBack?: () => void; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                {onBack && (
                  <button onClick={onBack} className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-neutral-600" />
                  </button>
                )}
                <h2 className="font-display font-bold text-xl">{title}</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SignInDrawer() {
  const { signInOpen, closeSignIn, user, verified, logout, setUser, setVerified } = useAuthStore();
  const { items, openCart } = useCartStore();
  const [mode, setMode] = useState<TopMode>('login');
  const [regStep, setRegStep] = useState<RegStep>('postcode');

  /* ── Login state ── */
  const [lEmail, setLEmail] = useState('');
  const [lPassword, setLPassword] = useState('');
  const [showLPw, setShowLPw] = useState(false);
  const [lError, setLError] = useState('');
  const [lLoading, setLLoading] = useState(false);

  /* ── Register state ── */
  const [postcode, setPostcode] = useState('');
  const [canDeliver, setCanDeliver] = useState<boolean | null>(null);
  const [checkingZone, setCheckingZone] = useState(false);
  const [rForm, setRForm] = useState({ name: '', email: '', phone: '', address: '', postcode: '', agreedToPolicy: false });
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [rError, setRError] = useState('');
  const [rLoading, setRLoading] = useState(false);

  /* Reset on close */
  useEffect(() => {
    if (!signInOpen) {
      const t = setTimeout(() => {
        setMode('login'); setRegStep('postcode');
        setLEmail(''); setLPassword(''); setLError('');
        setPostcode(''); setCanDeliver(null);
        setRForm({ name: '', email: '', phone: '', address: '', postcode: '', agreedToPolicy: false });
        setPassword(''); setConfirmPw('');
        setVerifyCode(''); setDevCode(''); setRError('');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [signInOpen]);

  function handleClose() { closeSignIn(); }

  /* ── ACCOUNT VIEW (signed in) ── */
  if (verified && user) {
    return (
      <Drawer open={signInOpen} onClose={handleClose} title="My Account">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-mango flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight truncate">{user.name}</p>
              <p className="text-sm text-neutral-500 truncate">{user.email}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>

          {[
            { icon: Package, label: 'My Orders', sub: 'View your order history', href: '/account/orders' },
            { icon: MapPin, label: 'Delivery Addresses', sub: 'Manage saved addresses', href: '/account/addresses' },
          ].map(({ icon: Icon, label, sub, href }) => (
            <Link key={href} href={href} onClick={handleClose}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:border-mango/30 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-mango/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-mango" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-neutral-400">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-mango transition-colors" />
            </Link>
          ))}

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
            {(() => {
              const sel = user.addresses?.find((a) => a.id === user.selectedAddressId);
              return [
                { icon: Mail, label: 'Email', value: user.email },
                { icon: Phone, label: 'Phone', value: user.phone },
                { icon: MapPin, label: 'Delivery Address', value: sel ? `${sel.address} (${sel.postcode})` : '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 px-4 py-3">
                  <Icon className="w-4 h-4 text-mango mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-neutral-700 break-words">{value}</p>
                  </div>
                </div>
              ));
            })()}
          </div>

          <button onClick={() => { logout(); handleClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </Drawer>
    );
  }

  /* ── LOGIN ── */
  async function handleLogin() {
    setLError(''); setLLoading(true);
    const r = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lEmail, password: lPassword }),
    });
    const data = await r.json();
    setLLoading(false);
    if (!r.ok) { setLError(data.error || 'Login failed'); return; }
    setUser({ name: data.user.name, email: data.user.email, phone: data.user.phone, addresses: data.user.addresses ?? [], selectedAddressId: data.user.selectedAddressId ?? null });
    setVerified(true);
    handleClose();
    if (items.length > 0) setTimeout(() => openCart(), 300);
  }

  if (mode === 'login') {
    return (
      <Drawer open={signInOpen} onClose={handleClose} title="Sign In">
        <AnimatePresence mode="wait">
          <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-neutral-500 text-sm">Welcome back! Sign in to your account.</p>
            <div className="space-y-3">
              <input type="email" className="input-field" placeholder="Email address"
                value={lEmail} onChange={(e) => setLEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <div className="relative">
                <input type={showLPw ? 'text' : 'password'} className="input-field pr-11" placeholder="Password"
                  value={lPassword} onChange={(e) => setLPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShowLPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600">
                  {showLPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {lError && <p className="flex items-center gap-1.5 text-red-500 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{lError}</p>}
            <button onClick={handleLogin} disabled={!lEmail || !lPassword || lLoading} className="btn-primary w-full py-3 disabled:opacity-50">
              {lLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
            <p className="text-center text-xs text-neutral-400">
              Forgot password?{' '}
              <span className="text-mango cursor-pointer hover:underline"
                onClick={() => setLError('Password reset coming soon — contact hello@jamaicanjuicy.com')}>
                Reset it
              </span>
            </p>
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
            <button onClick={() => { setMode('register'); setRegStep('postcode'); }}
              className="w-full py-3 rounded-full border-2 border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-mango hover:text-mango transition-colors">
              Create an Account
            </button>
          </motion.div>
        </AnimatePresence>
      </Drawer>
    );
  }

  /* ── REGISTER ── */

  async function checkPostcode() {
    setCheckingZone(true); setRError('');
    if (!isValidUKPostcode(postcode)) {
      setRError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      setCanDeliver(null); setCheckingZone(false); return;
    }
    const cfg = await (await fetch('/api/site-config')).json();
    const zones: string[] = (cfg.deliveryZones || []).map((z: string) => z.toUpperCase());
    const match = zones.some((z) => outwardCode(postcode).startsWith(z));
    setCanDeliver(match); setCheckingZone(false);
    if (match) {
      setRForm((f) => ({ ...f, postcode: postcode.trim().toUpperCase() }));
      setTimeout(() => setRegStep('details'), 700);
    }
  }

  async function revalidatePostcode(pc: string) {
    if (!isValidUKPostcode(pc)) { setRError('Invalid UK postcode'); return; }
    const cfg = await (await fetch('/api/site-config')).json();
    const zones: string[] = (cfg.deliveryZones || []).map((z: string) => z.toUpperCase());
    const match = zones.some((z) => outwardCode(pc).startsWith(z));
    if (!match) { setRError(`Sorry, we don't deliver to ${pc.trim().toUpperCase()} yet.`); return; }
    setRError('');
    setRForm((f) => ({ ...f, postcode: pc.trim().toUpperCase() }));
  }

  async function sendCode() {
    setRLoading(true); setRError('');
    const r = await fetch('/api/auth/send-code', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rForm.email }),
    });
    const data = await r.json();
    setRLoading(false);
    if (!r.ok) { setRError(data.error || 'Failed to send code'); return; }
    if (data.devCode) setDevCode(data.devCode);
    setRegStep('verify');
  }

  async function handleVerify() {
    setRLoading(true); setRError('');
    const vr = await fetch('/api/auth/send-code', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rForm.email, code: verifyCode }),
    });
    if (!vr.ok) { setRError((await vr.json()).error || 'Invalid code'); setRLoading(false); return; }

    const rr = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: rForm.name, email: rForm.email, phone: rForm.phone,
        address: rForm.address, postcode: rForm.postcode, password,
      }),
    });
    const rd = await rr.json();
    setRLoading(false);
    if (!rr.ok) { setRError(rd.error || 'Registration failed'); return; }
    setUser({ name: rd.user.name, email: rd.user.email, phone: rd.user.phone, addresses: rd.user.addresses ?? [], selectedAddressId: rd.user.selectedAddressId ?? null });
    setVerified(true);
    setRegStep('done');
    setTimeout(() => { handleClose(); if (items.length > 0) setTimeout(() => openCart(), 300); }, 1200);
  }

  const str = pwStrength(password);

  function backLabel() {
    if (regStep === 'details') setRegStep('postcode');
    else if (regStep === 'password') setRegStep('details');
    else if (regStep === 'review') setRegStep('password');
    else if (regStep === 'verify') setRegStep('review');
    else setMode('login');
  }

  return (
    <Drawer
      open={signInOpen} onClose={handleClose}
      title={regStep === 'done' ? 'Welcome!' : 'Create Account'}
      onBack={regStep !== 'done' ? backLabel : undefined}
    >
      <AnimatePresence mode="wait">

        {/* STEP 1 — postcode */}
        {regStep === 'postcode' && (
          <motion.div key="pc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-sm text-neutral-500">First, let's check if we deliver to you.</p>
            <StepBar current="postcode" />
            <div className="flex gap-2">
              <input className="input-field flex-1 uppercase font-mono" placeholder="e.g. SW1A 1AA"
                value={postcode}
                onChange={(e) => { setPostcode(e.target.value); setCanDeliver(null); setRError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && postcode && checkPostcode()} />
              <button onClick={checkPostcode} disabled={!postcode || checkingZone} className="btn-primary px-4 disabled:opacity-50">
                {checkingZone ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
              </button>
            </div>
            {rError && <p className="flex items-center gap-1.5 text-red-500 text-sm"><AlertCircle className="w-4 h-4" />{rError}</p>}
            <AnimatePresence>
              {canDeliver === true && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Great — we deliver to {postcode.trim().toUpperCase()}!
                </motion.p>
              )}
              {canDeliver === false && !rError && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" /> Sorry, we don't cover {postcode.trim().toUpperCase()} yet.
                </motion.p>
              )}
            </AnimatePresence>
            <button onClick={() => setMode('login')} className="w-full text-sm text-neutral-400 hover:text-mango transition-colors text-center pt-2">
              Already have an account? Sign In
            </button>
          </motion.div>
        )}

        {/* STEP 2 — details */}
        {regStep === 'details' && (
          <motion.div key="det" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <p className="text-sm text-neutral-500">Step 2 of 5 — Your details</p>
            <StepBar current="details" />


            <input className="input-field" placeholder="Full Name *" value={rForm.name}
              onChange={(e) => setRForm((f) => ({ ...f, name: e.target.value }))} />
            <input type="email" className="input-field" placeholder="Email Address *" value={rForm.email}
              onChange={(e) => setRForm((f) => ({ ...f, email: e.target.value }))} />
            <input className="input-field" placeholder="Phone Number *" value={rForm.phone}
              onChange={(e) => setRForm((f) => ({ ...f, phone: e.target.value }))} />

            {/* Postcode — locked from step 1 */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide block mb-1">Postcode</label>
              <div className="input-field bg-neutral-50 text-neutral-500 font-mono uppercase flex items-center justify-between cursor-not-allowed select-none">
                <span>{rForm.postcode}</span>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified ✓</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">To change your postcode, go back to step 1.</p>
            </div>

            {/* Full address — free text */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide block mb-1">Full Address *</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder={'e.g.\n12 High Street\nShoreditch, London'}
                value={rForm.address}
                onChange={(e) => setRForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={rForm.agreedToPolicy} className="mt-0.5 accent-mango w-4 h-4"
                onChange={(e) => setRForm((f) => ({ ...f, agreedToPolicy: e.target.checked }))} />
              <span className="text-xs text-neutral-500 leading-relaxed">
                I agree to the{' '}
                <a href="/privacy" target="_blank" className="text-mango underline">Privacy Policy</a> and{' '}
                <a href="/terms" target="_blank" className="text-mango underline">Terms of Service</a>.
              </span>
            </label>

            {rError && <p className="flex items-center gap-1.5 text-red-500 text-sm"><AlertCircle className="w-4 h-4" />{rError}</p>}

            <button
              onClick={async () => {
                setRError('');
                const cfg = await (await fetch('/api/site-config')).json();
                const zones: string[] = (cfg.deliveryZones || []).map((z: string) => z.toUpperCase());
                const ok = zones.some((z) => outwardCode(rForm.postcode).startsWith(z));
                if (!ok) { setRError(`Sorry, ${rForm.postcode} is no longer in a delivery zone. Please go back and re-enter your postcode.`); return; }
                setRegStep('password');
              }}
              disabled={!rForm.name || !rForm.email || !rForm.phone || !rForm.postcode || !rForm.address || !rForm.agreedToPolicy}
              className="btn-primary w-full disabled:opacity-50">
              Continue
            </button>
            <button onClick={() => setRegStep('postcode')} className="w-full text-sm text-neutral-400 hover:text-mango transition-colors text-center">
              ← Back
            </button>
          </motion.div>
        )}

        {/* STEP 3 — password */}
        {regStep === 'password' && (
          <motion.div key="pw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-sm text-neutral-500">Step 3 of 5 — Create a secure password</p>
            <StepBar current="password" />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input-field pr-11" placeholder="Password (min. 8 characters)"
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {(['weak', 'medium', 'strong'] as const).map((lvl, i) => (
                    <div key={lvl} className={`flex-1 h-1.5 rounded-full transition-colors ${
                      str.level === 'weak' && i === 0 ? 'bg-red-400' :
                      str.level === 'medium' && i <= 1 ? 'bg-yellow-400' :
                      str.level === 'strong' ? 'bg-green-500' : 'bg-neutral-200'
                    }`} />
                  ))}
                </div>
                <p className={`text-xs font-medium ${str.level === 'weak' ? 'text-red-500' : str.level === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {str.label}
                </p>
              </div>
            )}
            <input type={showPw ? 'text' : 'password'} className="input-field" placeholder="Confirm Password"
              value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            {confirmPw && password !== confirmPw && (
              <p className="text-red-500 text-xs">Passwords don&apos;t match</p>
            )}
            <button onClick={() => setRegStep('review')}
              disabled={!password || password.length < 8 || password !== confirmPw}
              className="btn-primary w-full disabled:opacity-50">
              Continue
            </button>
            <button onClick={() => setRegStep('details')} className="w-full text-sm text-neutral-400 hover:text-mango transition-colors text-center">
              ← Back
            </button>
          </motion.div>
        )}

        {/* STEP 4 — review */}
        {regStep === 'review' && (
          <motion.div key="rev" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-sm text-neutral-500">Step 4 of 5 — Confirm everything looks right</p>
            <StepBar current="review" />
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm divide-y divide-neutral-50">
              {[
                { label: 'Name', value: rForm.name },
                { label: 'Email', value: rForm.email },
                { label: 'Phone', value: rForm.phone },
                { label: 'Postcode', value: rForm.postcode },
                { label: 'Address', value: rForm.address },
                { label: 'Password', value: '••••••••' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <span className="text-neutral-400 font-medium flex-shrink-0">{label}</span>
                  <span className="text-neutral-800 font-semibold text-right break-words">{value}</span>
                </div>
              ))}
            </div>
            {rError && <p className="flex items-center gap-1.5 text-red-500 text-sm"><AlertCircle className="w-4 h-4" />{rError}</p>}
            <button onClick={sendCode} disabled={rLoading} className="btn-primary w-full disabled:opacity-50">
              {rLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code…</> : 'Confirm & Send Verification Code'}
            </button>
            <button onClick={() => setRegStep('password')} className="w-full text-sm text-neutral-400 hover:text-mango transition-colors text-center">
              ← Back
            </button>
          </motion.div>
        )}

        {/* STEP 5 — verify */}
        {regStep === 'verify' && (
          <motion.div key="ver" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500">Step 5 of 5 — Code sent to</p>
              <p className="font-semibold text-neutral-800">{rForm.email}</p>
            </div>
            <StepBar current="verify" />
            {devCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm">
                <span className="font-semibold text-yellow-700">Dev code: </span>
                <span className="font-mono font-bold text-yellow-800">{devCode}</span>
              </div>
            )}
            <input className="input-field text-center text-2xl font-mono tracking-[0.5em] py-4"
              maxLength={6} value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifyCode.length === 6 && handleVerify()}
              placeholder="••••••" />
            {rError && <p className="flex items-center gap-1.5 text-red-500 text-sm"><AlertCircle className="w-4 h-4" />{rError}</p>}
            <button onClick={handleVerify} disabled={verifyCode.length !== 6 || rLoading} className="btn-primary w-full disabled:opacity-50">
              {rLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : 'Verify & Create Account'}
            </button>
            <div className="flex gap-3 text-sm text-center">
              <button onClick={() => setRegStep('review')} className="flex-1 text-neutral-400 hover:text-mango transition-colors">
                ← Back
              </button>
              <button onClick={sendCode} className="flex-1 text-neutral-400 hover:text-mango transition-colors">
                Resend code
              </button>
            </div>
          </motion.div>
        )}

        {/* DONE */}
        {regStep === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Account Created!</h3>
            <p className="text-neutral-500 text-sm">Welcome to Jamaican Juicy, {rForm.name.split(' ')[0]}! 🧃</p>
          </motion.div>
        )}

      </AnimatePresence>
    </Drawer>
  );
}
