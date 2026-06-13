"use client";

// app/landlord/dashboard/properties/PropertiesClient.tsx
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  PlusSquare,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  BedDouble,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { House } from "@/lib/types";

function bedroomLabel(b: number) {
  return b === 0 ? "Bedsitter" : `${b} Bed${b > 1 ? "s" : ""}`;
}

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PropertiesClient() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/houses?mine=true");
      if (!res.ok) throw new Error();
      setHouses(await res.json());
    } catch {
      setError("Failed to load properties. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Toggle availability
  const handleToggle = async (house: House) => {
    setTogglingId(house.id);
    try {
      const res = await fetch(`/api/houses/${house.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !house.available }),
      });
      if (!res.ok) throw new Error();
      setHouses((prev) =>
        prev.map((h) => h.id === house.id ? { ...h, available: !h.available } : h)
      );
    } catch {
      alert("Failed to update availability. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/houses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setHouses((prev) => prev.filter((h) => h.id !== id));
    } catch {
      alert("Failed to delete property. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Properties</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? "Loading…" : `${houses.length} propert${houses.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
        <Link
          href="/landlord/dashboard/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <PlusSquare size={16} />
          Add Property
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && houses.length === 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center">
          <Building2 size={48} className="text-slate-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">No properties yet</h3>
          <p className="text-slate-400 text-sm mb-4">
            Start by adding your first rental property.
          </p>
          <Link
            href="/landlord/dashboard/add"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            <PlusSquare size={15} />
            Add Property
          </Link>
        </div>
      )}

      {/* House list */}
      {!loading && (
        <div className="space-y-3">
          <AnimatePresence>
            {houses.map((house, i) => (
              <motion.div
                key={house.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.04 }}
                className="bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-24 h-20 sm:h-16 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0">
                  {house.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={house.images[0]}
                      alt={house.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={20} className="text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {house.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        house.available
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {house.available ? "Available" : "Taken"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {house.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble size={11} /> {bedroomLabel(house.bedrooms)}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      KES {house.price.toLocaleString()}
                    </span>
                    <span>{house.units} unit{house.units !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle availability */}
                  <button
                    onClick={() => handleToggle(house)}
                    disabled={togglingId === house.id}
                    title={house.available ? "Mark as taken" : "Mark as available"}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition ${
                      house.available
                        ? "bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400"
                        : "bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {togglingId === house.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : house.available ? (
                      <ToggleRight size={14} />
                    ) : (
                      <ToggleLeft size={14} />
                    )}
                    {house.available ? "Available" : "Mark Available"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmDeleteId(house.id)}
                    disabled={deletingId === house.id}
                    title="Delete property"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    {deletingId === house.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm dialog */}
      <AnimatePresence>
        {confirmDeleteId && (
          <ConfirmDialog
            title="Delete Property"
            message="This will permanently remove the listing. This cannot be undone."
            onConfirm={() => handleDelete(confirmDeleteId)}
            onCancel={() => setConfirmDeleteId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}