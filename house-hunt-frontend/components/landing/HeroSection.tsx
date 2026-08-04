"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  BedDouble,
  ArrowRight,
  ShieldCheck,
  Wifi,
  ExternalLink,
} from "lucide-react";

const AllHousesMap = dynamic(
  () => import("@/components/listings/MapView").then((m) => m.AllHousesMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 animate-pulse" /> }
);
import type { House } from "@/lib/types";

// ─── Featured Rental Card ─────────────────────────────────────────────────

function FeaturedCard({ house }: { house: House }) {
  const img = house.images?.[0] ?? null;
  const bedroomLabel =
    house.bedrooms === 0 ? "Bedsitter" : `${house.bedrooms} Bed${house.bedrooms > 1 ? "s" : ""}`;

  return (
    <Link href="/listings">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      >
        <div className="relative h-44 bg-gray-100">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={house.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <MapPin size={28} className="text-blue-300" />
            </div>
          )}
          <span
            className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
              house.available ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {house.available ? "Available" : "Taken"}
          </span>
          <span className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            KES {house.price.toLocaleString()}/mo
          </span>
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 text-sm leading-snug truncate">{house.title}</h4>
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
            <MapPin size={11} className="text-blue-400 flex-shrink-0" />
            <span className="truncate">{house.location}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
              <BedDouble size={10} />
              {bedroomLabel}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/4 mt-1" />
      </div>
    </div>
  );
}

// ─── Featured Rentals ─────────────────────────────────────────────────────

function FeaturedRentals() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudOff, setCloudOff] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/houses?limit=4", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("unavailable");
        return r.json();
      })
      .then((data) => {
        const list: House[] = Array.isArray(data) ? data : data.results ?? [];
        setHouses(list.slice(0, 4));
        setLoading(false);
      })
      .catch(() => {
        setCloudOff(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Rentals</h2>
          <p className="text-gray-400 text-sm mt-0.5">Hand-picked listings across Nairobi</p>
        </div>
        <Link
          href="/listings"
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold transition"
        >
          View all <ArrowRight size={15} />
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && cloudOff && (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Wifi size={32} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium text-sm">Listings coming soon</p>
          <p className="text-gray-400 text-xs mt-1 max-w-xs">
            Cloud storage is currently paused. Listings will appear here once it&apos;s reconnected.
          </p>
          <Link
            href="/listings"
            className="mt-5 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
          >
            Browse all listings <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {!loading && !cloudOff && houses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MapPin size={32} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium text-sm">No listings yet</p>
          <Link
            href="/listings"
            className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
          >
            Browse all listings <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {!loading && !cloudOff && houses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {houses.map((h) => (
            <FeaturedCard key={h.id} house={h} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────

export default function HeroSection() {
  const [search, setSearch] = useState("");
  const [heroHouses, setHeroHouses] = useState<import("@/lib/types").House[]>([]);

  useEffect(() => {
    fetch("/api/houses?limit=20")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        setHeroHouses(list.filter((h: import("@/lib/types").House) => h.coordinates?.lat && h.coordinates?.lng));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative bg-white overflow-hidden">
      {/* ── Top split: text left + video right ── */}
      <div className="relative flex flex-col lg:flex-row min-h-[88vh]">

        {/* Left — content */}
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 py-20 lg:py-0 lg:w-[55%] bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 w-fit"
          >
            <ShieldCheck size={13} />
            Verified rentals across Kenya
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.06] tracking-tight mb-5"
          >
            Find your next<br />
            <span className="text-blue-600">home in Kenya.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed"
          >
            Browse thousands of verified rental listings across Nairobi and beyond.
            No agents. No hidden fees. Just homes.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center bg-white border-2 border-gray-200 focus-within:border-blue-500 rounded-2xl shadow-lg overflow-hidden max-w-lg transition-colors duration-200"
          >
            <Search size={18} className="ml-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by area, estate or city…"
              className="flex-1 px-3 py-4 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.location.href = `/listings?location=${encodeURIComponent(search)}`;
                }
              }}
            />
            <Link
              href={`/listings${search ? `?location=${encodeURIComponent(search)}` : ""}`}
              className="m-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              Search
            </Link>
          </motion.div>

          {/* Quick filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2 mt-5"
          >
            {["Kilimani", "Westlands", "Lavington", "Kasarani", "Ruaka"].map((area) => (
              <Link
                key={area}
                href={`/listings?location=${area}`}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors font-medium"
              >
                <MapPin size={10} />
                {area}
              </Link>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap gap-6 mt-10 text-sm text-gray-400"
          >
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-500" /> Verified listings</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500" /> Location maps</span>
            <span className="flex items-center gap-1.5 font-semibold text-gray-500">500+ homes listed</span>
          </motion.div>
        </div>

        {/* Right — Live Map */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:w-[45%] min-h-[50vh] lg:min-h-full overflow-hidden"
        >
          {/* Mobile: tap-to-open map teaser */}
          <Link
            href="/listings/map"
            className="lg:hidden absolute inset-0 z-20 flex flex-col items-center justify-center bg-blue-900/60 backdrop-blur-sm gap-3"
          >
            <div className="bg-white rounded-2xl px-6 py-4 shadow-2xl flex flex-col items-center gap-2">
              <MapPin size={28} className="text-blue-600" />
              <span className="text-gray-900 font-bold text-base">Explore on Map</span>
              <span className="text-gray-500 text-xs">Tap to browse listings</span>
              <span className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
                Open full map <ExternalLink size={11} />
              </span>
            </div>
          </Link>

          {/* Left-edge fade to blend with white panel */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-10 lg:block hidden pointer-events-none" />

          {/* Live map — desktop interactive, mobile blurred preview */}
          <div className="absolute inset-0">
            <AllHousesMap houses={heroHouses} compact />
          </div>

          {/* Floating pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 whitespace-nowrap"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-800">Live listings on map</span>
            <Link href="/listings/map" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
              Explore <ExternalLink size={10} />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Featured Rentals below the fold ── */}
      <div className="bg-gray-50 border-t border-gray-100 pt-16">
        <FeaturedRentals />
      </div>
    </section>
  );
}
