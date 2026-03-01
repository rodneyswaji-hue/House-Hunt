"use client";

// app/landlord/dashboard/add/HouseFormClient.tsx
// Full house submission form with:
// - S3 direct upload for images (up to 3) and optional video
// - Coordinate entry with Google Maps link helper
// - Full validation
// - Django-ready POST to /api/houses

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  ImageIcon,
  Video,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import Script from "next/script";

const LocationPicker = dynamic(() => import("@/components/landlord/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-700/50 rounded-xl animate-pulse" />,
});

// ─── Types ────────────────────────────────────────────────────────────────

interface UploadedFile {
  publicUrl: string;
  name: string;
  preview: string;
  uploading: boolean;
  error?: string;
}

interface FormData {
  title: string;
  location: string;
  price: string;
  units: string;
  bedrooms: string;
  description: string;
  landlordName: string;
  landlordPhone: string;
  latitude: string;
  longitude: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-slate-700/50 border border-slate-600 hover:border-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none transition";

// ─── S3 Upload helper ─────────────────────────────────────────────────────

async function uploadToS3(file: File): Promise<string> {
  // 1. Get presigned URL from our API
  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });

  if (!presignRes.ok) {
    const { error } = await presignRes.json();
    throw new Error(error ?? "Failed to get upload URL");
  }

  const { uploadUrl, publicUrl } = await presignRes.json();

  // 2. Upload directly to S3
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) throw new Error("Upload to S3 failed");

  return publicUrl;
}

// ─── Image Upload Panel ───────────────────────────────────────────────────

function ImageUploadPanel({
  files,
  onAdd,
  onRemove,
  maxFiles,
  label,
  accept,
}: {
  files: UploadedFile[];
  onAdd: (file: File) => void;
  onRemove: (i: number) => void;
  maxFiles: number;
  label: string;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = files.length < maxFiles;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {files.map((f, i) => (
          <div
            key={i}
            className="relative aspect-video rounded-xl overflow-hidden bg-slate-700 border border-slate-600"
          >
            {f.preview.startsWith("blob:") && f.name.match(/\.(mp4|mov)$/i) ? (
              <video src={f.preview} className="w-full h-full object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
            )}
            {f.uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
            )}
            {f.error && (
              <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center p-2">
                <p className="text-white text-xs text-center">{f.error}</p>
              </div>
            )}
            {!f.uploading && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition"
              >
                <X size={12} />
              </button>
            )}
            {!f.uploading && !f.error && (
              <div className="absolute bottom-1.5 left-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
            )}
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 hover:bg-blue-500/5 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-blue-400 transition"
          >
            <Upload size={18} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(file);
          e.target.value = ""; // reset so same file can be re-added
        }}
      />
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  title: "",
  location: "",
  price: "",
  units: "",
  bedrooms: "",
  description: "",
  landlordName: "",
  landlordPhone: "",
  latitude: "",
  longitude: "",
};

export default function HouseFormClient() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const setField = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Handle image upload
  const handleAddImage = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    const placeholder: UploadedFile = { publicUrl: "", name: file.name, preview, uploading: true };
    setImages((prev) => [...prev, placeholder]);
    const idx = images.length; // capture index

    try {
      const url = await uploadToS3(file);
      setImages((prev) =>
        prev.map((f, i) => i === idx ? { ...f, publicUrl: url, uploading: false } : f)
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setImages((prev) =>
        prev.map((f, i) => i === idx ? { ...f, uploading: false, error: msg } : f)
      );
    }
  }, [images.length]);

  const handleRemoveImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Handle video upload
  const handleAddVideo = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file);
    setVideo({ publicUrl: "", name: file.name, preview, uploading: true });
    try {
      const url = await uploadToS3(file);
      setVideo({ publicUrl: url, name: file.name, preview, uploading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Video upload failed";
      setVideo((v) => v ? { ...v, uploading: false, error: msg } : null);
    }
  }, []);

  // Validate & submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Basic validation
    if (!form.title || !form.location || !form.price || !form.units || !form.bedrooms) {
      setSubmitError("Please fill in all required fields.");
      return;
    }
    if (!form.landlordName || !form.landlordPhone) {
      setSubmitError("Landlord name and phone are required.");
      return;
    }
    if (!/^07\d{8}$/.test(form.landlordPhone)) {
      setSubmitError("Enter a valid landlord phone number (07XXXXXXXX).");
      return;
    }
    if (!form.latitude || !form.longitude) {
      setSubmitError("Please enter the property coordinates.");
      return;
    }
    if (images.some((img) => img.uploading)) {
      setSubmitError("Please wait for all images to finish uploading.");
      return;
    }
    if (images.some((img) => img.error)) {
      setSubmitError("Some images failed to upload. Remove them and try again.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: form.title,
      location: form.location,
      price: Number(form.price),
      units: Number(form.units),
      bedrooms: Number(form.bedrooms),
      description: form.description,
      available: true,
      images: images.filter((img) => img.publicUrl).map((img) => img.publicUrl),
      video: video?.publicUrl ?? null,
      landlord: {
        name: form.landlordName,
        phone: form.landlordPhone,
      },
      coordinates: {
        lat: parseFloat(form.latitude),
        lng: parseFloat(form.longitude),
      },
    };

    try {
      const res = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }

      setSubmitSuccess(true);
      setTimeout(() => router.push("/landlord/dashboard/properties"), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 size={56} className="text-emerald-400" />
        </motion.div>
        <p className="text-white font-semibold text-lg">Property added successfully!</p>
        <p className="text-slate-400 text-sm">Redirecting to your properties…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Add New Property</h1>
        <p className="text-slate-400 text-sm mt-1">Fill in the details below to list your property.</p>
      </div>

      {/* ── Section: Property Details ── */}
      <section className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-semibold text-base border-b border-slate-700 pb-3">
          Property Details
        </h2>

        <FormField label="Property Title" required>
          <input
            type="text"
            placeholder="e.g. Modern 2-Bedroom in Kilimani"
            value={form.title}
            onChange={setField("title")}
            className={inputCls}
            required
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField label="Location" required hint="Area or estate name, e.g. Westlands, Nairobi">
            <input
              type="text"
              placeholder="e.g. Kilimani, Nairobi"
              value={form.location}
              onChange={setField("location")}
              className={inputCls}
              required
            />
          </FormField>

          <FormField label="Property Type" required>
            <select
              value={form.bedrooms}
              onChange={setField("bedrooms")}
              className={inputCls}
              required
            >
              <option value="">Select type</option>
              <option value="0">Bedsitter</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
            </select>
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField label="Monthly Rent (KES)" required>
            <input
              type="number"
              placeholder="e.g. 25000"
              min="0"
              value={form.price}
              onChange={setField("price")}
              className={inputCls}
              required
            />
          </FormField>

          <FormField label="Number of Units" required hint="How many identical units are available?">
            <input
              type="number"
              placeholder="e.g. 3"
              min="1"
              value={form.units}
              onChange={setField("units")}
              className={inputCls}
              required
            />
          </FormField>
        </div>

        <FormField label="Description" hint="Optional — amenities, features, rules">
          <textarea
            placeholder="Describe the property — parking, water, security, distance to town…"
            value={form.description}
            onChange={setField("description")}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </FormField>
      </section>

      {/* ── Section: Location ── */}
      <section className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <div className="border-b border-slate-700 pb-3">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <MapPin size={16} className="text-blue-400" />
            Property Location
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Search or click on the map to select the exact property location
          </p>
        </div>

        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
          onLoad={() => setMapsLoaded(true)}
          strategy="afterInteractive"
        />

        {mapsLoaded ? (
          <LocationPicker
            onLocationSelect={(location) => {
              setForm((f) => ({
                ...f,
                latitude: location.lat.toString(),
                longitude: location.lng.toString(),
                location: location.address.split(",")[0] || f.location,
              }));
            }}
            initialLat={form.latitude ? parseFloat(form.latitude) : undefined}
            initialLng={form.longitude ? parseFloat(form.longitude) : undefined}
          />
        ) : (
          <div className="h-[400px] bg-slate-700/50 rounded-xl flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        )}
      </section>

      {/* ── Section: Images & Video ── */}
      <section className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-semibold text-base border-b border-slate-700 pb-3 flex items-center gap-2">
          <ImageIcon size={16} className="text-blue-400" />
          Photos & Video
        </h2>

        <FormField
          label="Property Photos"
          hint="Up to 3 photos. JPG, PNG or WEBP. Max 50MB each."
        >
          <ImageUploadPanel
            files={images}
            onAdd={handleAddImage}
            onRemove={handleRemoveImage}
            maxFiles={3}
            label="Add Photo"
            accept="image/jpeg,image/png,image/webp"
          />
        </FormField>

        <FormField
          label="Property Video"
          hint="Optional walkthrough video. MP4. Max 50MB."
        >
          {video ? (
            <div className="flex items-center gap-3 bg-slate-700/40 rounded-xl px-4 py-3">
              <Video size={16} className={video.uploading ? "text-slate-400 animate-pulse" : "text-blue-400"} />
              <span className="text-slate-300 text-sm flex-1 truncate">{video.name}</span>
              {video.uploading && <Loader2 size={14} className="animate-spin text-slate-400" />}
              {!video.uploading && video.error && <AlertCircle size={14} className="text-red-400" />}
              {!video.uploading && !video.error && <CheckCircle2 size={14} className="text-emerald-400" />}
              <button
                type="button"
                onClick={() => setVideo(null)}
                className="text-slate-500 hover:text-red-400 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 border-2 border-dashed border-slate-600 hover:border-blue-500 hover:bg-blue-500/5 rounded-xl px-4 py-3 cursor-pointer transition">
              <Video size={16} className="text-slate-500" />
              <span className="text-slate-500 text-sm hover:text-blue-400 transition">
                Click to upload video (optional)
              </span>
              <input
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAddVideo(file);
                }}
              />
            </label>
          )}
        </FormField>
      </section>

      {/* ── Section: Landlord Contact ── */}
      <section className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-semibold text-base border-b border-slate-700 pb-3">
          Contact Information
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField label="Landlord / Agent Name" required>
            <input
              type="text"
              placeholder="Full name"
              value={form.landlordName}
              onChange={setField("landlordName")}
              className={inputCls}
              required
            />
          </FormField>

          <FormField label="Phone Number" required hint="Shown to tenants who click 'Contact Landlord'">
            <input
              type="tel"
              placeholder="07XXXXXXXX"
              value={form.landlordPhone}
              onChange={setField("landlordPhone")}
              className={inputCls}
              required
            />
          </FormField>
        </div>
      </section>

      {/* Error / Submit */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm"
          >
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {submitError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-medium px-6 py-3 rounded-xl transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-8 py-3 rounded-xl transition"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Publishing…" : "Publish Property"}
        </button>
      </div>
    </form>
  );
}