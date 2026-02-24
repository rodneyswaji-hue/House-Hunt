"use client";

// app/listings/map/AllHousesMapClient.tsx
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import type { House } from "@/lib/types";

// Dynamic import — Leaflet must NOT run on SSR
const AllHousesMap = dynamic(
  () => import("@/components/listings/MapView").then((m) => m.AllHousesMap),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Loading map…</p>
      </div>
    </div>
  );
}

export default function AllHousesMapClient() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/houses");
      if (!res.ok) throw new Error();
      setHouses(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="relative h-screen w-full">
      {/* Floating controls */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <Link
          href="/listings"
          className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg text-gray-800 text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          <ArrowLeft size={16} />
          Back to Listings
        </Link>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-4 z-[1000] bg-white rounded-xl shadow-md px-4 py-3 text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-gray-700 mb-1">
          <Layers size={13} /> Map Legend
        </div>
        <div className="flex items-center gap-1.5">📍 Click a pin to see details</div>
      </div>

      {loading && <MapLoading />}
      {error && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-red-500 font-medium">Failed to load listings</p>
            <button onClick={load} className="text-blue-600 text-sm hover:underline">Retry</button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <AllHousesMap houses={houses} />
      )}
    </div>
  );
}