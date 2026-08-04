"use client";

// components/listings/HouseList.tsx
// Presentational only — listings are fetched once by the parent (useHouses)
// and shared with the map, so the grid and the pins can never disagree.
import { motion } from "framer-motion";
import { Home, RefreshCw } from "lucide-react";
import HouseCard from "./HouseCard";
import type { House } from "@/lib/types";

interface HouseListProps {
  houses: House[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Raised when a card is hovered, so the matching map pin can highlight. */
  onHoverHouse?: (id: string | null) => void;
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

export default function HouseList({
  houses,
  loading,
  error,
  onRetry,
  onHoverHouse,
}: HouseListProps) {
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
          onClick={onRetry}
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
            transition={{ delay: Math.min(i, 8) * 0.06, duration: 0.35 }}
            onMouseEnter={() => onHoverHouse?.(String(house.id))}
            onMouseLeave={() => onHoverHouse?.(null)}
          >
            <HouseCard house={house} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
