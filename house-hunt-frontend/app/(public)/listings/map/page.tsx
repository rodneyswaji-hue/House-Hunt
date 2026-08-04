// app/listings/map/page.tsx
// Full-screen map showing all listings, with a back button

import type { Metadata } from "next";
import { Suspense } from "react";
import AllHousesMapClient from "./AllHousesMapClient";

export const metadata: Metadata = {
  title: "Map View — HouseHunt Kenya",
  description: "Browse rental properties on a map across Nairobi and Kenya.",
};

export default function AllHousesMapPage() {
  // AllHousesMapClient reads filter query params, so it needs a Suspense
  // boundary for this route to prerender.
  return (
    <Suspense fallback={<div className="h-screen w-full bg-gray-100 animate-pulse" />}>
      <AllHousesMapClient />
    </Suspense>
  );
}