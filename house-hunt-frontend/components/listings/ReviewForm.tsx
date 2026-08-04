"use client";

// components/listings/ReviewForm.tsx
// Full review form for tenants:
// - 1–5 star rating
// - For ratings ≤ 3: predefined complaint reason (required) + explanation
// - For all ratings: optional comment + up to 3 proof image uploads → S3

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Upload, X, CheckCircle2, AlertCircle,
  Loader2, ImagePlus, ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface ProofFile {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "uploading" | "done" | "error";
  publicUrl?: string;
  error?: string;
}

interface ReviewFormProps {
  landlordId: number;
  landlordName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────

const COMPLAINT_REASONS = [
  { value: "fraud", label: "Fraud / Scam" },
  { value: "false_listing", label: "False or Misleading Listing" },
  { value: "harassment", label: "Harassment or Rude Behaviour" },
  { value: "overcharging", label: "Overcharging / Hidden Fees" },
  { value: "poor_condition", label: "Property in Poor Condition" },
  { value: "other", label: "Other" },
];

const STAR_LABELS: Record<number, string> = {
  1: "Very poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

// ── Helpers ───────────────────────────────────────────────────────────────

async function uploadToS3(file: File): Promise<string> {
  // 1. Get presigned URL from Django via Next.js proxy
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to get upload URL");
  }

  const { uploadUrl, publicUrl } = await res.json();

  // 2. PUT directly to S3
  const s3Res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!s3Res.ok) throw new Error("Upload to S3 failed");

  return publicUrl;
}

// ── Star Picker ───────────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const active = s <= (hovered || value);
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${s} star${s > 1 ? "s" : ""}`}
            >
              <Star
                size={32}
                className={`transition-colors ${
                  active
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300 fill-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
      <span className="text-sm text-gray-400 h-5">
        {(hovered || value) ? STAR_LABELS[hovered || value] : "Tap to rate"}
      </span>
    </div>
  );
}

// ── Proof Image Upload ────────────────────────────────────────────────────

function ProofUploader({
  files,
  onChange,
}: {
  files: ProofFile[];
  onChange: (files: ProofFile[] | ((prev: ProofFile[]) => ProofFile[])) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (!selected.length) return;

      const remaining = 3 - files.length;
      const toAdd = selected.slice(0, remaining);

      const newFiles: ProofFile[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        status: "idle",
      }));

      const updated = [...files, ...newFiles];
      onChange(updated);

      // Upload each new file to S3
      for (const pf of newFiles) {
        onChange((prev) =>
          prev.map((f) => (f.id === pf.id ? { ...f, status: "uploading" } : f))
        );
        try {
          const publicUrl = await uploadToS3(pf.file);
          onChange((prev) =>
            prev.map((f) =>
              f.id === pf.id ? { ...f, status: "done", publicUrl } : f
            )
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          onChange((prev) =>
            prev.map((f) =>
              f.id === pf.id ? { ...f, status: "error", error: msg } : f
            )
          );
        }
      }

      // Reset input so the same file can be re-selected after an error
      if (inputRef.current) inputRef.current.value = "";
    },
    [files, onChange]
  );

  const remove = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-medium">
        Proof images
        <span className="text-gray-400 font-normal ml-1">(optional — up to 3)</span>
      </label>

      {/* Existing previews */}
      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {files.map((pf) => (
            <div key={pf.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={pf.preview}
                alt="proof"
                className="w-full h-full object-cover"
              />

              {/* Status overlay */}
              {pf.status === "uploading" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-white" />
                </div>
              )}
              {pf.status === "done" && (
                <div className="absolute bottom-1 right-1">
                  <CheckCircle2 size={14} className="text-emerald-400 drop-shadow" />
                </div>
              )}
              {pf.status === "error" && (
                <div className="absolute inset-0 bg-red-600/60 flex items-center justify-center">
                  <AlertCircle size={14} className="text-red-300" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(pf.id)}
                className="absolute top-1 left-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      {files.length < 3 && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-dashed border-gray-300 hover:border-blue-400 px-4 py-2.5 rounded-xl transition w-full justify-center"
          >
            <ImagePlus size={15} />
            Add photo{files.length > 0 ? " (3 max)" : "s"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleSelect}
          />
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function ReviewForm({
  landlordId,
  landlordName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [complaintReason, setComplaintReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [proofFiles, setProofFiles] = useState<ProofFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isComplaint = rating > 0 && rating <= 3;
  const uploadsPending = proofFiles.some((f) => f.status === "uploading");
  const uploadsErrored = proofFiles.some((f) => f.status === "error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rating) { setError("Please choose a star rating."); return; }
    if (isComplaint && !complaintReason) {
      setError("Please select a reason for your complaint."); return;
    }
    if (uploadsPending) { setError("Please wait for all images to finish uploading."); return; }
    if (uploadsErrored) { setError("Some images failed to upload. Remove them and try again."); return; }

    const proofUrls = proofFiles
      .filter((f) => f.status === "done" && f.publicUrl)
      .map((f) => f.publicUrl!);

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlord: landlordId,
          rating,
          comment,
          complaint_reason: isComplaint ? complaintReason : "",
          explanation: isComplaint ? explanation : "",
          proof_image_urls: proofUrls,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setError("You need to be signed in as a tenant to leave a review.");
        return;
      }
      if (!res.ok) {
        const firstError =
          data.detail ??
          data.non_field_errors?.[0] ??
          (Object.values(data)[0] as any)?.[0] ??
          "Submission failed.";
        setError(firstError);
        return;
      }

      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const textareaCls =
    "w-full bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-400 outline-none transition resize-none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm"
            >
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Star rating */}
        <div className="flex flex-col items-center py-2">
          <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider font-semibold">
            Rate your experience with {landlordName}
          </p>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Complaint fields — shown only for 1–3 stars */}
        <AnimatePresence>
          {isComplaint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-red-200" />
                <span className="text-red-600 text-xs font-semibold uppercase tracking-wider">
                  Complaint details
                </span>
                <div className="flex-1 h-px bg-red-200" />
              </div>

              {/* Reason dropdown */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={complaintReason}
                    onChange={(e) => setComplaintReason(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition pr-10"
                    required={isComplaint}
                  >
                    <option value="" disabled>Select a reason…</option>
                    {COMPLAINT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Further explanation
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Describe what happened in detail. The more specific you are, the easier it is to take action."
                  rows={4}
                  className={textareaCls}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment — all ratings */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            {isComplaint ? "Additional comments" : "Your review"}
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isComplaint
                ? "Anything else you'd like to add…"
                : "Share your experience with this landlord…"
            }
            rows={3}
            className={textareaCls}
          />
        </div>

        {/* Proof image upload — all ratings */}
        <ProofUploader files={proofFiles} onChange={setProofFiles} />

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 text-sm font-medium py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadsPending || !rating}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition ${
              isComplaint
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-600/40"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40"
            } text-white`}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting
              ? "Submitting…"
              : uploadsPending
              ? "Uploading images…"
              : isComplaint
              ? "Submit Complaint"
              : "Submit Review"}
          </button>
        </div>

        <p className="text-gray-400 text-xs text-center">
          Reviews are reviewed by our team before being published.
        </p>
      </form>
    </motion.div>
  );
}