// app/listings/map/page.tsx
// Full-screen map showing all listings, with a back button

import type { Metadata } from "next";
import AllHousesMapClient from "./AllHousesMapClient";

export const metadata: Metadata = {
  title: "Map View — HouseHunt Kenya",
  description: "Browse rental properties on a map across Nairobi and Kenya.",
};

export default function AllHousesMapPage() {
  return <AllHousesMapClient />;
}