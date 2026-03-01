"use client";

// components/listings/ReviewsSection.tsx
// Shows approved reviews for a landlord on the listing page.
// Includes: average star rating, review count, individual reviews with proof images.
// Also shows the "Leave a Review" button which opens ReviewForm if tenant is signed in.

import { useState, useEffect } from "react";
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
  landlordId: number;
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
              : "text-slate-600 fill-transparent"
          }
        />
      ))}
    </span>
  );
}

const REASON_COLORS: Record<string, string> = {
  fraud: "bg-red-500/15 text-red-400 border-red-500/30",
  false_listing: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  harassment: "bg-red-500/15 text-red-400 border-red-500/30",
  overcharging: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  poor_condition: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  other: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

// ── Main Component ────────────────────────────────────────────────────────

export default function ReviewsSection({ landlordId, landlordName }: ReviewsSectionProps) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tenantLoggedIn, setTenantLoggedIn] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    // Check if tenant is logged in
    fetch("/api/tenants/me")
      .then((r) => r.ok && setTenantLoggedIn(true))
      .catch(() => {});

    // Load reviews
    fetch(`/api/feedback?landlordId=${landlordId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [landlordId]);

  const handleSuccess = () => {
    setShowForm(false);
    setSubmitted(true);
  };

  const visibleReviews = data
    ? showAll
      ? data.reviews
      : data.reviews.slice(0, 3)
    : [];

  if (loading) return (
    <div className="flex items-center justify-center py-6 gap-2 text-slate-500">
      <Loader2 size={14} className="animate-spin" /> Loading reviews…
    </div>
  );

  return (
    <div className="mt-6 border-t border-slate-700/50 pt-6">

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
            <MessageSquare size={15} className="text-blue-400" />
            Tenant Reviews
          </h3>
          {data && data.total_reviews > 0 && (
            <div className="flex items-center gap-1.5">
              <StarDisplay rating={Math.round(data.average_rating ?? 0)} />
              <span className="text-slate-400 text-xs">
                {data.average_rating?.toFixed(1)} ({data.total_reviews})
              </span>
            </div>
          )}
        </div>

        {/* Leave review button */}
        {!showForm && !submitted && (
          tenantLoggedIn ? (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400 px-3 py-1.5 rounded-lg transition"
            >
              Write a review
            </button>
          ) : (
            <a
              href="/tenant/login"
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Sign in to review →
            </a>
          )
        )}
      </div>

      {/* Success message after submit */}
      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm mb-4">
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
            className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-5 mb-5 overflow-hidden"
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
      {data && data.total_reviews === 0 ? (
        <p className="text-slate-500 text-sm py-4 text-center">
          No reviews yet. Be the first to review this landlord.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4"
            >
              {/* Review header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold flex items-center justify-center">
                    {review.tenant_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-white text-sm font-medium">{review.tenant_name}</span>
                  <StarDisplay rating={review.rating} />
                </div>
                <span className="text-slate-500 text-xs">
                  {new Date(review.created_at).toLocaleDateString("en-KE", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>

              {/* Complaint reason badge */}
              {review.complaint_reason && (
                <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border mb-2 ${
                  REASON_COLORS[review.complaint_reason] ?? REASON_COLORS.other
                }`}>
                  {review.complaint_reason_display}
                </span>
              )}

              {/* Explanation */}
              {review.explanation && (
                <p className="text-slate-300 text-sm mb-1.5">{review.explanation}</p>
              )}

              {/* Comment */}
              {review.comment && (
                <p className="text-slate-400 text-sm">{review.comment}</p>
              )}

              {/* Proof images */}
              {review.proof_images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {review.proof_images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightbox(img.url)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-600 hover:border-slate-400 transition group"
                    >
                      <img
                        src={img.url}
                        alt="proof"
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
          {data && data.reviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-xs py-2 transition"
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
              alt="proof full size"
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