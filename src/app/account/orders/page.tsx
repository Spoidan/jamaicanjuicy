'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ReviewsDrawer } from '@/components/ReviewsDrawer';

interface OrderItem {
  product: { id: string; name: string; image: string };
  selectedSize: { label: string; price: number };
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  deliveryType: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready:     'bg-green-100 text-green-700',
  delivered: 'bg-neutral-100 text-neutral-500',
  picked_up: 'bg-neutral-100 text-neutral-500',
};

const DELIVERED = ['delivered', 'picked_up'];

export default function MyOrdersPage() {
  const { user, verified } = useAuthStore();
  const router             = useRouter();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [reviewTarget, setReviewTarget] = useState<{
    productId: string;
    productName: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    if (!verified || !user) { router.push('/'); return; }
    fetch(`/api/account/orders?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, [user, verified, router]);

  if (!verified) return null;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl">My Orders</h1>
            <p className="text-sm text-neutral-500">{user?.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-400">Loading your orders…</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-16 text-center shadow-sm">
            <Package className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
            <p className="font-semibold text-lg mb-1">No orders yet</p>
            <p className="text-neutral-400 text-sm mb-6">Your orders will appear here after you place one.</p>
            <Link href="/shop" className="btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
                <div className="flex flex-wrap gap-3 items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-sm font-bold text-neutral-700">{order.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[order.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 capitalize">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {order.deliveryType}
                    </p>
                  </div>
                  <p className="text-xl font-bold gradient-text">{formatPrice(order.total)}</p>
                </div>

                <div className="border-t border-neutral-50 pt-3 space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-neutral-500 truncate">
                        {item.product.name} ({item.selectedSize.label}) × {item.quantity}
                      </span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold">
                          {formatPrice(item.selectedSize.price * item.quantity)}
                        </span>
                        {DELIVERED.includes(order.status) && (
                          <button
                            onClick={() => setReviewTarget({
                              productId: item.product.id,
                              productName: item.product.name,
                              orderId: order.id,
                            })}
                            className="flex items-center gap-1 text-xs font-semibold text-mango hover:text-mango/70 transition-colors"
                          >
                            <Star className="w-3 h-3" />
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewsDrawer
          productId={reviewTarget.productId}
          productName={reviewTarget.productName}
          preselectedOrderId={reviewTarget.orderId}
          isOpen
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
