"use client";

// app/landlord/dashboard/properties/[id]/edit/EditPropertyClient.tsx
// Loads the listing, then hands it to the shared form in edit mode.
// Ownership is enforced by Django on the PATCH — this only decides what to
// show, so a landlord opening someone else's id sees a clear message rather
// than a form that fails on save.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import HouseForm from "@/components/landlord/HouseForm";
import type { House } from "@/lib/types";

export default function EditPropertyClient({ id }: { id: string }) {
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Confirm the listing is one of this landlord's before showing the form.
      const [houseRes, mineRes] = await Promise.all([
        fetch(`/api/houses/${id}`),
        fetch("/api/houses?mine=true"),
      ]);

      if (!houseRes.ok) {
        setError("This property could not be found.");
        return;
      }

      const data: House = await houseRes.json();
      const mine = mineRes.ok ? await mineRes.json() : [];

      if (Array.isArray(mine) && !mine.some((h: House) => String(h.id) === String(id))) {
        setError("You do not have permission to edit this property.");
        return;
      }

      setHouse(data);
    } catch {
      setError("Could not load this property. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 gap-3 text-slate-400">
        <Loader2 size={20} className="animate-spin" />
        Loading property…
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertTriangle size={40} className="text-amber-400 mx-auto" />
        <p className="text-white font-semibold">{error || "Property not found."}</p>
        <Link
          href="/landlord/dashboard/properties"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
        >
          <ArrowLeft size={14} />
          Back to My Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/landlord/dashboard/properties"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition"
      >
        <ArrowLeft size={14} />
        Back to My Properties
      </Link>
      <HouseForm house={house} />
    </div>
  );
}
