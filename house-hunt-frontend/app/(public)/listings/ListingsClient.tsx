"use client";

// app/listings/ListingsClient.tsx
// Owns the filter state and the single listings fetch. The search bar, the
// grid and both map surfaces all read the same filtered array, so filtering
// anywhere updates everywhere.
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Maximize2, ChevronDown, Minimize2 } from "lucide-react";
import SearchBar from "@/components/listings/SearchBar";
import HouseList from "@/components/listings/HouseList";
import { useHouses } from "@/lib/useHouses";
import type { HouseFilters, House } from "@/lib/types";

const AllHousesMap = dynamic(
  () => import("@/components/listings/MapView").then((m) => m.AllHousesMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 animate-pulse rounded-xl" /> }
);

// ─── Mini Map Strip ───────────────────────────────────────────────────────

interface MiniMapProps {
  houses: House[];
  onExpand: () => void;
  isExpanded: boolean;
  loading: boolean;
}

function MiniMapStrip({ houses, onExpand, isExpanded, loading }: MiniMapProps) {
  return (
    <div
      className="relative w-full h-36 rounded-2xl overflow-hidden shadow-md border border-gray-200 mb-4 cursor-pointer"
      onClick={onExpand}
    >
      <AllHousesMap houses={houses} compact />
      {/* Overlay gradient + CTA */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-lg text-sm font-semibold text-gray-800 whitespace-nowrap">
        <MapPin size={14} className="text-blue-600" />
        {loading
          ? "Updating map…"
          : houses.length > 0
          ? `${houses.length} listing${houses.length === 1 ? "" : "s"} on map`
          : "No mapped listings match these filters"}
        {isExpanded ? (
          <Minimize2 size={13} className="text-blue-500 ml-1" />
        ) : (
          <Maximize2 size={13} className="text-blue-500 ml-1" />
        )}
      </div>
      {/* Top-right badge */}
      <div className="absolute top-2 right-2 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
        {isExpanded ? "Collapse ↑" : "Expand map ↓"}
      </div>
    </div>
  );
}

// ─── Expanded Map Panel (side panel on desktop, full on mobile) ───────────

interface ExpandedMapProps {
  houses: House[];
  filters: HouseFilters;
  areas: string[];
  onFilterLocation: (loc: string) => void;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

// Fallback chips for a first visit, before any listings have loaded.
const DEFAULT_AREAS = ["Kilimani", "Westlands", "Lavington", "Kasarani", "Ruaka", "Parklands", "Ngong Road", "Karen"];

function ExpandedMapPanel({
  houses,
  filters,
  areas,
  onFilterLocation,
  onClose,
  selectedId,
  onSelect,
}: ExpandedMapProps) {
  const selectedHouse = houses.find((h) => String(h.id) === selectedId) ?? null;

  // Esc closes the panel — it covers the screen on mobile.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex lg:relative lg:inset-auto lg:z-auto"
    >
      {/* Backdrop (mobile) */}
      <div className="absolute inset-0 bg-black/40 lg:hidden" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full lg:w-auto flex flex-col lg:flex-row h-full lg:h-[600px] lg:rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
        {/* Left sidebar: filters + selected card */}
        <div className="w-full lg:w-72 bg-white flex flex-col border-r border-gray-100 flex-shrink-0 max-h-[45%] lg:max-h-none overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="font-bold text-gray-900 text-sm">Map Explorer</span>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition" aria-label="Close map">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Location quick filters — these drive the same filter state as the search bar */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Filter by area</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onFilterLocation("")}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                  !filters.location ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                All
              </button>
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => onFilterLocation(area)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                    filters.location === area ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="px-4 py-2 text-xs text-gray-400">
            {houses.length} propert{houses.length === 1 ? "y" : "ies"} shown
            {filters.location && <span className="text-blue-600 font-medium"> in {filters.location}</span>}
          </div>

          {/* Selected house card */}
          <AnimatePresence>
            {selectedHouse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-3 mb-3 bg-blue-50 border border-blue-100 rounded-xl overflow-hidden"
              >
                {selectedHouse.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedHouse.images[0]} alt={selectedHouse.title} className="w-full h-28 object-cover" />
                )}
                <div className="p-3">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{selectedHouse.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                    <MapPin size={10} className="text-blue-400" /> {selectedHouse.location}
                  </p>
                  <p className="text-blue-700 font-bold text-sm mt-1">KES {selectedHouse.price.toLocaleString()}/mo</p>
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${selectedHouse.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {selectedHouse.available ? "Available" : "Taken"}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedHouse && (
            <div className="flex-1 flex items-center justify-center text-center px-4 pb-4">
              <div>
                <ChevronDown size={20} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Click a price pin on the map to see details</p>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[300px] lg:min-h-0">
          <AllHousesMap
            houses={houses}
            selectedId={selectedId}
            onMarkerClick={(h) => onSelect(String(h.id))}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────

export default function ListingsClient() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<HouseFilters>({
    location: searchParams.get("location") ?? undefined,
    bedrooms: searchParams.get("bedrooms") ?? undefined,
    property_type: searchParams.get("property_type") ?? undefined,
    max_price: searchParams.get("max_price") ?? undefined,
  });

  const [mapExpanded, setMapExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // One fetch feeding the grid, the mini map and the expanded map.
  const { houses, mappable, loading, error, reload } = useHouses(filters);

  // Areas actually present in the data, so the chips never point at nothing.
  const areas = useMemo(() => {
    const fromData = [...new Set(houses.map((h) => h.location).filter(Boolean))].sort();
    return fromData.length ? fromData.slice(0, 10) : DEFAULT_AREAS;
  }, [houses]);

  const locationOptions = useMemo(
    () => [...new Set(houses.map((h) => h.location).filter(Boolean))].sort(),
    [houses]
  );

  const handleFilter = useCallback((f: HouseFilters) => {
    setFilters(f);
    setSelectedId(null);
  }, []);

  const handleMapFilterLocation = useCallback((loc: string) => {
    setFilters((prev) => ({ ...prev, location: loc || undefined }));
    setSelectedId(null);
  }, []);

  return (
    <>
      {/* Mini map strip — always reflects the current filters */}
      <div className="mb-2">
        <MiniMapStrip
          houses={mappable}
          loading={loading}
          onExpand={() => setMapExpanded((v) => !v)}
          isExpanded={mapExpanded}
        />
      </div>

      {/* Expanded map panel */}
      <AnimatePresence>
        {mapExpanded && (
          <div className="mb-4">
            <ExpandedMapPanel
              houses={mappable}
              filters={filters}
              areas={areas}
              onFilterLocation={handleMapFilterLocation}
              onClose={() => setMapExpanded(false)}
              selectedId={selectedId ?? hoveredId}
              onSelect={setSelectedId}
            />
          </div>
        )}
      </AnimatePresence>

      <SearchBar
        onFilter={handleFilter}
        filters={filters}
        locationOptions={locationOptions}
      />

      {/* Listings with coordinates missing never appear on the map — say so
          rather than letting the counts silently disagree. */}
      {!loading && !error && houses.length > mappable.length && (
        <p className="text-xs text-gray-400 mt-3">
          {houses.length - mappable.length} of {houses.length} matching propert
          {houses.length - mappable.length === 1 ? "y has" : "ies have"} no map location yet.
        </p>
      )}

      <div className="mt-6">
        <HouseList
          houses={houses}
          loading={loading}
          error={error}
          onRetry={reload}
          onHoverHouse={setHoveredId}
        />
      </div>
    </>
  );
}
