"use client";

// components/listings/HouseCard.tsx
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReviewsSection from "@/components/listings/ReviewsSection";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  BedDouble,
  Building2,
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import type { House } from "@/lib/types";

interface HouseCardProps {
  house: House;
}

const MAX_BOOKINGS = 5;
const STORAGE_KEY = "hh_bookings";

// ─── Availability badge ───────────────────────────────────────────────────

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`absolute top-3 left-3 z-20 text-xs font-bold px-2.5 py-1 rounded-full tracking-wide ${
        available
          ? "bg-emerald-500 text-white"
          : "bg-red-500/90 text-white"
      }`}
    >
      {available ? "Available" : "Taken"}
    </span>
  );
}

// ─── Bedroom label ────────────────────────────────────────────────────────

function bedroomLabel(bedrooms: number) {
  if (bedrooms === 0) return "Bedsitter";
  return `${bedrooms} Bed${bedrooms > 1 ? "s" : ""}`;
}

// ─── Main Card ────────────────────────────────────────────────────────────

export default function HouseCard({ house }: HouseCardProps) {
  const router = useRouter();
  const [imgIndex, setImgIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showContact, setShowContact] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");
  const [bookingMsg, setBookingMsg] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  const images = house.images?.length ? house.images : ["/placeholder-house.jpg"];

  // Check if already booked on mount
  useEffect(() => {
    try {
      const stored: { houseId: string; phone: string }[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]"
      );
      setIsBooked(stored.some((b) => b.houseId === house.id));
    } catch {}
  }, [house.id]);

  // Auto-advance images
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setImgIndex((p) => (p + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  const goTo = useCallback(
    (delta: number) => {
      setDirection(delta);
      setImgIndex((p) => (p + delta + images.length) % images.length);
    },
    [images.length]
  );

  // Submit notification booking (stores locally until Django backend is wired)
  // 🔌 DJANGO: Replace localStorage block with POST /api/bookings/
  const handleBooking = async () => {
    setBookingMsg("");
    if (!/^07\d{8}$/.test(bookingPhone)) {
      setBookingStatus("error");
      setBookingMsg("Enter a valid Kenyan number (07XXXXXXXX).");
      return;
    }

    try {
      // ─── Django integration point ────────────────────────────────────
      // Uncomment when backend is ready:
      //
      // const res = await fetch("/api/bookings", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ houseId: house.id, phone: bookingPhone }),
      // });
      // if (!res.ok) throw new Error("Booking failed");
      // ─────────────────────────────────────────────────────────────────

      // Temporary local storage fallback
      const stored: { houseId: string; phone: string }[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? "[]"
      );
      if (stored.length >= MAX_BOOKINGS) {
        setBookingStatus("error");
        setBookingMsg("You've reached the limit of 5 active bookings.");
        return;
      }
      const updated = [...stored, { houseId: house.id, phone: bookingPhone }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setIsBooked(true);
      setBookingStatus("success");
      setBookingMsg(`You'll be notified when ${house.title} has a change.`);
      setBookingPhone("");
      setTimeout(() => setShowBooking(false), 2500);
    } catch {
      setBookingStatus("error");
      setBookingMsg("Something went wrong. Please try again.");
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0 }),
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      layout
    >
      {/* ── Image carousel ── */}
      <div className="relative w-full h-60 overflow-hidden bg-gray-100">
        <AvailabilityBadge available={house.available} />

        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={imgIndex}
            src={images[imgIndex]}
            alt={`${house.title} — photo ${imgIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { duration: 0.55, ease: "easeInOut" }, opacity: { duration: 0.35 } }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goTo(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > imgIndex ? 1 : -1); setImgIndex(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === imgIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 z-20 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
          KES {house.price.toLocaleString()}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-grow gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{house.title}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={13} className="text-blue-500 flex-shrink-0" />
            <span>{house.location}</span>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <BedDouble size={12} />
            {bedroomLabel(house.bedrooms)}
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
            <Building2 size={12} />
            {house.units} unit{house.units !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-auto">
          {/* Contact */}
          <button
            onClick={() => { setShowContact((v) => !v); setShowBooking(false); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
          >
            <Phone size={15} />
            {showContact ? "Hide Contact" : "Contact Landlord"}
          </button>

          <AnimatePresence>
            {showContact && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm space-y-1 overflow-hidden"
              >
                <p className="text-gray-700">
                  <span className="font-semibold">Name: </span>{house.landlord?.name || "—"}
                </p>
                <a
                  href={`tel:${house.landlord?.phone}`}
                  className="flex items-center gap-1.5 text-blue-700 font-semibold hover:underline"
                >
                  <Phone size={13} />
                  {house.landlord?.phone || "—"}
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Get Notified */}
          <button
            onClick={() => { setShowBooking((v) => !v); setShowContact(false); }}
            disabled={isBooked}
            className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition ${
              isBooked
                ? "bg-emerald-100 text-emerald-700 cursor-default"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isBooked ? (
              <><CheckCircle size={15} /> Notification Set</>
            ) : (
              <><Bell size={15} /> {showBooking ? "Cancel" : "Get Notified"}</>
            )}
          </button>

          <AnimatePresence>
            {showBooking && !isBooked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 space-y-2">
                  <p className="text-xs text-gray-500">We'll text you when this property's status changes.</p>
                  <input
                    type="tel"
                    placeholder="07XXXXXXXX"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {bookingMsg && (
                    <p className={`text-xs flex items-start gap-1 ${bookingStatus === "error" ? "text-red-600" : "text-emerald-700"}`}>
                      {bookingStatus === "error" ? <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> : <CheckCircle size={13} className="flex-shrink-0 mt-0.5" />}
                      {bookingMsg}
                    </p>
                  )}
                  <button
                    onClick={handleBooking}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2 rounded-lg transition"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View on Map */}
          <button
            onClick={() => router.push(`/listings/map/${house.id}`)}
            className="w-full flex items-center justify-center gap-2 border border-amber-400 text-amber-700 hover:bg-amber-50 text-sm font-semibold py-2.5 rounded-xl transition"
          >
            <MapPin size={15} />
            View on Map
          </button>
          <>
          <ReviewsSection
            landlordId={house.landlord.id}
            landlordName={house.landlord.name}
          />
          
          </>
          
        </div>
      </div>
    </motion.div>
  );
}