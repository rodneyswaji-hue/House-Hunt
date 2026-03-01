"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const defaultCenter = {
      lat: initialLat || -1.286389,
      lng: initialLng || 36.817223,
    };

    const newMap = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const newMarker = new google.maps.Marker({
      position: defaultCenter,
      map: newMap,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    // Handle marker drag
    newMarker.addListener("dragend", () => {
      const pos = newMarker.getPosition();
      if (pos) {
        reverseGeocode(pos.lat(), pos.lng());
      }
    });

    // Handle map click
    newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        newMarker.setPosition(e.latLng);
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      }
    });

    setMap(newMap);
    setMarker(newMarker);

    // Get initial address
    if (initialLat && initialLng) {
      reverseGeocode(initialLat, initialLng);
    }
  }, []);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      
      if (result.results[0]) {
        const address = result.results[0].formatted_address;
        setSelectedAddress(address);
        onLocationSelect({ lat, lng, address });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  }, [onLocationSelect]);

  // Search for location
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !map) return;

    setSearching(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchQuery });

      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker?.setPosition({ lat, lng });

        setSelectedAddress(result.results[0].formatted_address);
        onLocationSelect({ lat, lng, address: result.results[0].formatted_address });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, map, marker, onLocationSelect]);

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for location (e.g., Kilimani, Nairobi)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
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
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-slate-600">
        <div ref={mapRef} className="w-full h-[400px]" />
        
        {/* Instructions Overlay */}
        <div className="absolute top-3 left-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-300">
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
      {selectedAddress && (
        <div className="bg-slate-700/40 border border-slate-600 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-400 mb-1">Selected Location:</p>
          <p className="text-sm text-white font-medium">{selectedAddress}</p>
        </div>
      )}
    </div>
  );
}
