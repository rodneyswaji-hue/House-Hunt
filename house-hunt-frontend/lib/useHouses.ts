"use client";

// lib/useHouses.ts
// Single source of truth for filtered listings.
// The listings grid, the mini map, the expanded map panel and the full-screen
// map all read from one fetch so they can never drift out of sync.

import { useState, useEffect, useCallback, useMemo } from "react";
import type { House, HouseFilters } from "./types";

export function filtersToQuery(filters: HouseFilters): string {
  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location);
  if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
  if (filters.property_type) params.set("property_type", filters.property_type);
  if (filters.max_price) params.set("max_price", filters.max_price);
  if (filters.available !== undefined) params.set("available", String(filters.available));
  return params.toString();
}

export interface UseHousesResult {
  houses: House[];
  /** Only the houses that have usable coordinates — what the map can plot. */
  mappable: House[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useHouses(filters: HouseFilters): UseHousesResult {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const query = filtersToQuery(filters);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/houses${query ? `?${query}` : ""}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load listings");
        return r.json();
      })
      .then((data) => {
        // Django may return a bare array or a paginated { results: [] } envelope
        const list: House[] = Array.isArray(data) ? data : data?.results ?? [];
        setHouses(list);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setHouses([]);
        setError("Could not load listings. Please try again.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [query, reloadCount]);

  const mappable = useMemo(
    () =>
      houses.filter(
        (h) =>
          typeof h.coordinates?.lat === "number" &&
          typeof h.coordinates?.lng === "number"
      ),
    [houses]
  );

  const reload = useCallback(() => setReloadCount((c) => c + 1), []);

  return { houses, mappable, loading, error, reload };
}
