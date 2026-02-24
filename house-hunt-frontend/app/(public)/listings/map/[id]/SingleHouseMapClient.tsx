"use client";

// app/listings/map/[id]/SingleHouseMapClient.tsx
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { House } from "@/lib/types";

const SingleHouseMap = dynamic(
  () => import("@/components/listings/MapView").then((m) => m.SingleHouseMap),
  { ssr: false, loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )}
);

export default function SingleHouseMapClient({ id }: { id: string }) {
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/houses/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: House) => { setHouse(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !house) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-500 font-medium">Property not found</p>
          <Link href="/listings" className="text-blue-600 text-sm hover:underline">← Back to listings</Link>
        </div>
      </div>
    );
  }

  if (!house.coordinates?.lat || !house.coordinates?.lng) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-gray-500">Location data not available for this property.</p>
          <Link href="/listings" className="text-blue-600 text-sm hover:underline">← Back to listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Link
          href="/listings"
          className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg text-gray-800 text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* Property info panel */}
      <div className="absolute bottom-8 left-4 z-[1000] bg-white rounded-2xl shadow-lg p-4 max-w-xs w-full">
        <h2 className="font-bold text-gray-900 text-base leading-snug">{house.title}</h2>
        <p className="text-gray-500 text-sm mt-0.5">{house.location}</p>
        <p className="text-green-700 font-bold text-base mt-1">KES {house.price.toLocaleString()}</p>
        <a
          href={`https://www.google.com/maps?q=${house.coordinates.lat},${house.coordinates.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-blue-600 text-sm font-medium mt-2 hover:underline"
        >
          <ExternalLink size={13} />
          Open in Google Maps
        </a>
      </div>

      <SingleHouseMap house={house} />
    </div>
  );
}