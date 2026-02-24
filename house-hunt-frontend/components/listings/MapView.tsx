"use client";

// components/listings/MapView.tsx
// Leaflet maps for Next.js — dynamic import only (no SSR for Leaflet)
// Used by: /listings/map  and  /listings/map/[id]

import { useEffect, useRef } from "react";
import type { House } from "@/lib/types";

// ─── Fix Leaflet default icon paths ──────────────────────────────────────
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet");
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// ─── All Houses Map ───────────────────────────────────────────────────────

interface AllHousesMapProps {
  houses: House[];
}

export function AllHousesMap({ houses }: AllHousesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const validHouses = houses.filter((h) => h.coordinates?.lat && h.coordinates?.lng);
    if (!validHouses.length) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    fixLeafletIcons();

    const center: [number, number] = [
      validHouses[0].coordinates.lat,
      validHouses[0].coordinates.lng,
    ];

    const map = L.map(mapRef.current).setView(center, 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    validHouses.forEach((house) => {
      const marker = L.marker([house.coordinates.lat, house.coordinates.lng]).addTo(map);
      marker.bindPopup(`
        <div style="min-width:160px">
          <strong style="font-size:14px">${house.title}</strong><br/>
          <span style="color:#4b5563;font-size:12px">${house.location}</span><br/>
          <span style="color:#16a34a;font-weight:600;font-size:13px">KES ${house.price.toLocaleString()}</span><br/>
          <span style="font-size:11px;color:#6b7280">${house.units} unit(s) • ${house.available ? "✅ Available" : "❌ Taken"}</span>
        </div>
      `);
    });

    // Auto-fit bounds to all markers
    const group = L.featureGroup(
      validHouses.map((h) => L.marker([h.coordinates.lat, h.coordinates.lng]))
    );
    map.fitBounds(group.getBounds().pad(0.15));

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [houses]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// ─── Single House Map ─────────────────────────────────────────────────────

interface SingleHouseMapProps {
  house: House;
}

export function SingleHouseMap({ house }: SingleHouseMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (!house.coordinates?.lat || !house.coordinates?.lng) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    fixLeafletIcons();

    const center: [number, number] = [house.coordinates.lat, house.coordinates.lng];
    const map = L.map(mapRef.current).setView(center, 15);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker(center).addTo(map);
    marker.bindPopup(`
      <div style="min-width:160px">
        <strong style="font-size:14px">${house.title}</strong><br/>
        <span style="color:#4b5563;font-size:12px">${house.location}</span><br/>
        <span style="color:#16a34a;font-weight:600;font-size:13px">KES ${house.price.toLocaleString()}</span><br/>
        <a href="https://www.google.com/maps?q=${house.coordinates.lat},${house.coordinates.lng}"
           target="_blank" rel="noopener noreferrer"
           style="font-size:12px;color:#2563eb">Open in Google Maps ↗</a>
      </div>
    `).openPopup();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [house]);

  return <div ref={mapRef} className="w-full h-full" />;
}