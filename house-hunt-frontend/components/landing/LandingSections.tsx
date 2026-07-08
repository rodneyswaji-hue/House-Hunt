"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Search,
  Home,
  Phone,
  Target,
  BarChart2,
  Users,
  Star,
  Building2,
  ArrowRight,
} from "lucide-react";

// ─── Animated Counter ──────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || target === 0) {
      setCount(target);
      return;
    }
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────

const stats = [
  { label: "Verified listings", value: 500, suffix: "+" },
  { label: "Neighbourhoods covered", value: 47, suffix: "" },
  { label: "Commission charged", value: 0, suffix: "", display: "KSh 0" },
  { label: "New listings weekly", value: 24, suffix: "+" },
];

export function StatsBar() {
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center py-10 px-6"
          >
            <div className="text-4xl font-bold text-blue-600">
              {s.display ? (
                s.display
              ) : (
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              )}
            </div>
            <div className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-widest">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    icon: <Search size={22} />,
    title: "Search your area",
    desc: "Filter by neighbourhood, price range, and bedroom count across Nairobi and beyond.",
  },
  {
    num: "02",
    icon: <Home size={22} />,
    title: "Explore verified homes",
    desc: "Every listing includes real photos, exact location, and verified landlord details.",
  },
  {
    num: "03",
    icon: <Phone size={22} />,
    title: "Move in with confidence",
    desc: "Connect directly with landlords. No agents, no middlemen, no surprise fees.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Renting made simple
          </h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            Three steps to your next home — no agent required
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute top-5 right-5 text-sm text-gray-100 font-bold">
                {step.num}
              </span>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-5 text-blue-600">
                {step.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────

const audienceFeatures = [
  {
    img: "/houseImage.jpeg",
    tag: "Tenants",
    title: "Find a home you'll love",
    body: "Smart filters, real photos, and exact locations make it easy to find the right rental — without the runaround.",
  },
  {
    img: "/landlordSoftware.jpeg",
    tag: "Landlords",
    title: "Fill vacancies faster",
    body: "List your property in minutes. Get direct enquiries from serious tenants — zero commission, zero middlemen.",
  },
  {
    img: "/imagesPerson.jpeg",
    tag: "Investors",
    title: "Grow your portfolio",
    body: "Discover high-yield rental properties across Nairobi and make data-informed decisions for your real estate portfolio.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            For every type of renter
          </h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            Whether you&apos;re a tenant, landlord, or investor
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audienceFeatures.map((f, i) => (
            <motion.div
              key={f.tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 cursor-default"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={f.img}
                  alt={f.tag}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest">
                  {f.tag}
                </span>
                <h3 className="text-base font-semibold text-gray-900 mt-1.5 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Highlights Section ───────────────────────────────────────────────────

const highlights = [
  {
    icon: <Target size={22} />,
    title: "Search built for Kenya",
    desc: "Filter by estate, budget, and bedroom count — the way Kenyans actually look for homes.",
  },
  {
    icon: <BarChart2 size={22} />,
    title: "Transparent pricing",
    desc: "See what fair rent looks like in any neighbourhood before you sign anything.",
  },
  {
    icon: <Users size={22} />,
    title: "Real people, real support",
    desc: "A dedicated team behind every listing. We answer questions and resolve issues fast.",
  },
];

export function HighlightsSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-blue-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Why choose HouseHunt?
          </h2>
          <p className="text-gray-400 max-w-sm mx-auto">The smarter way to rent in Kenya</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((h, i) => (
            <motion.div
              key={h.title}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="text-center p-8 bg-white border border-blue-100 rounded-2xl hover:shadow-md transition-shadow duration-300"
            >
              <motion.div
                initial={{ rotate: -15, opacity: 0 }}
                whileInView={{ rotate: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.12 + 0.2,
                  type: "spring",
                  stiffness: 250,
                  damping: 15,
                }}
                className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5 text-blue-600"
              >
                {h.icon}
              </motion.div>
              <h3 className="font-semibold text-gray-900 mb-2">{h.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{h.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Landlord CTA Strip ──────────────────────────────────────────────────

export function LandlordCTASection() {
  return (
    <section className="bg-blue-600 py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-3 block">
            For landlords
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-snug tracking-tight">
            Are you a landlord?<br />
            Start listing for free.
          </h2>
          <p className="text-blue-100 mb-8 max-w-md leading-relaxed text-sm">
            Post your rental in minutes. Tenants contact you directly — no commission, no middlemen, no waiting.
          </p>
          <Link
            href="/landlord/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-7 py-3.5 rounded-full transition-all shadow-lg text-sm"
          >
            <Building2 size={17} />
            List your property free
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex-1 relative h-56 md:h-64 w-full rounded-2xl overflow-hidden border border-blue-500"
        >
          <Image
            src="/landlordSoftware.jpeg"
            alt="Landlord listing dashboard"
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-blue-900/30" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "HouseHunt made finding my ideal rental home a breeze. Highly recommended!",
    name: "Linda R.",
    role: "Tenant, Nairobi",
    initials: "LR",
  },
  {
    quote: "I listed my property and found reliable tenants in no time. Great experience!",
    name: "Michael S.",
    role: "Landlord, Westlands",
    initials: "MS",
  },
  {
    quote: "The support from HouseHunt's team was outstanding. Made my rental journey stress-free.",
    name: "Sophia L.",
    role: "Tenant, Kilimani",
    initials: "SL",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Trusted by renters across Kenya
          </h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            Real stories from real people who found their home on HouseHunt
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex gap-0.5 mb-4 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={13} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed italic mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────

export function FinalCTASection() {
  return (
    <section className="py-28 px-6 bg-gray-50 text-center border-t border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          Your next home<br />is one search away.
        </h2>
        <p className="text-gray-400 mb-10 text-base">
          Join thousands of Kenyans who found their perfect rental — no agent, no commission.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/listings"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg text-base"
          >
            <Search size={18} />
            Browse Listings
          </Link>
          <Link
            href="/landlord/register"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-semibold px-8 py-4 rounded-full transition-all text-base"
          >
            <Building2 size={18} className="text-blue-600" />
            List your property
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
