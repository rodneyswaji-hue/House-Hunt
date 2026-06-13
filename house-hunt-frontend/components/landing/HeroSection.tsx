"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  ShieldCheck,
  Lock,
  MessageCircle,
  Map,
  ChevronDown,
} from "lucide-react";

const floatingCards = [
  {
    price: "KSh 25,000/mo",
    location: "Kilimani, Nairobi",
    beds: "2 bed",
    badge: "New",
    badgeColor: "bg-blue-600",
  },
  {
    price: "KSh 18,000/mo",
    location: "Westlands, Nairobi",
    beds: "1 bed",
    badge: null,
    badgeColor: "",
  },
  {
    price: "KSh 45,000/mo",
    location: "Lavington, Nairobi",
    beds: "3 bed",
    badge: "Hot",
    badgeColor: "bg-amber-500",
  },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Video / image background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/nairobi2.jpg"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-blue-900/65 to-blue-950/85" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6"
        >
          <ShieldCheck size={13} />
          Verified rentals across Kenya
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-[1.08] mb-5 tracking-tight"
        >
          Your Ultimate<br />
          <span className="text-blue-300">House Hunting</span><br />
          Partner
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/70 text-lg md:text-xl mb-8 max-w-md mx-auto leading-relaxed"
        >
          Browse verified rental listings across Nairobi and beyond. No agents, no hidden fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/listings"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-900/40 text-base"
          >
            <Search size={18} />
            Browse Listings
          </Link>
          <Link
            href="/listings?view=map"
            className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base"
          >
            <MapPin size={18} />
            View on Map
          </Link>
        </motion.div>

        {/* Trust tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex flex-wrap gap-5 justify-center mt-10 text-sm text-white/50"
        >
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Verified listings</span>
          <span className="flex items-center gap-1.5"><Map size={14} /> Location maps</span>
          <span className="flex items-center gap-1.5"><MessageCircle size={14} /> Direct contact</span>
          <span className="flex items-center gap-1.5"><Lock size={14} /> Free to browse</span>
        </motion.div>
      </div>

      {/* Floating property preview cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="relative z-10 hidden md:flex gap-4 mt-14 px-6"
      >
        {floatingCards.map((card, i) => (
          <motion.div
            key={card.location}
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.9,
              ease: "easeInOut",
            }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden w-44"
          >
            <div className="h-20 bg-white/5 relative flex items-center justify-center">
              {card.badge && (
                <span
                  className={`absolute top-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              )}
              <MapPin size={18} className="text-white/25" />
            </div>
            <div className="p-3">
              <div className="text-white font-semibold text-sm">{card.price}</div>
              <div className="text-white/50 text-xs mt-0.5">{card.location}</div>
              <span className="mt-2 inline-block text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded">
                {card.beds}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/30 text-xs"
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
