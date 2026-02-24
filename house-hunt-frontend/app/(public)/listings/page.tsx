// app/listings/page.tsx
// Server component — reads search params for SSR/SEO, passes to client components

import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ListingsClient from "./ListingsClient";

export const metadata: Metadata = {
  title: "Browse Rental Listings — HouseHunt Kenya",
  description:
    "Find bedsitters, 1, 2 and 3 bedroom rentals across Nairobi. Filter by location, price and type. Direct landlord contact.",
  keywords: ["houses for rent Nairobi", "bedsitter Nairobi", "1 bedroom rental Kenya"],
};

export default function ListingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Rental Listings</h1>
          <p className="text-gray-500 mt-1">Browse verified properties across Kenya</p>
        </div>
        <Suspense fallback={<div className="h-20 bg-white rounded-2xl animate-pulse" />}>
          <ListingsClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}