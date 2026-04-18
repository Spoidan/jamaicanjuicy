'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';
import {
  Package, Settings, FileText, Star, Pencil, Trash2, Plus, X, Save,
  Repeat, Instagram, MapPin, LayoutDashboard, Menu, LogOut, ChevronRight,
  Bell, Upload, Check,
} from 'lucide-react';
import Image from 'next/image';

/* ── Types ── */
interface Product { id: string; name: string; description: string; price: number; image: string; category: string; featured: boolean; badge?: string; inStock: boolean; rating: number; reviewCount: number; sizes: { label: string; ml: number; price: number }[] }
interface Offer { id: string; emoji: string; title: string; description: string; cta: string; color: string; productId: string }
interface Testimonial { id: string; name: string; location: string; rating: number; text: string; avatar: string }
interface SiteConfig {
  hero: { headline: string; subheadline: string; ctaText: string };
  marquee: string[];
  offers: Offer[];
  social: { instagram: string; tiktok: string; instagramUrl: string; tiktokUrl: string };
  about: { headline: string; story: string; mission: string };
  contact: { phone: string; email: string; address: string; hours: string };
  testimonials: Testimonial[];
  deliveryZones: string[];
  pinnedBannerOfferId?: string;
}

type Section = 'orders' | 'products' | 'hero' | 'offers' | 'reviews' | 'content' | 'zones' | 'subscriptions';

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready:     'bg-green-100 text-green-800',
  delivered: 'bg-neutral-100 text-neutral-600',
  picked_up: 'bg-neutral-100 text-neutral-600',
};
const COMPLETED_STATUSES = ['delivered', 'picked_up'];

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'orders',        label: 'Orders',          icon: <Package className="w-4 h-4" />,       desc: 'Manage & fulfil orders' },
  { id: 'products',      label: 'Products',         icon: <Settings className="w-4 h-4" />,      desc: 'Add, edit, delete juices' },
  { id: 'hero',          label: 'Hero Section',     icon: <LayoutDashboard className="w-4 h-4" />, desc: 'Homepage headline & CTA' },
  { id: 'offers',        label: 'Offers & Banner',  icon: <Bell className="w-4 h-4" />,          desc: 'Promo cards & top banner' },
  { id: 'reviews',       label: 'Reviews',          icon: <Star className="w-4 h-4" />,          desc: 'Customer testimonials' },
  { id: 'content',       label: 'Content',          icon: <FileText className="w-4 h-4" />,      desc: 'About, social & contact' },
  { id: 'zones',         label: 'Delivery Zones',   icon: <MapPin className="w-4 h-4" />,        desc: 'UK postcode coverage' },
  { id: 'subscriptions', label: 'Subscriptions',    icon: <Repeat className="w-4 h-4" />,        desc: 'Weekly & bi-weekly plans' },
];

/* ── Login screen ── */
function LoginScreen({ onLogin, error }: { onLogin: (key: string) => void; error: string }) {
  const [key, setKey] = useState('');
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-neutral-900 rounded-2xl p-8 shadow-2xl border border-neutral-800">
        <div className="text-center mb-8">
          <span className="text-5xl">🧃</span>
          <h1 className="text-2xl font-bold text-white mt-3">Jamaican Juicy</h1>
          <p className="text-neutral-400 text-sm mt-1">Admin Portal</p>
        </div>
        <input
          type="password"
          placeholder="Enter admin key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onLogin(key)}
          className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-mango/50 mb-3"
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button onClick={() => onLogin(key)} className="w-full btn-primary py-3">
          Sign In
        </button>
        <a
          href="/"
          className="mt-4 flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← Back to homepage
        </a>
      </div>
    </div>
  );
}

/* ── Sidebar ── */
function Sidebar({ active, onChange, onLogout, orderCount }: {
  active: Section; onChange: (s: Section) => void; onLogout: () => void; orderCount: number;
}) {
  return (
    <aside className="flex flex-col h-full bg-neutral-900 text-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🧃</span>
          <div>
            <p className="font-bold text-sm leading-tight">Jamaican Juicy</p>
            <p className="text-neutral-500 text-xs">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon, desc }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
              active === id
                ? 'bg-mango text-white shadow-juice'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <span className={active === id ? 'text-white' : 'text-neutral-500 group-hover:text-white'}>{icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none mb-0.5">{label}</p>
              <p className={`text-[10px] leading-none truncate ${active === id ? 'text-white/70' : 'text-neutral-600 group-hover:text-neutral-400'}`}>{desc}</p>
            </div>
            {id === 'orders' && orderCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active === id ? 'bg-white/20 text-white' : 'bg-mango/20 text-mango'}`}>
                {orderCount}
              </span>
            )}
            {active === id && <ChevronRight className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-800 hover:text-white transition-all text-sm">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Size helpers ── */
interface SizeRow { unit: 'oz' | 'ml' | 'L'; value: string; price: string; }

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function sizeRowToStored(row: SizeRow): { label: string; ml: number; price: number } {
  const val = parseFloat(row.value) || 0;
  const price = parseFloat(row.price) || 0;
  const ml = row.unit === 'oz' ? Math.round(val * 29.5735) : row.unit === 'L' ? Math.round(val * 1000) : Math.round(val);
  return { label: `${val} ${row.unit}`, ml, price };
}

function storedToSizeRow(s: { label: string; ml: number; price: number }): SizeRow {
  const lbl = (s.label || '').trim();
  if (/oz$/i.test(lbl)) return { unit: 'oz', value: String(parseFloat(lbl) || 0), price: String(s.price) };
  if (/^\d[\d.]*\s*L$/i.test(lbl)) return { unit: 'L', value: String(parseFloat(lbl) || 0), price: String(s.price) };
  return { unit: 'ml', value: String(s.ml || 0), price: String(s.price) };
}

/* ── Image Crop Uploader ── pan to position, fixed 4:3 frame ── */
const OUT_W = 800;
const OUT_H = 600;
const MIN_SRC_W = 800;
const MIN_SRC_H = 600;

function ImageCropUploader({ current, adminKey, onUploaded }: {
  current: string; adminKey: string; onUploaded: (url: string) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [imgNat, setImgNat] = useState({ w: 0, h: 0 });
  const [drag, setDrag] = useState<{ startX: number; startY: number; startOffset: { x: number; y: number } } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [sizeError, setSizeError] = useState('');

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSrc(URL.createObjectURL(f));
    setDone(false); setSizeError('');
  }

  function onImgLoad() {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;
    if (img.naturalWidth < MIN_SRC_W || img.naturalHeight < MIN_SRC_H) {
      setSizeError(`Image too small (${img.naturalWidth}×${img.naturalHeight}px). Min: ${MIN_SRC_W}×${MIN_SRC_H}px.`);
      setSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const cw = container.offsetWidth;
    const ch = cw * 0.75; // 4:3 container height
    const nw = img.naturalWidth, nh = img.naturalHeight;
    // Scale image to cover the 4:3 container
    const s = Math.max(cw / nw, ch / nh);
    const iw = nw * s, ih = nh * s;
    setImgNat({ w: nw, h: nh });
    setDisplaySize({ w: iw, h: ih });
    setPanOffset({ x: (cw - iw) / 2, y: (ch - ih) / 2 }); // center image
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ startX: e.clientX, startY: e.clientY, startOffset: { ...panOffset } });
  }

  useEffect(() => {
    if (!drag) return;
    const d = drag;
    function onMove(e: PointerEvent) {
      const container = containerRef.current;
      if (!container) return;
      const cw = container.offsetWidth;
      const ch = cw * 0.75;
      const { w: iw, h: ih } = displaySize;
      setPanOffset({
        x: clamp(d.startOffset.x + (e.clientX - d.startX), cw - iw, 0),
        y: clamp(d.startOffset.y + (e.clientY - d.startY), ch - ih, 0),
      });
    }
    function onUp() { setDrag(null); }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [drag, displaySize]);

  async function uploadCropped() {
    const container = containerRef.current;
    if (!container || !src || imgNat.w === 0) return;
    const cw = container.offsetWidth;
    const ch = cw * 0.75;
    const s = displaySize.w / imgNat.w; // display pixels per natural pixel
    const srcX = -panOffset.x / s;
    const srcY = -panOffset.y / s;
    const srcW = cw / s;
    const srcH = ch / s;
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W; canvas.height = OUT_H;
    // Load a fresh image to avoid tainted canvas from blob URLs on some browsers
    const tmpImg = new window.Image();
    tmpImg.src = src;
    await new Promise<void>((res) => { tmpImg.onload = () => res(); });
    canvas.getContext('2d')!.drawImage(tmpImg, srcX, srcY, srcW, srcH, 0, 0, OUT_W, OUT_H);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setUploading(true);
      const fd = new FormData();
      fd.append('file', blob, `product-${Date.now()}.jpg`);
      const r = await fetch(`/api/upload?key=${adminKey}`, { method: 'POST', body: fd });
      const data = await r.json();
      onUploaded(data.url);
      setSrc(null); setDone(true); setUploading(false);
    }, 'image/jpeg', 0.92);
  }

  if (!src) {
    return (
      <>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        {sizeError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <span className="text-base flex-shrink-0">⚠️</span>
            <span>{sizeError}</span>
          </div>
        )}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-neutral-200 rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer hover:border-mango/50 hover:bg-mango/5 transition-all group overflow-hidden"
        >
          {current && !done && (
            <Image src={current} alt="" fill className="object-cover opacity-40" sizes="400px" />
          )}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            {done ? (
              <><Check className="w-8 h-8 text-green-500 mb-1.5" /><p className="text-sm font-semibold text-green-600">Uploaded! Click to change</p></>
            ) : (
              <>
                <Upload className="w-6 h-6 text-neutral-300 group-hover:text-mango mb-2 transition-colors" />
                <p className="text-sm text-neutral-400 group-hover:text-neutral-700 transition-colors">{current ? 'Click to replace image' : 'Click to upload image'}</p>
                <p className="text-xs text-neutral-300 mt-0.5">Min {MIN_SRC_W}×{MIN_SRC_H}px · drag to position in 4:3 frame</p>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Drag to reposition image in frame</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mango/10 text-mango">4:3 locked</span>
      </div>
      {/* Fixed 4:3 crop frame — user pans image inside it */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-neutral-900 select-none touch-none cursor-move"
        style={{ aspectRatio: '4/3' }}
        onPointerDown={onPointerDown}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef} src={src} alt=""
          onLoad={onImgLoad}
          draggable={false}
          style={{
            position: 'absolute',
            left: panOffset.x, top: panOffset.y,
            width: displaySize.w, height: displaySize.h,
            pointerEvents: 'none',
          }}
        />
        {/* Rule-of-thirds overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right,rgba(255,255,255,0.12) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.12) 1px,transparent 1px)', backgroundSize: '33.33% 33.33%' }} />
        {/* Frame border */}
        <div className="absolute inset-0 pointer-events-none ring-2 ring-white/60 rounded-xl" />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => { setSrc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          className="btn-outline text-sm py-2 px-4 flex-1"
        >
          Back
        </button>
        <button onClick={uploadCropped} disabled={uploading || displaySize.w === 0} className="btn-primary text-sm py-2 px-4 flex-1">
          <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading…' : 'Crop & Upload'}
        </button>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState<Section>('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [subscriptions, setSubscriptions] = useState<{ id: string; name: string; email: string; frequency: string; status: string; flavors: string[]; createdAt: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [newZone, setNewZone] = useState('');

  const [stagedStatus, setStagedStatus] = useState<Record<string, string>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSizes, setEditingSizes] = useState<SizeRow[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  function flash(text: string) { setMsg(text); setTimeout(() => setMsg(''), 3000); }

  async function login(key: string) {
    const res = await fetch(`/api/orders?key=${key}`);
    if (res.ok) { setAdminKey(key); setAuthed(true); setOrders(await res.json()); }
    else setLoginError('Invalid admin key. Try again.');
  }

  const loadProducts = useCallback(async () => {
    const r = await fetch('/api/products');
    const data = await r.json();
    setProducts(Array.isArray(data) ? data : []);
  }, []);

  const loadConfig = useCallback(async () => {
    const r = await fetch('/api/site-config');
    const raw = await r.json();
    setConfig({
      hero: { headline: '', subheadline: '', ctaText: '', ...raw.hero },
      marquee: raw.marquee ?? [],
      offers: raw.offers ?? [],
      social: { instagram: '', tiktok: '', instagramUrl: '', tiktokUrl: '', ...raw.social },
      about: { headline: '', story: '', mission: '', ...raw.about },
      contact: { phone: '', email: '', address: '', hours: '', ...raw.contact },
      testimonials: raw.testimonials ?? [],
      deliveryZones: raw.deliveryZones ?? [],
      pinnedBannerOfferId: raw.pinnedBannerOfferId ?? '',
    });
  }, []);

  const loadSubscriptions = useCallback(async () => {
    const r = await fetch(`/api/subscriptions?key=${adminKey}`);
    if (r.ok) setSubscriptions(await r.json());
  }, [adminKey]);

  useEffect(() => {
    if (authed) { loadProducts(); loadConfig(); }
  }, [authed, loadProducts, loadConfig]);

  useEffect(() => {
    if (authed && section === 'subscriptions') loadSubscriptions();
  }, [authed, section, loadSubscriptions]);

  // Sync size rows when a different product is opened for editing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setEditingSizes(editingProduct ? (editingProduct.sizes ?? []).map(storedToSizeRow) : []);
  }, [editingProduct?.id]);

  async function saveConfig(patch: Partial<SiteConfig>) {
    setSaving(true);
    await fetch(`/api/site-config?key=${adminKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    });
    await loadConfig(); setSaving(false); flash('Saved!');
  }

  async function saveProduct(p: Product) {
    await fetch(`/api/products?key=${adminKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
    await loadProducts(); setEditingProduct(null); flash('Product saved!');
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products?key=${adminKey}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await loadProducts(); flash('Deleted.');
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await fetch(`/api/orders?key=${adminKey}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status }) });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
  }

  // ── Login ──
  if (!authed) return <LoginScreen onLogin={login} error={loginError} />;

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const activeSection = NAV_ITEMS.find((n) => n.id === section);

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-body">

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 border-r border-neutral-800">
        <Sidebar active={section} onChange={(s) => setSection(s)} onLogout={() => setAuthed(false)} orderCount={pendingCount} />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col">
            <Sidebar active={section} onChange={(s) => { setSection(s); setSidebarOpen(false); }} onLogout={() => setAuthed(false)} orderCount={pendingCount} />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="font-bold text-neutral-900 text-lg leading-none">{activeSection?.label}</h1>
              <p className="text-neutral-400 text-xs mt-0.5">{activeSection?.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {msg && <span className="text-green-600 text-sm font-medium animate-fade-in">{msg}</span>}
            <div className="w-8 h-8 rounded-full bg-mango flex items-center justify-center text-white text-sm font-bold">A</div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* ── ORDERS ── */}
          {section === 'orders' && (() => {
            const activeOrders = orders.filter((o) => !COMPLETED_STATUSES.includes(o.status));
            const completedOrders = orders.filter((o) => COMPLETED_STATUSES.includes(o.status));

            function renderOrder(order: Order) {
              const staged = stagedStatus[order.id] ?? order.status;
              const changed = staged !== order.status;
              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
                  <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-neutral-800">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}>{order.status.replace('_', ' ')}</span>
                      </div>
                      <p className="font-semibold text-neutral-900">{order.customerName}</p>
                      <p className="text-sm text-neutral-500">{order.customerEmail} · {order.customerPhone}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{order.deliveryType} · {new Date(order.createdAt).toLocaleString('en-GB')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold gradient-text">{formatPrice(order.total)}</p>
                      <div className="flex items-center gap-2 mt-2 justify-end">
                        <select
                          value={staged}
                          onChange={(e) => setStagedStatus((p) => ({ ...p, [order.id]: e.target.value }))}
                          className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-mango/30"
                        >
                          {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'picked_up'].map((s) => (
                            <option key={s} value={s}>{s === 'picked_up' ? 'Picked Up' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        {changed && (
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, staged);
                              setStagedStatus((p) => { const n = { ...p }; delete n[order.id]; return n; });
                            }}
                            className="flex items-center gap-1 text-sm font-semibold bg-mango text-white px-3 py-1.5 rounded-lg hover:bg-mango/90 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Confirm
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-neutral-100 pt-3 space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-neutral-500">{item.product.name} ({item.selectedSize.label}) × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.selectedSize.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.notes && <p className="text-xs text-neutral-400 mt-2 italic">Note: {order.notes}</p>}
                  </div>
                </div>
              );
            }

            return (
              <div className="space-y-6 max-w-4xl">
                {orders.length === 0 && (
                  <div className="bg-white rounded-2xl p-16 text-center border border-neutral-200">
                    <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-400">No orders yet. They&apos;ll appear here.</p>
                  </div>
                )}
                {activeOrders.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Active Orders ({activeOrders.length})</h3>
                    <div className="space-y-4">{activeOrders.map(renderOrder)}</div>
                  </div>
                )}
                {completedOrders.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Completed ({completedOrders.length})</h3>
                    <div className="space-y-4 opacity-70">{completedOrders.map(renderOrder)}</div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── PRODUCTS ── */}
          {section === 'products' && (
            <div className="max-w-5xl">
              <div className="flex justify-end mb-5">
                <button
                  onClick={() => setEditingProduct({ id: `prod-${Date.now()}`, name: '', description: '', price: 9.99, image: '', category: 'fresh', featured: false, inStock: true, rating: 5, reviewCount: 0, sizes: [{ label: '16 oz', ml: 473, price: 9.99 }] })}
                  className="btn-primary text-sm py-2 px-4"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="relative h-44 bg-neutral-50">
                      {p.image
                        ? <Image src={p.image} alt={p.name} fill className="object-cover" sizes="300px" />
                        : <div className="w-full h-full flex items-center justify-center text-neutral-300 text-sm">No image</div>}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm text-neutral-900">{p.name}</p>
                        <p className="text-mango font-bold">{formatPrice(p.price)}</p>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.featured ? 'bg-mango/10 text-mango' : 'bg-neutral-100 text-neutral-400'}`}>
                          {p.featured ? '★ Featured' : 'Hidden'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProduct(p)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-neutral-100 hover:bg-mango hover:text-white transition-colors">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {editingProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">

                    {/* Sticky header */}
                    <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10 flex-shrink-0">
                      <h3 className="font-bold text-lg">{editingProduct.name || 'New Product'}</h3>
                      <button onClick={() => setEditingProduct(null)} className="p-1.5 hover:bg-neutral-100 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="p-6 space-y-5 overflow-y-auto">
                      {/* Image upload & crop */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">Product Image</label>
                        <ImageCropUploader
                          current={editingProduct.image}
                          adminKey={adminKey}
                          onUploaded={(url) => setEditingProduct(p => p && ({ ...p, image: url }))}
                        />
                      </div>

                      {/* Name & description */}
                      <div className="space-y-3">
                        <input className="input-field" placeholder="Product Name *" value={editingProduct.name} onChange={(e) => setEditingProduct(p => p && ({ ...p, name: e.target.value }))} />
                        <textarea className="input-field resize-none" rows={2} placeholder="Description" value={editingProduct.description} onChange={(e) => setEditingProduct(p => p && ({ ...p, description: e.target.value }))} />
                      </div>

                      {/* Sizes & Prices */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Sizes &amp; Prices</label>
                          <button
                            onClick={() => setEditingSizes(s => [...s, { unit: 'oz', value: '', price: '' }])}
                            className="flex items-center gap-1 text-xs font-semibold text-mango hover:text-mango/70 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add Size
                          </button>
                        </div>

                        {editingSizes.length === 0 && (
                          <div className="border-2 border-dashed border-neutral-100 rounded-xl py-5 text-center text-sm text-neutral-400">
                            No sizes yet — click <strong>Add Size</strong> to begin.
                          </div>
                        )}

                        <div className="space-y-2">
                          {editingSizes.map((row, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              {/* Unit */}
                              <select
                                className="input-field w-[4.5rem] text-sm py-2.5 px-2 flex-shrink-0"
                                value={row.unit}
                                onChange={(e) => setEditingSizes(s => s.map((r, j) => j === i ? { ...r, unit: e.target.value as SizeRow['unit'] } : r))}
                              >
                                <option value="oz">oz</option>
                                <option value="ml">ml</option>
                                <option value="L">L</option>
                              </select>
                              {/* Size value */}
                              <input
                                type="number"
                                min="0"
                                className="input-field flex-1 text-sm py-2.5"
                                placeholder="Amount"
                                value={row.value}
                                onChange={(e) => setEditingSizes(s => s.map((r, j) => j === i ? { ...r, value: e.target.value } : r))}
                              />
                              {/* Price */}
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium pointer-events-none">£</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="input-field pl-7 text-sm py-2.5"
                                  placeholder="Price"
                                  value={row.price}
                                  onChange={(e) => setEditingSizes(s => s.map((r, j) => j === i ? { ...r, price: e.target.value } : r))}
                                />
                              </div>
                              {/* Remove */}
                              <button
                                onClick={() => setEditingSizes(s => s.filter((_, j) => j !== i))}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {editingSizes.length > 0 && (
                          <p className="text-[11px] text-neutral-400 mt-2">The first size becomes the default price shown on product cards.</p>
                        )}
                      </div>

                      {/* Category & Badge */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-neutral-500 block mb-1">Category</label>
                          <select className="input-field" value={editingProduct.category} onChange={(e) => setEditingProduct(p => p && ({ ...p, category: e.target.value }))}>
                            {['fresh', 'bottled', 'seasonal', 'bundle'].map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-neutral-500 block mb-1">Badge</label>
                          <input className="input-field" placeholder="e.g. Best Seller" value={editingProduct.badge || ''} onChange={(e) => setEditingProduct(p => p && ({ ...p, badge: e.target.value }))} />
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="accent-mango w-4 h-4" checked={editingProduct.featured} onChange={(e) => setEditingProduct(p => p && ({ ...p, featured: e.target.checked }))} />
                          Featured on homepage
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="accent-mango w-4 h-4" checked={editingProduct.inStock} onChange={(e) => setEditingProduct(p => p && ({ ...p, inStock: e.target.checked }))} />
                          In Stock
                        </label>
                      </div>
                    </div>

                    {/* Sticky footer */}
                    <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 flex gap-3 rounded-b-2xl flex-shrink-0">
                      <button onClick={() => setEditingProduct(null)} className="btn-outline flex-1">Cancel</button>
                      <button
                        onClick={() => {
                          const sizes = editingSizes.map(sizeRowToStored);
                          const basePrice = sizes[0]?.price ?? editingProduct.price;
                          saveProduct({ ...editingProduct, sizes, price: basePrice });
                        }}
                        className="btn-primary flex-1"
                      >
                        <Save className="w-4 h-4" /> Save Product
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── HERO ── */}
          {section === 'hero' && config && (
            <div className="max-w-2xl bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1">Headline</label>
                <input className="input-field" value={config.hero.headline}
                  onChange={(e) => setConfig(c => c && ({ ...c, hero: { ...c.hero, headline: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Subheadline</label>
                <textarea className="input-field resize-none" rows={3} value={config.hero.subheadline}
                  onChange={(e) => setConfig(c => c && ({ ...c, hero: { ...c.hero, subheadline: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">CTA Button Text</label>
                <input className="input-field" value={config.hero.ctaText}
                  onChange={(e) => setConfig(c => c && ({ ...c, hero: { ...c.hero, ctaText: e.target.value } }))} />
              </div>
              <button onClick={() => saveConfig({ hero: config.hero })} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Hero'}
              </button>
            </div>
          )}

          {/* ── OFFERS ── */}
          {section === 'offers' && config && (
            <div className="max-w-4xl space-y-5">
              {/* Banner picker */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                <h2 className="font-semibold text-sm mb-1 flex items-center gap-2"><Bell className="w-4 h-4 text-mango" /> Top Banner</h2>
                <p className="text-xs text-neutral-400 mb-4">Pin one offer to show as the announcement banner under the site header. Visitors can close it.</p>
                <div className="flex flex-wrap gap-3 items-center">
                  {config.offers.map((o) => (
                    <button key={o.id}
                      onClick={() => { const newId = config.pinnedBannerOfferId === o.id ? '' : o.id; saveConfig({ pinnedBannerOfferId: newId }); setConfig(c => c && ({ ...c, pinnedBannerOfferId: newId })); }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${config.pinnedBannerOfferId === o.id ? 'border-mango bg-mango/5 text-mango' : 'border-neutral-200 text-neutral-500 hover:border-mango/50'}`}
                    >
                      {o.emoji} {o.title} {config.pinnedBannerOfferId === o.id && '📌'}
                    </button>
                  ))}
                  {config.pinnedBannerOfferId && (
                    <button onClick={() => { saveConfig({ pinnedBannerOfferId: '' }); setConfig(c => c && ({ ...c, pinnedBannerOfferId: '' })); }}
                      className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-red-200 text-red-400 hover:bg-red-50 transition-all">
                      Remove Banner
                    </button>
                  )}
                  {!config.pinnedBannerOfferId && <p className="text-xs text-neutral-400 italic">No banner active.</p>}
                </div>
              </div>

              {/* Offer cards */}
              <div className="flex justify-end">
                <button onClick={() => setEditingOffer({ id: `offer-${Date.now()}`, emoji: '🎉', title: '', description: '', cta: 'Shop Now', color: 'from-orange-500 to-amber-400', productId: '' })} className="btn-primary text-sm py-2 px-4">
                  <Plus className="w-4 h-4" /> Add Offer
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {config.offers.map((offer) => (
                  <div key={offer.id} className={`bg-gradient-to-br ${offer.color} rounded-2xl p-5 text-white`}>
                    <div className="flex justify-between mb-3">
                      <span className="text-3xl">{offer.emoji}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditingOffer(offer)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (!confirm('Delete?')) return; const upd = config.offers.filter(o => o.id !== offer.id); saveConfig({ offers: upd }); setConfig(c => c && ({ ...c, offers: upd })); }} className="p-1.5 bg-white/20 rounded-lg hover:bg-red-400/50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <p className="font-bold mb-1">{offer.title}</p>
                    <p className="text-white/80 text-xs line-clamp-2">{offer.description}</p>
                    {config.pinnedBannerOfferId === offer.id && (
                      <p className="mt-2 text-[10px] font-bold bg-white/20 rounded-full px-2 py-1 w-fit">📌 Live Banner</p>
                    )}
                  </div>
                ))}
              </div>

              {editingOffer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <div className="flex justify-between mb-4"><h3 className="font-bold">Edit Offer</h3><button onClick={() => setEditingOffer(null)}><X className="w-5 h-5" /></button></div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input className="input-field" placeholder="Emoji" value={editingOffer.emoji} onChange={(e) => setEditingOffer(o => o && ({ ...o, emoji: e.target.value }))} />
                        <input className="input-field" placeholder="Title" value={editingOffer.title} onChange={(e) => setEditingOffer(o => o && ({ ...o, title: e.target.value }))} />
                      </div>
                      <textarea className="input-field resize-none" rows={2} placeholder="Description" value={editingOffer.description} onChange={(e) => setEditingOffer(o => o && ({ ...o, description: e.target.value }))} />
                      <input className="input-field" placeholder="CTA text" value={editingOffer.cta} onChange={(e) => setEditingOffer(o => o && ({ ...o, cta: e.target.value }))} />
                      <input className="input-field" placeholder="Tailwind gradient e.g. from-orange-500 to-amber-400" value={editingOffer.color} onChange={(e) => setEditingOffer(o => o && ({ ...o, color: e.target.value }))} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setEditingOffer(null)} className="btn-outline flex-1">Cancel</button>
                      <button onClick={() => {
                        const upd = config.offers.find(o => o.id === editingOffer.id)
                          ? config.offers.map(o => o.id === editingOffer.id ? editingOffer : o)
                          : [...config.offers, editingOffer];
                        saveConfig({ offers: upd }); setConfig(c => c && ({ ...c, offers: upd })); setEditingOffer(null);
                      }} className="btn-primary flex-1"><Save className="w-4 h-4" /> Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {section === 'reviews' && config && (
            <div className="max-w-4xl space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setEditingTestimonial({ id: `t-${Date.now()}`, name: '', location: '', rating: 5, text: '', avatar: '👤' })} className="btn-primary text-sm py-2 px-4">
                  <Plus className="w-4 h-4" /> Add Review
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {config.testimonials.map((t) => (
                  <div key={t.id} className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{t.avatar}</span>
                        <div><p className="font-semibold text-sm">{t.name}</p><p className="text-xs text-neutral-400">{t.location}</p></div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingTestimonial(t)} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5 text-neutral-500" /></button>
                        <button onClick={() => { const upd = config.testimonials.filter(x => x.id !== t.id); saveConfig({ testimonials: upd }); setConfig(c => c && ({ ...c, testimonials: upd })); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-2">&ldquo;{t.text}&rdquo;</p>
                  </div>
                ))}
              </div>

              {editingTestimonial && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <div className="flex justify-between mb-4"><h3 className="font-bold">Edit Review</h3><button onClick={() => setEditingTestimonial(null)}><X className="w-5 h-5" /></button></div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input className="input-field" placeholder="Name" value={editingTestimonial.name} onChange={(e) => setEditingTestimonial(t => t && ({ ...t, name: e.target.value }))} />
                        <input className="input-field" placeholder="Avatar emoji" value={editingTestimonial.avatar} onChange={(e) => setEditingTestimonial(t => t && ({ ...t, avatar: e.target.value }))} />
                      </div>
                      <input className="input-field" placeholder="Location (e.g. London, UK)" value={editingTestimonial.location} onChange={(e) => setEditingTestimonial(t => t && ({ ...t, location: e.target.value }))} />
                      <textarea className="input-field resize-none" rows={3} placeholder="Review text" value={editingTestimonial.text} onChange={(e) => setEditingTestimonial(t => t && ({ ...t, text: e.target.value }))} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setEditingTestimonial(null)} className="btn-outline flex-1">Cancel</button>
                      <button onClick={() => {
                        const upd = config.testimonials.find(t => t.id === editingTestimonial.id)
                          ? config.testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t)
                          : [...config.testimonials, editingTestimonial];
                        saveConfig({ testimonials: upd }); setConfig(c => c && ({ ...c, testimonials: upd })); setEditingTestimonial(null);
                      }} className="btn-primary flex-1"><Save className="w-4 h-4" /> Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT ── */}
          {section === 'content' && config && (
            <div className="max-w-2xl space-y-6">
              {/* Social */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Instagram className="w-4 h-4 text-mango" /> Social Media</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Instagram handle" value={config.social.instagram} onChange={(e) => setConfig(c => c && ({ ...c, social: { ...c.social, instagram: e.target.value } }))} />
                  <input className="input-field" placeholder="TikTok handle" value={config.social.tiktok} onChange={(e) => setConfig(c => c && ({ ...c, social: { ...c.social, tiktok: e.target.value } }))} />
                  <input className="input-field col-span-2" placeholder="Instagram URL" value={config.social.instagramUrl} onChange={(e) => setConfig(c => c && ({ ...c, social: { ...c.social, instagramUrl: e.target.value } }))} />
                  <input className="input-field col-span-2" placeholder="TikTok URL" value={config.social.tiktokUrl} onChange={(e) => setConfig(c => c && ({ ...c, social: { ...c.social, tiktokUrl: e.target.value } }))} />
                </div>
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                <h2 className="font-semibold mb-4">About Section</h2>
                <div className="space-y-3">
                  <input className="input-field" placeholder="Headline" value={config.about.headline} onChange={(e) => setConfig(c => c && ({ ...c, about: { ...c.about, headline: e.target.value } }))} />
                  <textarea className="input-field resize-none" rows={3} placeholder="Story" value={config.about.story} onChange={(e) => setConfig(c => c && ({ ...c, about: { ...c.about, story: e.target.value } }))} />
                  <textarea className="input-field resize-none" rows={2} placeholder="Mission" value={config.about.mission} onChange={(e) => setConfig(c => c && ({ ...c, about: { ...c.about, mission: e.target.value } }))} />
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                <h2 className="font-semibold mb-4">Contact Info</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Phone" value={config.contact.phone} onChange={(e) => setConfig(c => c && ({ ...c, contact: { ...c.contact, phone: e.target.value } }))} />
                  <input className="input-field" placeholder="Email" value={config.contact.email} onChange={(e) => setConfig(c => c && ({ ...c, contact: { ...c.contact, email: e.target.value } }))} />
                  <input className="input-field" placeholder="Address" value={config.contact.address} onChange={(e) => setConfig(c => c && ({ ...c, contact: { ...c.contact, address: e.target.value } }))} />
                  <input className="input-field" placeholder="Hours" value={config.contact.hours} onChange={(e) => setConfig(c => c && ({ ...c, contact: { ...c.contact, hours: e.target.value } }))} />
                </div>
              </div>

              <button onClick={() => saveConfig({ social: config.social, about: config.about, contact: config.contact })} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          )}

          {/* ── DELIVERY ZONES ── */}
          {section === 'zones' && config && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                <h2 className="font-semibold mb-1 flex items-center gap-2"><MapPin className="w-4 h-4 text-mango" /> UK Delivery Zones</h2>
                <p className="text-sm text-neutral-500 mb-5">
                  Add postcode areas (<strong>SW</strong>), districts (<strong>SW1A</strong>) or full postcodes. A customer&apos;s outward code must match one of these to qualify for delivery.
                </p>

                {/* Active zones */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Active Zones ({(config.deliveryZones || []).length})</p>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {(config.deliveryZones || []).sort().map((zone) => (
                      <span key={zone} className="inline-flex items-center gap-1.5 bg-mango/10 text-mango font-mono font-bold text-sm px-3 py-1.5 rounded-full">
                        {zone}
                        <button
                          onClick={() => {
                            const upd = (config.deliveryZones || []).filter((z) => z !== zone);
                            setConfig(c => c && ({ ...c, deliveryZones: upd }));
                          }}
                          className="hover:text-red-500 transition-colors ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(config.deliveryZones || []).length === 0 && (
                      <p className="text-sm text-neutral-400 italic">No zones added yet. All checkout requests will be denied.</p>
                    )}
                  </div>
                </div>

                {/* Add custom zone */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Add Custom Zone</p>
                  <div className="flex gap-2">
                    <input
                      className="input-field flex-1 uppercase font-mono"
                      placeholder="e.g. SW or E1 or EC2A or SE1 7PB"
                      value={newZone}
                      onChange={(e) => setNewZone(e.target.value.toUpperCase().trim())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newZone) {
                          if (!(config.deliveryZones || []).includes(newZone))
                            setConfig(c => c && ({ ...c, deliveryZones: [...(c.deliveryZones || []), newZone] }));
                          setNewZone('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!newZone || (config.deliveryZones || []).includes(newZone)) { setNewZone(''); return; }
                        setConfig(c => c && ({ ...c, deliveryZones: [...(c.deliveryZones || []), newZone] }));
                        setNewZone('');
                      }}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Quick-add London areas */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">Quick Add — London Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC', 'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB', 'WD'].map((area) => {
                      const active = (config.deliveryZones || []).includes(area);
                      return (
                        <button key={area}
                          onClick={() => {
                            if (!active) setConfig(c => c && ({ ...c, deliveryZones: [...(c.deliveryZones || []), area] }));
                          }}
                          disabled={active}
                          className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full border-2 transition-all ${active ? 'border-mango bg-mango/10 text-mango cursor-default' : 'border-neutral-200 text-neutral-500 hover:border-mango hover:text-mango'}`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => saveConfig({ deliveryZones: config.deliveryZones })} disabled={saving} className="btn-primary">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Zones'}
                  </button>
                  <button onClick={() => { setConfig(c => c && ({ ...c, deliveryZones: [] })); }} className="btn-outline text-red-500 border-red-200 hover:bg-red-50">
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {section === 'subscriptions' && (
            <div className="space-y-4 max-w-4xl">
              {subscriptions.length === 0 && (
                <div className="bg-white rounded-2xl p-16 text-center border border-neutral-200">
                  <Repeat className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-400">No subscriptions yet.</p>
                </div>
              )}
              {subscriptions.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-neutral-600">{s.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>{s.status}</span>
                    </div>
                    <p className="font-semibold">{s.name} · <span className="text-neutral-500 font-normal">{s.email}</span></p>
                    <p className="text-sm text-neutral-500 capitalize mt-0.5">{s.frequency} · {s.flavors.length} flavor(s) selected</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {(['active', 'paused', 'cancelled'] as const).map((st) => (
                      <button key={st}
                        disabled={s.status === st}
                        onClick={async () => {
                          await fetch(`/api/subscriptions?key=${adminKey}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, status: st }) });
                          loadSubscriptions();
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors ${s.status === st ? 'bg-mango text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
