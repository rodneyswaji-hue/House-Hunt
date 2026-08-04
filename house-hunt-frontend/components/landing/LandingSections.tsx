"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { motion, useInView} from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Search,
  Home,
  Phone,
  ShieldCheck,
  PhoneCall,
  Star,
  Building2,
  ArrowRight,
  TrendingUp,
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





// ─── Content ───────────────────────────────────────────────────────────────
// Merged from the old FeaturesSection (audience + image) and HighlightsSection
// (why-choose-us reasoning) — one entry per audience, each carrying both.

const audienceHighlights = [
  {
    icon: Home,
    tag: "Tenants",
    title: "Find a home you'll love",
    body: "Filter by estate, budget, and bedroom count to find real listings — the way Kenyans actually search for homes.",
    img: "/houseImage.jpeg",
  },
  {
    icon: Building2,
    tag: "Landlords",
    title: "Fill vacancies faster",
    body: "List your property in minutes and connect directly with serious tenants — zero commission, transparent pricing from day one.",
    img: "/landlordSoftware.jpeg",
  },
  {
    icon: TrendingUp,
    tag: "Investors",
    title: "Grow your portfolio",
    body: "Discover high-yield rental properties across Nairobi, backed by real data and a support team that answers fast.",
    img: "/imagesPerson.jpeg",
  },
];

// ─── Pie-slice geometry (percentage-based, scales with container) ─────────

function getSlicePath(index: number, total: number, steps = 32) {
  const startAngle = (360 / total) * index;
  const endAngle = (360 / total) * (index + 1);
  const points = ["50% 50%"];
  for (let s = 0; s <= steps; s++) {
    const theta = startAngle + ((endAngle - startAngle) * s) / steps;
    const mathAngle = ((90 - theta) * Math.PI) / 180;
    const x = 50 + 50 * Math.cos(mathAngle);
    const y = 50 - 50 * Math.sin(mathAngle);
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${points.join(", ")})`;
}

function getLabelPosition(index: number, total: number, radiusFraction = 0.6) {
  const bisector = (360 / total) * (index + 0.5);
  const mathAngle = ((90 - bisector) * Math.PI) / 180;
  const x = 50 + 50 * radiusFraction * Math.cos(mathAngle);
  const y = 50 - 50 * radiusFraction * Math.sin(mathAngle);
  return { left: `${x.toFixed(2)}%`, top: `${y.toFixed(2)}%` };
}

// ─── Flanking text block — same opacity/weight hover pattern as before ────

function AudienceText({
  item,
  index,
  active,
  setActive,
  className = "",
}: {
  item: (typeof audienceHighlights)[number];
  index: number;
  active: number;
  setActive: (index: number) => void;
  className?: string;
}) {
  const isActive = active === index;
  return (
    <div
      onMouseEnter={() => setActive(index)}
      className={`cursor-pointer transition-opacity duration-300 ${className}`.trim()}
      style={{ opacity: isActive ? 1 : 0.45 }}
    >
      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest block mb-1.5">
        {item.tag}
      </span>
      <h3
        className={`text-lg md:text-xl mb-2 transition-colors ${
          isActive ? "font-semibold text-gray-900" : "font-medium text-gray-900"
        }`}
      >
        {item.title}
      </h3>
      <p className="text-[13.5px] text-gray-400 leading-relaxed">{item.body}</p>
    </div>
  );
}

export function WhyChooseUsSection() {
  
  const [active, setActive] = useState(0);
  const total = audienceHighlights.length;

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
            Why choose HouseHunt?
          </h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            The smarter way to rent in Kenya — for tenants, landlords, and investors
          </p>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center gap-10 lg:gap-14">
          {/* Circle — first on mobile, centre column on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 relative mx-auto w-[260px] h-[260px] md:w-[300px] md:h-[300px]"
          >
            {/* Wedges — clip-path also defines the hoverable hit region */}
            {audienceHighlights.map(({ img, tag }, i) => (
              <div
                key={tag}
                onMouseEnter={() => setActive(i)}
                className="absolute inset-0 cursor-pointer"
                style={{
                  clipPath: getSlicePath(i, total),
                  zIndex: active === i ? 2 : 1,
                }}
              >
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ opacity: active === i ? 1 : 0.45 }}
                >
                  <Image src={img} alt={tag} fill sizes="300px" className="object-cover" />
                </div>
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.65) 100%)",
                    opacity: active === i ? 0.75 : 0.9,
                  }}
                />
              </div>
            ))}

            {/* Labels — unclipped, always fully legible */}
            {audienceHighlights.map(({ icon: Icon, tag }, i) => {
              const pos = getLabelPosition(i, total);
              return (
                <div
                  key={tag}
                  onMouseEnter={() => setActive(i)}
                  className="absolute z-10 flex flex-col items-center gap-1.5 cursor-pointer"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Icon size={18} strokeWidth={2} className="text-white" />
                  <span className="text-[11px] font-semibold text-white text-center leading-tight">
                    {tag}
                  </span>
                </div>
              );
            })}

            {/* Centre logo badge */}
            <div className="absolute inset-0 m-auto w-[28%] h-[28%] rounded-full overflow-hidden bg-transparent shadow-[0_8px_24px_-6px_rgba(15,23,42,0.35)] z-20">
              <div className="relative w-full h-full">
                <Image
                  src="/househuntlogo_2.png"
                  alt="HouseHunt"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Left column: Investors */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-end">
            <AudienceText
              item={audienceHighlights[2]}
              index={2}
              active={active}
              setActive={setActive}
              className="max-w-[220px] text-center lg:text-right"
            />
          </div>

          {/* Right column: Tenants */}
          <div className="order-3 flex justify-center lg:justify-start">
            <AudienceText
              item={audienceHighlights[0]}
              index={0}
              active={active}
              setActive={setActive}
              className="max-w-[220px] text-center lg:text-left"
            />
          </div>

          {/* Bottom row: Landlords */}
          <div className="order-4 lg:col-span-3 flex justify-center">
            <AudienceText
              item={audienceHighlights[1]}
              index={1}
              active={active}
              setActive={setActive}
              className="max-w-[260px] text-center"
            />
          </div>
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

//ExploreNeighborhoods
const neighborhoods = [
  {
    name: "Westlands",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390",
    homes: 2430,
  },
  {
    name: "Kilimani",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    homes: 3187,
  },
  {
    name: "Kileleshwa",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118",
    homes: 1472,
  },
  {
    name: "Lavington",
    image:
      "https://images.unsplash.com/photo-1448630360428-65456885c650",
    homes: 1880,
  },
  {
    name: "South B",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156",
    homes: 968,
  },
];

export function ExploreNeighborhoods() {
  const router = useRouter();

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">
            Explore Nairobi Neighborhoods
          </h2>

          <p className="text-gray-500 mt-3">
            Discover apartments in Nairobi's most popular locations.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">

          {neighborhoods.map((item) => (

            <div
              key={item.name}
              onClick={() =>
                router.push(`/listings?location=${encodeURIComponent(item.name)}`)
              }
              className="group relative rounded-3xl overflow-hidden cursor-pointer h-[320px]"
            >

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">

                <div>

                  <h3 className="text-white font-semibold text-2xl">
                    {item.name}
                  </h3>

                  <p className="text-white/80">
                    {item.homes.toLocaleString()} Properties
                  </p>

                </div>

                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">

                  <ArrowRight />

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

// call for landlords

export  function ListPropertyCTA() {

    const router = useRouter();

    return (
    <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-24">

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <span className="inline-flex px-4 py-2 rounded-full bg-white/20 text-white mb-6">
            For Landlords & Property Sellers
          </span>

          <h2 className="text-5xl font-bold text-white leading-tight">

            Have a Property to Rent or Sell?

          </h2>

          <p className="text-blue-100 mt-6 text-lg">

          Reach thousands of active apartment seekers across Nairobi.
          List your property in minutes and connect directly with verified
          buyers and tenants.

          </p>

            <div className="space-y-5 mt-10">

              <div className="flex gap-4">

                <Home className="text-white"/>

                  <div>

                    <h4 className="text-white font-semibold">

                      Free Property Listings

                      </h4>

                      <p className="text-blue-100">

                      Publish apartments, houses and plots in minutes.

                      </p>

                  </div>

              </div>

                  <div className="flex gap-4">

                    <PhoneCall className="text-white"/>

                      <div>

                        <h4 className="text-white font-semibold">

                         Receive Direct Enquiries

                        </h4>

                        <p className="text-blue-100">

                        Interested tenants contact you directly.

                        </p>

                      </div>

                  </div>

                  <div className="flex gap-4">

<ShieldCheck className="text-white"/>

<div>

<h4 className="text-white font-semibold">

Verified Platform

</h4>

<p className="text-blue-100">

Increase trust with verified listings.

</p>

</div>

                  </div>

                </div>

<div className="mt-12 flex gap-4">

<button
onClick={() => router.push("/landlord/register")}
className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:shadow-xl">

List Your Property

</button>

<button
onClick={() => router.push("/contact")}
className="border border-white text-white px-8 py-4 rounded-xl">

Learn More

</button>

</div>

</div>

<div className="relative w-full h-80 rounded-2xl overflow-hidden">

<Image
src="/landlordSoftware.jpeg"
alt="Landlord listing a property on HouseHunt"
fill
className="object-cover"/>

</div>

</div>

</section>

    );
}
