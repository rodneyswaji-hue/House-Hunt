"use client";

// components/listings/SearchBar.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import type { HouseFilters } from "@/lib/types";

interface SearchBarProps {
  onFilter: (filters: HouseFilters) => void;
  initialFilters?: HouseFilters;
}

const PRICE_OPTIONS = [
  { label: "Any price", value: "" },
  { label: "Under KES 10,000", value: "10000" },
  { label: "Under KES 20,000", value: "20000" },
  { label: "Under KES 35,000", value: "35000" },
  { label: "Under KES 50,000", value: "50000" },
];

const BEDROOM_OPTIONS = [
  { label: "Any type", value: "" },
  { label: "Bedsitter", value: "0" },
  { label: "1 Bedroom", value: "1" },
  { label: "2 Bedrooms", value: "2" },
  { label: "3 Bedrooms", value: "3" },
];

export default function SearchBar({ onFilter, initialFilters = {} }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(initialFilters.location ?? searchParams.get("location") ?? "");
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms ?? searchParams.get("bedrooms") ?? "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.max_price ?? searchParams.get("max_price") ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  // Load unique locations for autocomplete
  // 🔌 DJANGO: This will use the filtered API. Could also be a dedicated /api/locations/ endpoint.
  useEffect(() => {
    fetch("/api/houses")
      .then((r) => r.json())
      .then((houses: { location: string }[]) => {
        const unique = [...new Set(houses.map((h) => h.location))].sort();
        setAllLocations(unique);
      })
      .catch(() => {});
  }, []);

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

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (val.length > 1) {
      const matches = allLocations
        .filter((l) => l.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const applyFilters = (overrides?: Partial<HouseFilters>) => {
    const filters: HouseFilters = {
      location: location || undefined,
      bedrooms: bedrooms || undefined,
      max_price: maxPrice || undefined,
      ...overrides,
    };

    // Update URL query string so filters are shareable / bookmark-able
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.max_price) params.set("max_price", filters.max_price);
    router.replace(`/listings?${params.toString()}`, { scroll: false });

    onFilter(filters);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setLocation("");
    setBedrooms("");
    setMaxPrice("");
    router.replace("/listings", { scroll: false });
    onFilter({});
  };

  const hasFilters = location || bedrooms || maxPrice;

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
              onFocus={() => location.length > 1 && setShowSuggestions(suggestions.length > 0)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          {showSuggestions && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <li
                  key={s}
                  onClick={() => { setLocation(s); setShowSuggestions(false); }}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 flex items-center gap-2"
                >
                  <MapPin size={13} className="text-blue-400" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bedrooms */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Type
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
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
            onChange={(e) => setMaxPrice(e.target.value)}
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
            onClick={() => applyFilters()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            <Search size={15} />
            Search
          </button>
          <button
            onClick={() => router.push(`/listings/map${hasFilters ? `?${new URLSearchParams({ location, bedrooms, max_price: maxPrice }).toString()}` : ""}`)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            <MapPin size={15} />
            Map View
          </button>
          {hasFilters && (
            <button
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