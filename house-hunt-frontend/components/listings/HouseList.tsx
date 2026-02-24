"use client";

// components/listings/HouseList.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, RefreshCw } from "lucide-react";
import HouseCard from "./HouseCard";
import type { House, HouseFilters } from "@/lib/types";

interface HouseListProps {
  filters: HouseFilters;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-60 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function HouseList({ filters }: HouseListProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Build query string from filters — forwarded to Django via /api/houses
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.max_price) params.set("max_price", filters.max_price);
    if (filters.available !== undefined) params.set("available", String(filters.available));

    const query = params.toString();

    fetch(`/api/houses${query ? `?${query}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load listings");
        return r.json();
      })
      .then((data: House[]) => {
        setHouses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load listings. Please try again.");
        setLoading(false);
      });
  }, [filters]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <RefreshCw size={40} className="text-red-400 mb-3" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => setLoading(true)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!houses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Home size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No listings found</h3>
        <p className="text-gray-400 text-sm">
          Try adjusting your search filters or check back later for new properties.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {houses.length} propert{houses.length === 1 ? "y" : "ies"} found
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {houses.map((house, i) => (
          <motion.div
            key={house.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <HouseCard house={house} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}