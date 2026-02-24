"use client";

// app/listings/ListingsClient.tsx
// Handles filter state on the client side. Reads initial filters from URL.

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/listings/SearchBar";
import HouseList from "@/components/listings/HouseList";
import type { HouseFilters } from "@/lib/types";

export default function ListingsClient() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<HouseFilters>({
    location: searchParams.get("location") ?? undefined,
    bedrooms: searchParams.get("bedrooms") ?? undefined,
    max_price: searchParams.get("max_price") ?? undefined,
  });

  return (
    <>
      <SearchBar onFilter={setFilters} initialFilters={filters} />
      <div className="mt-6">
        <HouseList filters={filters} />
      </div>
    </>
  );
}