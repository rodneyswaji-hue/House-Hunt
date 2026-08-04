"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

// components/landlord/LocationPicker.tsx
// Leaflet + OpenStreetMap Nominatim, matching the tenant-facing maps.
// Previously this used the Google Maps JS API, which needs a billed
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — with no key configured the picker never
// loaded and coordinates are required, so no property could be published.

import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, Loader2, Crosshair } from "lucide-react";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const NAIROBI: [number, number] = [-1.286389, 36.817223];

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLat?: number;
  initialLng?: number;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    typeof initialLat === "number" && typeof initialLng === "number"
      ? { lat: initialLat, lng: initialLng }
      : null
  );

  // Kept in a ref so the map effect never needs the callback as a dependency
  // (the parent passes a new closure on every render).
  const onSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Reverse geocode via Nominatim — free, no key. Falls back to raw
  // coordinates so a geocoder outage can never block publishing.
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setCoords({ lat, lng });
    setSelectedAddress(fallback);
    onSelectRef.current({ lat, lng, address: fallback });

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        setSelectedAddress(data.display_name);
        onSelectRef.current({ lat, lng, address: data.display_name });
      }
    } catch {
      // keep the coordinate fallback
    }
  }, []);

  // ── Init map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    const start: [number, number] =
      typeof initialLat === "number" && typeof initialLng === "number"
        ? [initialLat, initialLng]
        : NAIROBI;

    const map = L.map(containerRef.current).setView(start, initialLat ? 16 : 12);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="font-size:28px;line-height:1;transform:translate(-50%,-100%)">📍</div>`,
      iconSize: [0, 0],
    });

    const marker = L.marker(start, { draggable: true, icon: pinIcon }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on("click", (e: any) => {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 0);

    if (typeof initialLat === "number" && typeof initialLng === "number") {
      reverseGeocode(initialLat, initialLng);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Deliberately runs once — initial coords only seed the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.setView([lat, lng], 16);
    markerRef.current?.setLatLng([lat, lng]);
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  // ── Forward geocode ──────────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setSearching(true);
    setSearchError("");
    setResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ke&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error();
      const data: SearchResult[] = await res.json();

      if (!data.length) {
        setSearchError("No matching place found. Try a nearby landmark, or click the map directly.");
        return;
      }

      if (data.length === 1) {
        moveTo(parseFloat(data[0].lat), parseFloat(data[0].lon));
      } else {
        setResults(data);
      }
    } catch {
      setSearchError("Search is unavailable right now — click the map to place the pin.");
    } finally {
      setSearching(false);
    }
  }, [searchQuery, moveTo]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("Your browser does not support location access.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => moveTo(pos.coords.latitude, pos.coords.longitude),
      () => setSearchError("Could not get your location. Click the map instead.")
    );
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search for a place (e.g. Kilimani, Nairobi)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full bg-slate-700/50 border border-slate-600 hover:border-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none transition"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          title="Use my current location"
          className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl transition"
        >
          <Crosshair size={16} />
        </button>
      </div>

      {searchError && <p className="text-amber-400 text-xs">{searchError}</p>}

      {/* Multiple matches */}
      {results.length > 0 && (
        <ul className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden divide-y divide-slate-700">
          {results.map((r) => (
            <li key={`${r.lat}-${r.lon}`}>
              <button
                type="button"
                onClick={() => {
                  setResults([]);
                  moveTo(parseFloat(r.lat), parseFloat(r.lon));
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700 transition flex items-start gap-2"
              >
                <MapPin size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-slate-600">
        <div ref={containerRef} className="w-full h-[400px]" />

        {/* Instructions Overlay */}
        <div className="absolute top-3 left-3 right-3 z-[500] bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-300 pointer-events-none">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white mb-1">How to select location:</p>
              <ul className="space-y-0.5 text-slate-400">
                <li>• Search for the area in the search bar above</li>
                <li>• Click anywhere on the map to place the marker</li>
                <li>• Drag the marker to adjust the exact position</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Address Display */}
      {coords && (
        <div className="bg-slate-700/40 border border-slate-600 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 mb-1">Selected Location:</p>
          <p className="text-sm text-white font-medium">{selectedAddress}</p>
          <p className="text-xs text-slate-500 mt-1">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}
