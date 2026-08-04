"use client";

// app/listings/map/AllHousesMapClient.tsx
// Full-screen map. Reads the same filter query params as /listings, so
// "Map View" always opens on the result set the user was already browsing.
import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Layers, MapPin, X, SlidersHorizontal } from "lucide-react";
import { useHouses } from "@/lib/useHouses";
import type { House, HouseFilters } from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/types";

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

const BEDROOM_OPTIONS = [
  { label: "Any beds", value: "" },
  { label: "1+ Bedrooms", value: "1" },
  { label: "2+ Bedrooms", value: "2" },
  { label: "3+ Bedrooms", value: "3" },
  { label: "4+ Bedrooms", value: "4" },
  { label: "5+ Bedrooms", value: "5" },
];

const TYPE_OPTIONS = [
  { label: "Any type", value: "" },
  ...PROPERTY_TYPES.map((t) => ({ label: t.label, value: t.value as string })),
];

const PRICE_OPTIONS = [
  { label: "Any price", value: "" },
  { label: "Under KES 10,000", value: "10000" },
  { label: "Under KES 20,000", value: "20000" },
  { label: "Under KES 35,000", value: "35000" },
  { label: "Under KES 50,000", value: "50000" },
];

export default function AllHousesMapClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<HouseFilters>({
    location: searchParams.get("location") ?? undefined,
    bedrooms: searchParams.get("bedrooms") ?? undefined,
    property_type: searchParams.get("property_type") ?? undefined,
    max_price: searchParams.get("max_price") ?? undefined,
  });
  const [selected, setSelected] = useState<House | null>(null);

  const { houses, mappable, loading, error, reload } = useHouses(filters);

  const areas = useMemo(
    () => [...new Set(houses.map((h) => h.location).filter(Boolean))].sort().slice(0, 8),
    [houses]
  );

  const update = useCallback((patch: HouseFilters) => {
    setSelected(null);
    setFilters((prev) => {
      const next: HouseFilters = { ...prev, ...patch };
      const params = new URLSearchParams();
      if (next.location) params.set("location", next.location);
      if (next.bedrooms) params.set("bedrooms", next.bedrooms);
      if (next.property_type) params.set("property_type", next.property_type);
      if (next.max_price) params.set("max_price", next.max_price);
      const qs = params.toString();
      router.replace(qs ? `/listings/map?${qs}` : "/listings/map", { scroll: false });
      return next;
    });
  }, [router]);

  const backHref = () => {
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.property_type) params.set("property_type", filters.property_type);
    if (filters.max_price) params.set("max_price", filters.max_price);
    const qs = params.toString();
    return qs ? `/listings?${qs}` : "/listings";
  };

  const hasFilters = Boolean(
    filters.location || filters.bedrooms || filters.property_type || filters.max_price
  );

  return (
    <div className="relative h-screen w-full">
      {/* Floating controls — filters live here so the map is usable on its own */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2 items-start">
        <Link
          href={backHref()}
          className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg text-gray-800 text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          <ArrowLeft size={16} />
          Back to Listings
        </Link>

        <div className="bg-white shadow-md rounded-xl px-3 py-2 flex flex-wrap items-center gap-2 max-w-full">
          <SlidersHorizontal size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={filters.location ?? ""}
            onChange={(e) => update({ location: e.target.value || undefined })}
            placeholder="Filter by area…"
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
          />
          <select
            value={filters.property_type ?? ""}
            onChange={(e) => update({ property_type: e.target.value || undefined })}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filters.bedrooms ?? ""}
            onChange={(e) => update({ bedrooms: e.target.value || undefined })}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {BEDROOM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filters.max_price ?? ""}
            onChange={(e) => update({ max_price: e.target.value || undefined })}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => update({ location: undefined, bedrooms: undefined, property_type: undefined, max_price: undefined })}
              className="text-gray-400 hover:text-red-500 transition p-1"
              title="Clear filters"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Quick area chips */}
      {areas.length > 0 && (
        <div className="absolute top-[4.75rem] left-4 z-[1000] hidden sm:flex flex-wrap gap-1.5 max-w-md">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => update({ location: filters.location === area ? undefined : area })}
              className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-sm transition ${
                filters.location === area
                  ? "bg-blue-600 text-white"
                  : "bg-white/95 text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      )}

      {/* Result count + selected pin details */}
      <div className="absolute bottom-8 left-4 z-[1000] bg-white rounded-xl shadow-md px-4 py-3 text-xs text-gray-600 max-w-xs">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <MapPin size={13} className="text-blue-600" />
          {loading
            ? "Loading…"
            : `${mappable.length} propert${mappable.length === 1 ? "y" : "ies"} on map`}
        </div>
        {!loading && houses.length > mappable.length && (
          <p className="text-gray-400 mt-1">
            {houses.length - mappable.length} more match but have no location set.
          </p>
        )}
        {selected && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="font-semibold text-gray-900 leading-snug">{selected.title}</p>
            <p className="text-gray-500">{selected.location}</p>
            <p className="text-blue-700 font-bold mt-0.5">
              KES {selected.price.toLocaleString()}/mo
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-4 z-[1000] bg-white rounded-xl shadow-md px-4 py-3 text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-gray-700 mb-1">
          <Layers size={13} /> Map Legend
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Available
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Taken
        </div>
      </div>

      {loading && <MapLoading />}
      {error && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={reload} className="text-blue-600 text-sm hover:underline">Retry</button>
          </div>
        </div>
      )}
      {!loading && !error && (
        <AllHousesMap
          houses={mappable}
          onMarkerClick={setSelected}
          selectedId={selected ? String(selected.id) : null}
        />
      )}
    </div>
  );
}
