'use client';

import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, CreditCard, MapPin, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { formatPrice } from '@/lib/utils';
import { AuthFlow } from './AuthFlow';
import Image from 'next/image';
import Link from 'next/link';

type Step = 'cart' | 'auth' | 'checkout' | 'payment' | 'success';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { user, verified, selectAddress } = useAuthStore();
  const [step, setStep] = useState<Step>('cart');
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const selectedAddress = user?.addresses?.find((a) => a.id === user.selectedAddressId);

  function handleProceed() {
    if (verified && user) setStep('checkout');
    else setStep('auth');
  }

  function handleAuthComplete() {
    setTimeout(() => setStep('checkout'), 200);
  }

  async function handlePlaceOrder() {
    if (!user) return;
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        deliveryAddress: selectedAddress ? `${selectedAddress.address}, ${selectedAddress.postcode}` : '',
        deliveryType,
        notes,
        items: items.map(({ product, selectedSize, quantity }) => ({
          product: { id: product.id, name: product.name, image: product.image },
          selectedSize,
          quantity,
        })),
      }),
    });
    const data = await res.json();
    if (data.success) {
      setOrderId(data.orderId);
      clearCart();
      setStep('success');
    }
    setLoading(false);
  }

  function handleClose() {
    closeCart();
    setTimeout(() => { setStep('cart'); setShowAddressPicker(false); }, 400);
  }

  const cartTotal = total();
  const TITLES: Record<Step, string> = {
    cart: 'Your Cart',
    auth: 'Create Account',
    checkout: 'Review Order',
    payment: 'Payment',
    success: 'Order Placed!',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream dark:bg-neutral-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-mango" />
                <h2 className="font-display font-bold text-xl">{TITLES[step]}</h2>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">

              {/* CART step */}
              {step === 'cart' && (
                <div className="p-5 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-5xl mb-4">🧃</p>
                      <p className="font-semibold text-lg mb-1">Your cart is empty</p>
                      <p className="text-neutral-500 text-sm">Add some juicy goodness!</p>
                    </div>
                  ) : (
                    <>
                      {items.map((item) => (
                        <div key={`${item.product.id}-${item.selectedSize.label}`} className="flex gap-3 card p-3">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-neutral-500">{item.selectedSize.label}</p>
                            <p className="text-mango font-bold text-sm mt-0.5">{formatPrice(item.selectedSize.price)}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button onClick={() => removeItem(item.product.id, item.selectedSize.label)} className="text-neutral-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.product.id, item.selectedSize.label, item.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-mango hover:text-white transition-colors">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.selectedSize.label, item.quantity + 1)}
                                className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-mango hover:text-white transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Delivery address block */}
                      {verified && user && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-green-700 dark:text-green-400">Delivering to {user.name}</p>
                                {selectedAddress ? (
                                  <p className="text-xs text-green-600 dark:text-green-500 break-words">
                                    {selectedAddress.address}, {selectedAddress.postcode}
                                  </p>
                                ) : (
                                  <p className="text-xs text-yellow-600">No address selected</p>
                                )}
                              </div>
                            </div>
                            <button onClick={() => setShowAddressPicker((v) => !v)}
                              className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors flex-shrink-0">
                              Switch <ChevronDown className={`w-3 h-3 transition-transform ${showAddressPicker ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {/* Inline address picker */}
                          <AnimatePresence>
                            {showAddressPicker && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden">
                                <div className="mt-3 pt-3 border-t border-green-200 space-y-2">
                                  {(user.addresses ?? []).map((addr) => {
                                    const isSelected = addr.id === user.selectedAddressId;
                                    return (
                                      <button key={addr.id} onClick={() => { selectAddress(addr.id); setShowAddressPicker(false); }}
                                        className={`w-full text-left flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${isSelected ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-green-100 text-green-700'}`}>
                                        {isSelected && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                                        <span className="truncate">{addr.label}: {addr.address}, {addr.postcode}</span>
                                      </button>
                                    );
                                  })}
                                  <Link href="/account/addresses" onClick={handleClose}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 pt-1 transition-colors">
                                    <MapPin className="w-3 h-3" /> Manage addresses
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* AUTH step */}
              {step === 'auth' && (
                <div className="p-5">
                  <AuthFlow onComplete={handleAuthComplete} />
                </div>
              )}

              {/* CHECKOUT step */}
              {step === 'checkout' && user && (
                <div className="p-5 space-y-5">
                  <div className="card p-4 space-y-1">
                    <p className="font-semibold text-sm">Delivering to</p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">{user.name} · {user.email}</p>
                    {selectedAddress ? (
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">{selectedAddress.address}, {selectedAddress.postcode}</p>
                    ) : (
                      <Link href="/account/addresses" onClick={handleClose} className="text-mango text-sm underline">
                        Add a delivery address
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {(['delivery', 'pickup'] as const).map((type) => (
                      <button key={type} onClick={() => setDeliveryType(type)}
                        className={`p-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${deliveryType === type ? 'border-mango bg-mango/5 text-mango' : 'border-neutral-200 dark:border-neutral-700'}`}>
                        {type}
                      </button>
                    ))}
                  </div>

                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    className="input-field resize-none" rows={2} placeholder="Special notes (optional)" />

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedSize.label}`} className="flex justify-between text-sm">
                        <span className="text-neutral-500">{item.product.name} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.selectedSize.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAYMENT step */}
              {step === 'payment' && (
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                    <CreditCard className="w-4 h-4 text-mango" />
                    <span>Secured by Stripe. Your card is never stored.</span>
                  </div>
                  <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-6 text-center">
                    <CreditCard className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-400">Stripe Card Element</p>
                    <p className="text-xs text-neutral-400 mt-1">Add your Stripe publishable key to <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">.env.local</code> to activate payments.</p>
                  </div>
                  <div className="card p-4">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="gradient-text text-xl">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full py-4 disabled:opacity-60">
                    {loading ? 'Placing order...' : `Pay ${formatPrice(cartTotal)}`}
                  </button>
                  <p className="text-center text-xs text-neutral-400">Stripe payment will activate once keys are configured.</p>
                </div>
              )}

              {/* SUCCESS */}
              {step === 'success' && (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h3 className="text-2xl font-display font-bold mb-2">Order Received!</h3>
                  <p className="text-neutral-500 mb-2">ID: <span className="font-mono font-bold text-mango">{orderId}</span></p>
                  <p className="text-sm text-neutral-500">We&apos;ll be in touch shortly to confirm. Check your email!</p>
                  <button onClick={handleClose} className="btn-primary mt-6">Done</button>
                </div>
              )}
            </div>

            {/* Footer */}
            {step !== 'success' && step !== 'auth' && items.length > 0 && (
              <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 safe-bottom space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold gradient-text">{formatPrice(cartTotal)}</span>
                </div>

                {step === 'cart' && (
                  <button onClick={handleProceed} className="btn-primary w-full text-base py-4">
                    {verified && user ? 'Review Order' : 'Proceed to Checkout'}
                  </button>
                )}
                {step === 'checkout' && (
                  <div className="flex gap-3">
                    <button onClick={() => setStep('cart')} className="btn-outline flex-1">Back</button>
                    <button onClick={() => setStep('payment')} disabled={!selectedAddress && deliveryType === 'delivery'}
                      className="btn-primary flex-1 disabled:opacity-50">Pay Now</button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
