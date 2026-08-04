"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

// components/listings/MapView.tsx
import { useEffect, useRef } from "react";
import type { House, Coordinates } from "@/lib/types";

/** A listing that is safe to plot — coordinates are guaranteed present. */
type MappableHouse = House & { coordinates: Coordinates };

// ─── Realistic tile layer (CartoDB Voyager — clean, detailed, beautiful) ──
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const NAIROBI_CENTER: [number, number] = [-1.2921, 36.8219];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasCoords(house: House): house is MappableHouse {
  return (
    typeof house.coordinates?.lat === "number" &&
    typeof house.coordinates?.lng === "number"
  );
}

// ─── Custom price marker ──────────────────────────────────────────────────
function makePriceIcon(L: any, price: number, available: boolean, selected = false) {
  const label = price >= 1000 ? `${Math.round(price / 1000)}K` : String(price);
  const bg = selected ? "#0f172a" : available ? "#2563eb" : "#ef4444";
  const html = `
    <div style="
      background:${bg};
      color:#fff;
      font-size:11px;
      font-weight:700;
      padding:4px 8px;
      border-radius:20px;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,${selected ? "0.45" : "0.25"});
      border:2px solid #fff;
      cursor:pointer;
    ">KES ${label}</div>
    <div style="
      width:0;height:0;
      border-left:6px solid transparent;
      border-right:6px solid transparent;
      border-top:7px solid ${bg};
      margin:0 auto;
    "></div>`;
  return L.divIcon({ html, className: "", iconAnchor: [28, 32], popupAnchor: [0, -34] });
}

// ─── Shared popup HTML ────────────────────────────────────────────────────
function popupHtml(house: House, withMapLink = false) {
  const img = house.images?.[0];
  const title = escapeHtml(house.title);
  const location = escapeHtml(house.location);
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif">
      ${img ? `<img src="${escapeHtml(img)}" alt="${title}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ""}
      <strong style="font-size:14px;color:#111">${title}</strong><br/>
      <span style="color:#6b7280;font-size:12px">📍 ${location}</span><br/>
      <span style="color:#2563eb;font-weight:700;font-size:14px">KES ${house.price.toLocaleString()}/mo</span><br/>
      <span style="font-size:11px;color:#6b7280">${house.units} unit(s) • ${
        house.available
          ? '<span style="color:#16a34a">✓ Available</span>'
          : '<span style="color:#ef4444">✗ Taken</span>'
      }</span>
      ${withMapLink && hasCoords(house) ? `<br/><a href="https://www.google.com/maps?q=${house.coordinates.lat},${house.coordinates.lng}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:#2563eb;display:inline-block;margin-top:6px">Open in Google Maps ↗</a>` : ""}
    </div>`;
}

// ─── All Houses Map ───────────────────────────────────────────────────────

export interface AllHousesMapProps {
  houses: House[];
  /** compact = non-interactive preview, used in the hero / mini-strip */
  compact?: boolean;
  onMarkerClick?: (house: House) => void;
  /** Marker to highlight and pan to — e.g. the card the user is hovering. */
  selectedId?: string | null;
}

export function AllHousesMap({
  houses,
  compact = false,
  onMarkerClick,
  selectedId = null,
}: AllHousesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  // Kept in a ref so swapping the handler never forces a marker rebuild.
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // ── Create the map once ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const markers = markersRef.current;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    leafletRef.current = L;

    const map = L.map(containerRef.current, {
      zoomControl: !compact,
      scrollWheelZoom: !compact,
      dragging: !compact,
      doubleClickZoom: !compact,
      attributionControl: !compact,
    }).setView(NAIROBI_CENTER, compact ? 11 : 12);

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, [compact]);

  // ── Sync markers whenever the filtered set changes ───────────────────
  // The map instance itself is preserved, so filtering no longer flashes the
  // basemap or throws away the user's pan/zoom.
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const valid = houses.filter(hasCoords);
    const nextIds = new Set(valid.map((h) => String(h.id)));

    // Drop markers for listings filtered out
    for (const [id, marker] of markersRef.current) {
      if (!nextIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    }

    // Add markers for listings filtered in
    for (const house of valid) {
      const id = String(house.id);
      if (markersRef.current.has(id)) continue;

      const marker = L.marker([house.coordinates.lat, house.coordinates.lng], {
        icon: makePriceIcon(L, house.price, house.available),
      }).addTo(map);

      if (!compact) marker.bindPopup(popupHtml(house), { maxWidth: 240 });
      marker.on("click", () => onMarkerClickRef.current?.(house));

      markersRef.current.set(id, marker);
    }

    // Frame the current result set
    if (valid.length === 1) {
      map.setView(
        [valid[0].coordinates.lat, valid[0].coordinates.lng],
        compact ? 13 : 15
      );
    } else if (valid.length > 1) {
      const bounds = L.latLngBounds(
        valid.map((h) => [h.coordinates.lat, h.coordinates.lng])
      );
      map.fitBounds(bounds.pad(0.2), { maxZoom: compact ? 13 : 16 });
    } else {
      map.setView(NAIROBI_CENTER, compact ? 11 : 12);
    }

    // Leaflet mis-measures when it initialises inside a hidden/animating box
    // (the expandable map panel) — force a recalculation once laid out.
    setTimeout(() => map.invalidateSize(), 0);
  }, [houses, compact]);

  // ── Highlight + reveal the selected marker ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    for (const house of houses) {
      const marker = markersRef.current.get(String(house.id));
      if (!marker) continue;
      const isSelected = selectedId === String(house.id);
      marker.setIcon(makePriceIcon(L, house.price, house.available, isSelected));
      marker.setZIndexOffset(isSelected ? 1000 : 0);
      if (isSelected && hasCoords(house)) {
        map.panTo([house.coordinates.lat, house.coordinates.lng], { animate: true });
      }
    }
  }, [selectedId, houses]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// ─── Single House Map ─────────────────────────────────────────────────────

interface SingleHouseMapProps {
  house: House;
}

export function SingleHouseMap({ house }: SingleHouseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!hasCoords(house)) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    const center: [number, number] = [house.coordinates.lat, house.coordinates.lng];
    const map = L.map(containerRef.current).setView(center, 15);
    mapRef.current = map;

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

    L.marker(center, { icon: makePriceIcon(L, house.price, house.available) })
      .addTo(map)
      .bindPopup(popupHtml(house, true), { maxWidth: 240 })
      .openPopup();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [house]);

  return <div ref={containerRef} className="w-full h-full" />;
}
