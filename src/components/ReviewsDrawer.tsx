'use client';

import { useState, useEffect } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface EligibleOrder {
  id: string;
  status: string;
  items: { product: { id: string; name: string } }[];
}

interface Props {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  preselectedOrderId?: string;
}

export function ReviewsDrawer({ productId, productName, isOpen, onClose, preselectedOrderId }: Props) {
  const { user, verified } = useAuthStore();

  const [reviews, setReviews]               = useState<Review[]>([]);
  const [avg, setAvg]                       = useState<number | null>(null);
  const [count, setCount]                   = useState(0);
  const [loading, setLoading]               = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);

  const [rating, setRating]                 = useState(0);
  const [hoverRating, setHoverRating]       = useState(0);
  const [comment, setComment]               = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId ?? '');
  const [submitting, setSubmitting]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [submitError, setSubmitError]       = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSubmitted(false);
    setSubmitError('');
    setRating(0);
    setComment('');
    setSelectedOrderId(preselectedOrderId ?? '');

    const reviewsFetch = fetch(`/api/reviews?productId=${productId}`).then((r) => r.json());
    const ordersFetch  = verified && user
      ? fetch(`/api/account/orders?email=${encodeURIComponent(user.email)}`).then((r) => r.json())
      : Promise.resolve([]);

    Promise.all([reviewsFetch, ordersFetch]).then(([reviewData, orderData]) => {
      setReviews(reviewData.reviews ?? []);
      setAvg(reviewData.avg ?? null);
      setCount(reviewData.count ?? 0);

      if (Array.isArray(orderData)) {
        const eligible = (orderData as EligibleOrder[]).filter(
          (o) =>
            ['delivered', 'picked_up'].includes(o.status) &&
            o.items?.some((item) => item.product?.id === productId),
        );
        setEligibleOrders(eligible);
        if (eligible.length > 0 && !preselectedOrderId) {
          setSelectedOrderId(eligible[0].id);
        }
      }
      setLoading(false);
    });
  }, [isOpen, productId, verified, user, preselectedOrderId]);

  async function submitReview() {
    if (!rating || !user || !selectedOrderId) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          orderId: selectedOrderId,
          customerEmail: user.email,
          customerName: user.name,
          rating,
          comment,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setSubmitError(data.error ?? 'Failed to submit review');
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const filledStars = (n: number, size = 'w-3.5 h-3.5') =>
    [1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={cn(size, s <= Math.round(n) ? 'fill-mango text-mango' : 'text-neutral-200 fill-neutral-200')} />
    ));

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-100 flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg leading-tight">{productName}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              {avg !== null ? (
                <>
                  {filledStars(avg)}
                  <span className="text-sm font-bold ml-1">{avg}</span>
                  <span className="text-xs text-neutral-400">
                    ({count} review{count !== 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <span className="text-sm text-neutral-400">No reviews yet — be the first!</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0 ml-3">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-neutral-400 text-sm">
              Loading reviews…
            </div>
          ) : (
            <>
              {/* Reviews list */}
              <div className="p-5 space-y-3">
                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-neutral-400">No reviews yet</p>
                    <p className="text-xs text-neutral-300 mt-1">Order and be the first to review!</p>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{r.customer_name}</p>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn('w-3 h-3', s <= r.rating ? 'fill-mango text-mango' : 'text-neutral-300 fill-neutral-300')} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-neutral-600 leading-relaxed">{r.comment}</p>}
                      <p className="text-[11px] text-neutral-400">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Write review section */}
              <div className="border-t border-neutral-100 p-5">
                {!verified ? (
                  <p className="text-sm text-neutral-400 text-center py-4">
                    Sign in and purchase this product to leave a review.
                  </p>
                ) : eligibleOrders.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">
                    Your review will be unlocked after your order is delivered.
                  </p>
                ) : submitted ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                    <p className="text-green-700 font-bold">Review submitted!</p>
                    <p className="text-green-600 text-sm mt-1">It will appear once approved by our team.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm">Leave a Review</h3>

                    {/* Star selector */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 block mb-2 uppercase tracking-widest">
                        Your Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(s)}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={cn(
                                'w-8 h-8 transition-colors',
                                s <= (hoverRating || rating)
                                  ? 'fill-mango text-mango'
                                  : 'text-neutral-200 fill-neutral-200',
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-xs text-mango font-semibold mt-1">
                          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 block mb-1.5 uppercase tracking-widest">
                        Your Comment <span className="font-normal normal-case">(optional)</span>
                      </label>
                      <textarea
                        className="input-field resize-none"
                        rows={3}
                        placeholder="What did you think of this juice?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                      />
                      <p className="text-[11px] text-neutral-400 mt-1 text-right">{comment.length}/500</p>
                    </div>

                    {/* Order selector (if multiple eligible orders) */}
                    {eligibleOrders.length > 1 && (
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 block mb-1.5 uppercase tracking-widest">
                          From order
                        </label>
                        <select
                          className="input-field"
                          value={selectedOrderId}
                          onChange={(e) => setSelectedOrderId(e.target.value)}
                        >
                          {eligibleOrders.map((o) => (
                            <option key={o.id} value={o.id}>{o.id}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {submitError && (
                      <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
                    )}

                    <button
                      onClick={submitReview}
                      disabled={!rating || submitting}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
