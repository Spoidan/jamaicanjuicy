'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, DeliveryAddress } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowLeft, Plus, Trash2, CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

function isValidUKPostcode(pc: string) {
  return /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i.test(pc.trim());
}
function outwardCode(pc: string) {
  return pc.trim().toUpperCase().replace(/\s+/g, '').slice(0, -3);
}

export default function AddressesPage() {
  const { user, verified, addAddress, removeAddress, selectAddress } = useAuthStore();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    if (!verified) router.push('/');
  }, [verified, router]);

  if (!verified || !user) return null;
  const u = user; // non-null for use inside async callbacks

  const selected = u.addresses.find((a) => a.id === u.selectedAddressId);

  async function handleAdd() {
    setError('');
    if (!address.trim() || !postcode.trim()) { setError('Address and postcode are required.'); return; }
    if (!isValidUKPostcode(postcode)) { setError('Enter a valid UK postcode.'); return; }

    setSaving(true);
    const cfg = await (await fetch('/api/site-config')).json();
    const zones: string[] = (cfg.deliveryZones || []).map((z: string) => z.toUpperCase());
    const ok = zones.some((z) => outwardCode(postcode).startsWith(z));
    if (!ok) { setError(`Sorry, we don't deliver to ${postcode.toUpperCase()} yet.`); setSaving(false); return; }

    const res = await fetch('/api/account/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, label: label || 'Address', address: address.trim(), postcode: postcode.trim().toUpperCase() }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || 'Failed to save'); return; }
    addAddress(data.address as DeliveryAddress);
    setLabel(''); setAddress(''); setPostcode(''); setShowForm(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch('/api/account/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, id }),
    });
    const data = await res.json();
    setDeletingId(null);
    if (!res.ok) return;
    removeAddress(id);
    if (data.selectedAddressId && data.selectedAddressId !== u.selectedAddressId) {
      selectAddress(data.selectedAddressId);
    }
  }

  async function handleSelect(id: string) {
    setSelectingId(id);
    await fetch('/api/account/addresses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, id }),
    });
    selectAddress(id);
    setSelectingId(null);
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl">Delivery Addresses</h1>
            <p className="text-sm text-neutral-500">{u.email}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {u.addresses.length === 0 && !showForm && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center shadow-sm">
              <MapPin className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
              <p className="font-semibold mb-1">No addresses saved</p>
              <p className="text-neutral-400 text-sm mb-4">Add an address to speed up checkout.</p>
            </div>
          )}

          {u.addresses.map((addr) => {
            const isSelected = addr.id === u.selectedAddressId;
            return (
              <div key={addr.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-3 items-start transition-all ${isSelected ? 'border-mango/40' : 'border-neutral-100'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-mango text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm">{addr.label}</p>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mango/10 text-mango uppercase">Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 break-words">{addr.address}</p>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5">{addr.postcode}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!isSelected && (
                    <button onClick={() => handleSelect(addr.id)} disabled={!!selectingId}
                      className="flex items-center gap-1 text-xs font-semibold text-mango border border-mango/30 rounded-lg px-2.5 py-1.5 hover:bg-mango/5 transition-colors disabled:opacity-50">
                      {selectingId === addr.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Use this
                    </button>
                  )}
                  {u.addresses.length > 1 && (
                    <button onClick={() => handleDelete(addr.id)} disabled={!!deletingId}
                      className="flex items-center gap-1 text-xs font-semibold text-red-400 border border-red-100 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50">
                      {deletingId === addr.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add address form */}
        {showForm ? (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold">New Address</p>
              <button onClick={() => { setShowForm(false); setError(''); }} className="p-1.5 rounded-full hover:bg-neutral-100">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
            <input className="input-field" placeholder='Label (e.g. "Home", "Work")' value={label}
              onChange={(e) => setLabel(e.target.value)} />
            <input className="input-field uppercase font-mono" placeholder="Postcode *" value={postcode}
              onChange={(e) => { setPostcode(e.target.value.toUpperCase()); setError(''); }} />
            <textarea className="input-field resize-none" rows={3}
              placeholder={'Full address *\ne.g. 12 High Street\nShoreditch, London'}
              value={address} onChange={(e) => setAddress(e.target.value)} />
            {error && <p className="flex items-center gap-1.5 text-red-500 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</p>}
            <button onClick={handleAdd} disabled={saving} className="btn-primary w-full disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Address'}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-neutral-200 text-sm font-semibold text-neutral-500 hover:border-mango hover:text-mango transition-colors">
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        )}

        {selected && (
          <p className="text-center text-xs text-neutral-400 mt-6">
            Orders will be delivered to: <span className="font-semibold text-neutral-600">{selected.postcode}</span>
          </p>
        )}
      </div>
    </div>
  );
}
