'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Repeat, Calendar } from 'lucide-react';
import Image from 'next/image';

const FLAVORS = [
  { id: 'activated-detox', name: 'Activated Detox', img: '/images/juice-1.jpeg' },
  { id: 'hibiscus-pineapple-punch', name: 'Hibiscus Punch', img: '/images/juice-2.jpeg' },
  { id: 'blue-lagoon', name: 'Blue Lagoon', img: '/images/juice-3.jpeg' },
  { id: 'cane-coconut', name: 'Cane & Coconut', img: '/images/juice-4.jpeg' },
];

export function SubscriptionSection() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [subId, setSubId] = useState('');

  function toggleFlavor(id: string) {
    setSelectedFlavors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, frequency, flavors: selectedFlavors }),
    });
    const data = await res.json();
    if (data.success) {
      setSubId(data.subscriptionId);
      setStep('success');
    }
    setLoading(false);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => { setStep('form'); setSubId(''); }, 400);
  }

  return (
    <>
      {/* Section teaser */}
      <section className="section-pad bg-neutral-950 dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-mango/90 to-juice-600 p-8 sm:p-12 flex flex-col sm:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Repeat className="w-5 h-5 text-white" />
                <p className="text-white/80 font-semibold text-sm uppercase tracking-widest">Subscriptions</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 leading-tight">
                Never Run Out of Good Juice.
              </h2>
              <p className="text-white/80 text-base leading-relaxed mb-6 max-w-md">
                Subscribe for weekly or bi-weekly deliveries of your favourite blends. Set it once, enjoy forever. Cancel anytime.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {['Choose your flavors', 'Pick weekly or bi-weekly', 'Fresh on your doorstep'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                    {item}
                  </div>
                ))}
              </div>
              <button onClick={() => setOpen(true)} className="bg-white text-mango font-bold px-7 py-3.5 rounded-full hover:bg-cream transition-colors">
                Subscribe Now
              </button>
            </div>

            {/* Mini juice stack preview */}
            <div className="relative w-40 h-52 flex-shrink-0 hidden sm:block">
              {FLAVORS.slice(0, 3).map((f, i) => (
                <div
                  key={f.id}
                  className="absolute w-28 h-40 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/20"
                  style={{ left: `${i * 16}px`, top: `${i * 8}px`, zIndex: i + 1, transform: `rotate(${(i - 1) * 5}deg)` }}
                >
                  <Image src={f.img} alt={f.name} fill className="object-cover" sizes="112px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream dark:bg-neutral-900 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                <div>
                  <h3 className="font-display font-bold text-xl">Start Your Subscription</h3>
                  <p className="text-sm text-neutral-500">Fresh juice on your schedule.</p>
                </div>
                <button onClick={handleClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">

                {step === 'form' ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Delivery Frequency</label>
                      <div className="grid grid-cols-2 gap-3">
                        {([['weekly', 'Weekly', '7 days'], ['biweekly', 'Bi-Weekly', '14 days']] as const).map(([val, label, sub]) => (
                          <button
                            key={val} type="button" onClick={() => setFrequency(val)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${frequency === val ? 'border-mango bg-mango/5' : 'border-neutral-200 dark:border-neutral-700'}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className={`w-4 h-4 ${frequency === val ? 'text-mango' : 'text-neutral-400'}`} />
                              <span className="font-semibold text-sm">{label}</span>
                            </div>
                            <p className="text-xs text-neutral-500">Every {sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flavor picker */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Choose Your Flavors</label>
                      <div className="grid grid-cols-2 gap-2">
                        {FLAVORS.map((f) => (
                          <button
                            key={f.id} type="button" onClick={() => toggleFlavor(f.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left ${selectedFlavors.includes(f.id) ? 'border-mango bg-mango/5' : 'border-neutral-200 dark:border-neutral-700'}`}
                          >
                            <div className="relative w-9 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={f.img} alt={f.name} fill className="object-cover" sizes="36px" />
                            </div>
                            <span className="text-xs font-medium leading-tight">{f.name}</span>
                            {selectedFlavors.includes(f.id) && (
                              <CheckCircle className="w-4 h-4 text-mango ml-auto flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input required name="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          className="input-field" placeholder="Full Name *" />
                      </div>
                      <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        className="input-field" placeholder="Email *" />
                      <input required value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="input-field" placeholder="Phone *" />
                      <div className="col-span-2">
                        <input required value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                          className="input-field" placeholder="Delivery Address *" />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                      {loading ? 'Setting up...' : `Subscribe ${frequency === 'weekly' ? 'Weekly' : 'Bi-Weekly'}`}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="font-display font-bold text-xl mb-2">You&apos;re Subscribed!</h3>
                    <p className="text-neutral-500 mb-2">Subscription ID: <span className="font-mono font-bold text-mango text-sm">{subId}</span></p>
                    <p className="text-sm text-neutral-400">We&apos;ll reach out to confirm your first delivery date. Fresh juice incoming!</p>
                    <button onClick={handleClose} className="btn-primary mt-6">Done</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
