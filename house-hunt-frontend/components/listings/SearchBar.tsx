"use client";

// components/listings/SearchBar.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import type { HouseFilters } from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/types";

interface SearchBarProps {
  onFilter: (filters: HouseFilters) => void;
  /** Current filters, owned by the parent — the map can change these too. */
  filters: HouseFilters;
  /** Locations present in the current result set, used for autocomplete. */
  locationOptions?: string[];
}

const PRICE_OPTIONS = [
  { label: "Any price", value: "" },
  { label: "Under KES 10,000", value: "10000" },
  { label: "Under KES 20,000", value: "20000" },
  { label: "Under KES 35,000", value: "35000" },
  { label: "Under KES 50,000", value: "50000" },
];

// Bedroom count is a minimum — "2+ Bedrooms" also matches a 3-bed listing.
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

export default function SearchBar({ onFilter, filters, locationOptions = [] }: SearchBarProps) {
  const router = useRouter();

  const [location, setLocation] = useState(filters.location ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  const bedrooms = filters.bedrooms ?? "";
  const propertyType = filters.property_type ?? "";
  const maxPrice = filters.max_price ?? "";

  // Keep the text input in step when filters change elsewhere — the map's
  // "filter by area" chips, the browser back button, a cleared filter.
  useEffect(() => {
    setLocation(filters.location ?? "");
  }, [filters.location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const apply = (next: HouseFilters) => {
    const cleaned: HouseFilters = {
      location: next.location || undefined,
      bedrooms: next.bedrooms || undefined,
      property_type: next.property_type || undefined,
      max_price: next.max_price || undefined,
    };

    // Update URL query string so filters are shareable / bookmark-able
    const params = new URLSearchParams();
    if (cleaned.location) params.set("location", cleaned.location);
    if (cleaned.bedrooms) params.set("bedrooms", cleaned.bedrooms);
    if (cleaned.property_type) params.set("property_type", cleaned.property_type);
    if (cleaned.max_price) params.set("max_price", cleaned.max_price);
    const qs = params.toString();
    router.replace(qs ? `/listings?${qs}` : "/listings", { scroll: false });

    onFilter(cleaned);
    setShowSuggestions(false);
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (val.length > 1) {
      const matches = locationOptions
        .filter((l) => l.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const clearFilters = () => {
    setLocation("");
    apply({});
  };

  const hasFilters = Boolean(location || bedrooms || propertyType || maxPrice);

  // "Map View" carries the active filters across so the full-screen map opens
  // on the same result set the user is looking at.
  const mapHref = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (propertyType) params.set("property_type", propertyType);
    if (maxPrice) params.set("max_price", maxPrice);
    const qs = params.toString();
    return qs ? `/listings/map?${qs}` : "/listings/map";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-5">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Location */}
        <div className="relative flex-1 min-w-[200px]" ref={suggestRef}>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Location
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Kilimani, Westlands..."
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply({ location, bedrooms, property_type: propertyType, max_price: maxPrice });
              }}
              onFocus={() => location.length > 1 && setShowSuggestions(suggestions.length > 0)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          {showSuggestions && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <li
                  key={s}
                  onClick={() => apply({ location: s, bedrooms, property_type: propertyType, max_price: maxPrice })}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 flex items-center gap-2"
                >
                  <MapPin size={13} className="text-blue-400" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Property type — applies immediately so the list and map move together */}
        <div className="min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Type
          </label>
          <select
            value={propertyType}
            onChange={(e) => apply({ location, bedrooms, property_type: e.target.value, max_price: maxPrice })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Bedrooms — a minimum, independent of the type */}
        <div className="min-w-[140px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Bedrooms
          </label>
          <select
            value={bedrooms}
            onChange={(e) => apply({ location, bedrooms: e.target.value, property_type: propertyType, max_price: maxPrice })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
          >
            {BEDROOM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Max Price
          </label>
          <select
            value={maxPrice}
            onChange={(e) => apply({ location, bedrooms, property_type: propertyType, max_price: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
          >
            {PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 self-end">
          <button
            type="button"
            onClick={() => apply({ location, bedrooms, property_type: propertyType, max_price: maxPrice })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            <Search size={15} />
            Search
          </button>
          <button
            type="button"
            onClick={() => router.push(mapHref())}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            <MapPin size={15} />
            Map View
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 text-sm border border-gray-200 px-3 py-2.5 rounded-xl transition"
              title="Clear filters"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 flex items-center gap-1"><SlidersHorizontal size={11} /> Filters:</span>
          {location && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              📍 {location}
            </span>
          )}
          {propertyType && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {TYPE_OPTIONS.find((o) => o.value === propertyType)?.label}
            </span>
          )}
          {bedrooms && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {BEDROOM_OPTIONS.find((o) => o.value === bedrooms)?.label}
            </span>
          )}
          {maxPrice && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {PRICE_OPTIONS.find((o) => o.value === maxPrice)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
