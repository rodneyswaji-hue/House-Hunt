"use client";

// components/listings/ReviewsSection.tsx
// Shows approved reviews for a landlord on the listing page.
// Includes: average star rating, review count, individual reviews with proof images.
// Also shows the "Leave a Review" button which opens ReviewForm if tenant is signed in.
//
// Renders inside a white HouseCard, so the palette is light. Reviews are
// fetched lazily on first expand — one card per listing means eagerly
// fetching would fire a request per card on every page load.

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, ChevronDown, ChevronUp, ExternalLink, Loader2 } from "lucide-react";
import ReviewForm from "./ReviewForm";

// ── Types ─────────────────────────────────────────────────────────────────

interface ProofImage {
  id: number;
  url: string;
  order: number;
}

interface Review {
  id: number;
  tenant_name: string;
  rating: number;
  comment: string;
  complaint_reason: string;
  complaint_reason_display: string;
  explanation: string;
  proof_images: ProofImage[];
  created_at: string;
}

interface ReviewsData {
  average_rating: number | null;
  total_reviews: number;
  reviews: Review[];
}

interface ReviewsSectionProps {
  landlordId?: number;
  landlordName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300 fill-transparent"
          }
        />
      ))}
    </span>
  );
}

const REASON_COLORS: Record<string, string> = {
  fraud: "bg-red-50 text-red-700 border-red-200",
  false_listing: "bg-orange-50 text-orange-700 border-orange-200",
  harassment: "bg-red-50 text-red-700 border-red-200",
  overcharging: "bg-amber-50 text-amber-700 border-amber-200",
  poor_condition: "bg-yellow-50 text-yellow-700 border-yellow-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

// ── Main Component ────────────────────────────────────────────────────────

export default function ReviewsSection({ landlordId, landlordName }: ReviewsSectionProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tenantLoggedIn, setTenantLoggedIn] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!landlordId) return;
    setLoading(true);
    setLoadError(false);

    fetch(`/api/feedback?landlordId=${landlordId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load reviews");
        return r.json();
      })
      .then((d: ReviewsData) => setData(d))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [landlordId]);

  // Fetch on first expand only.
  useEffect(() => {
    if (!open || data || loading || loadError) return;
    load();
    fetch("/api/tenants/me")
      .then((r) => setTenantLoggedIn(r.ok))
      .catch(() => {});
  }, [open, data, loading, loadError, load]);

  const handleSuccess = () => {
    setShowForm(false);
    setSubmitted(true);
  };

  const visibleReviews = data ? (showAll ? data.reviews : data.reviews.slice(0, 3)) : [];

  // Without a landlord id there is nothing to fetch — don't render a control
  // that can only fail.
  if (!landlordId) return null;

  return (
    <div className="mt-1 border-t border-gray-100 pt-3">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-blue-700 transition"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <MessageSquare size={14} className="text-blue-500" />
          Landlord reviews
          {data && data.total_reviews > 0 && (
            <span className="flex items-center gap-1 text-gray-400 font-normal">
              · {data.average_rating?.toFixed(1)}★ ({data.total_reviews})
            </span>
          )}
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {loading && (
                <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Loading reviews…
                </div>
              )}

              {loadError && (
                <div className="py-3 text-center">
                  <p className="text-sm text-gray-500">Could not load reviews.</p>
                  <button onClick={load} className="text-xs text-blue-600 hover:underline mt-1">
                    Try again
                  </button>
                </div>
              )}

              {!loading && !loadError && data && (
                <>
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    {data.total_reviews > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <StarDisplay rating={Math.round(data.average_rating ?? 0)} />
                        <span className="text-gray-500 text-xs">
                          {data.average_rating?.toFixed(1)} ({data.total_reviews})
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No reviews yet</span>
                    )}

                    {!showForm && !submitted && (
                      tenantLoggedIn ? (
                        <button
                          onClick={() => setShowForm(true)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition"
                        >
                          Write a review
                        </button>
                      ) : (
                        <a
                          href="/tenant/login"
                          className="text-xs text-gray-500 hover:text-blue-600 transition"
                        >
                          Sign in to review →
                        </a>
                      )
                    )}
                  </div>

                  {/* Success message after submit */}
                  {submitted && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm mb-4">
                      ✓ Review submitted — it will appear after admin approval.
                    </div>
                  )}

                  {/* Review form */}
                  <AnimatePresence>
                    {showForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 overflow-hidden"
                      >
                        <ReviewForm
                          landlordId={landlordId}
                          landlordName={landlordName}
                          onSuccess={handleSuccess}
                          onCancel={() => setShowForm(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reviews list */}
                  {data.total_reviews > 0 && (
                    <div className="space-y-3">
                      {visibleReviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-gray-50 border border-gray-100 rounded-xl p-3"
                        >
                          {/* Review header */}
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                                {review.tenant_name.charAt(0).toUpperCase()}
                              </span>
                              <span className="text-gray-900 text-xs font-medium truncate">
                                {review.tenant_name}
                              </span>
                              <StarDisplay rating={review.rating} size={12} />
                            </div>
                            <span className="text-gray-400 text-[11px] flex-shrink-0">
                              {new Date(review.created_at).toLocaleDateString("en-KE", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                          </div>

                          {/* Complaint reason badge */}
                          {review.complaint_reason && (
                            <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border mb-2 ${
                              REASON_COLORS[review.complaint_reason] ?? REASON_COLORS.other
                            }`}>
                              {review.complaint_reason_display}
                            </span>
                          )}

                          {review.explanation && (
                            <p className="text-gray-700 text-xs mb-1.5">{review.explanation}</p>
                          )}
                          {review.comment && (
                            <p className="text-gray-500 text-xs">{review.comment}</p>
                          )}

                          {/* Proof images */}
                          {review.proof_images.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {review.proof_images.map((img) => (
                                <button
                                  key={img.id}
                                  type="button"
                                  onClick={() => setLightbox(img.url)}
                                  className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition group"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={img.url}
                                    alt="Review proof"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                    <ExternalLink size={12} className="text-white opacity-0 group-hover:opacity-100 transition" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Show more / less */}
                      {data.reviews.length > 3 && (
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className="w-full flex items-center justify-center gap-1.5 text-gray-500 hover:text-blue-600 text-xs py-1.5 transition"
                        >
                          {showAll ? (
                            <><ChevronUp size={13} /> Show less</>
                          ) : (
                            <><ChevronDown size={13} /> Show all {data.reviews.length} reviews</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox}
              alt="Review proof, full size"
              className="max-w-full max-h-full rounded-xl object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
