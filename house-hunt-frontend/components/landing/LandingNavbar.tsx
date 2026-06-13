"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogIn, Menu, X, Home, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/", icon: <Home size={16} /> },
  { label: "Browse Listings", href: "/listings", icon: null },
  { label: "Contact", href: "#contact", icon: <Phone size={16} /> },
];

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-blue-600 shadow-lg" : "bg-black/20 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-white">
            <Image
              src="/househuntlogo_2.png"
              alt="HouseHunt Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">HouseHunt</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition font-medium text-sm"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <Link
            href="/landlord/login"
            className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 transition font-semibold text-sm px-4 py-2 rounded-full"
          >
            <LogIn size={16} />
            Landlord Login
          </Link>
        </div>

        <button
          className="md:hidden p-1 text-white"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden bg-blue-700 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 text-white hover:text-blue-200 transition font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <Link
                href="/landlord/login"
                className="flex items-center gap-2 text-white hover:text-blue-200 transition font-medium pt-1 border-t border-blue-500"
                onClick={() => setIsOpen(false)}
              >
                <LogIn size={16} />
                Landlord Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
