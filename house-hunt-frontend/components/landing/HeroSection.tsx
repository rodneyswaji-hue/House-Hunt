"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, MapPin, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-gray-50 min-h-[90vh] flex flex-col md:flex-row items-stretch overflow-hidden">
      {/* Left — Image */}
      <div className="relative md:w-1/2 h-72 md:h-auto">
        <Image
          src="/nairobi2.jpg"
          alt="Nairobi skyline — find your home"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay so text on mobile stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50/30 hidden md:block" />
      </div>

      {/* Right — Content */}
      <div className="md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-14">
        <motion.span
          className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🇰🇪 Trusted by renters across Kenya
        </motion.span>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-blue-700 leading-tight mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Your Ultimate <br />
          House Hunting <br />
          Partner
        </motion.h1>

        <motion.p
          className="text-gray-600 text-lg mb-8 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Browse verified rental listings across Nairobi and beyond. Connect directly with landlords — no agents, no hidden fees.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/listings"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-full transition text-base shadow-md"
          >
            <Search size={18} />
            Browse Listings
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/listings?view=map"
            className="flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-7 py-3 rounded-full transition text-base"
          >
            <MapPin size={18} />
            View on Map
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap gap-6 mt-10 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="flex items-center gap-1">✅ Verified listings</span>
          <span className="flex items-center gap-1">📍 Location maps included</span>
          <span className="flex items-center gap-1">💬 Direct landlord contact</span>
          <span className="flex items-center gap-1">🔒 Free to browse</span>
        </motion.div>
      </div>
    </section>
  );
}