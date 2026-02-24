// components/landing/LandingSections.tsx
// Features, Highlights, and Testimonials combined — reduces file sprawl

import Image from "next/image";

// ─── Feature Cards ─────────────────────────────────────────────────────────

const audienceFeatures = [
  {
    img: "/houseImage.jpeg",
    title: "Tenants",
    subtitle: "Discover Ideal Rental Properties",
    body: "Advanced search filters and a seamless interface make it effortless to find the perfect rental home across Nairobi and beyond.",
  },
  {
    img: "/landlordSoftware.jpeg",
    title: "Landlords",
    subtitle: "Maximize Your Property's Potential",
    body: "List your rental properties to reach thousands of potential tenants and get the best value for your investment.",
  },
  {
    img: "/imagesPerson.jpeg",
    title: "Investors",
    subtitle: "Optimize Your Returns",
    body: "Discover lucrative rental properties and grow your real estate portfolio with data-driven insights.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-14 bg-blue-50 px-6 md:px-12 lg:px-20">
      <h2 className="text-3xl sm:text-4xl text-blue-700 font-bold text-left mb-10">
        Our Exclusive Features
      </h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {audienceFeatures.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white overflow-hidden"
          >
            <div className="relative h-52 w-full">
              <Image src={f.img} alt={f.title} fill className="object-cover" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-blue-700">{f.title}</h3>
              <p className="text-blue-500 text-sm mt-1">{f.subtitle}</p>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Key Highlights ───────────────────────────────────────────────────────

const highlights = [
  {
    title: "Customized Experience",
    description:
      "We understand your unique needs and offer personalized solutions to simplify your rental property search and leasing process.",
    icon: "🎯",
  },
  {
    title: "Market Insights",
    description:
      "Leverage extensive knowledge of the local rental market to gain valuable insights and make informed decisions.",
    icon: "📊",
  },
  {
    title: "Client Support",
    description:
      "Your satisfaction is our priority. We strive to exceed your expectations and foster long-term relationships.",
    icon: "🤝",
  },
];

export function HighlightsSection() {
  return (
    <section className="bg-blue-100 py-16 px-6 md:px-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">Key Highlights</h2>
        <p className="text-gray-600 text-lg mb-2">Why House Hunt?</p>
        <p className="text-gray-600 text-sm mb-12 max-w-xl">
          A user-friendly platform with transparent processes and a focus on customer satisfaction — ensuring a smooth house hunting experience.
        </p>
        <div className="space-y-10">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="group flex items-start gap-6 hover:bg-white/50 rounded-2xl p-4 transition-all duration-300 cursor-default"
            >
              <span className="text-4xl">{h.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-1 group-hover:text-blue-800 transition-colors">
                  {h.title}
                </h3>
                <p className="text-blue-900/80 text-sm max-w-2xl">{h.description}</p>
              </div>
            </div>
          ))}
        </div>
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
  },
  {
    quote: "I listed my property and found reliable tenants in no time. Great experience!",
    name: "Michael S.",
    role: "Landlord, Westlands",
  },
  {
    quote: "The support from HouseHunt's team was outstanding. Made my rental journey stress-free.",
    name: "Sophia L.",
    role: "Tenant, Kilimani",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((t) => (
            <div key={t.name} className="border border-blue-100 rounded-2xl p-6 hover:shadow-md transition">
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <p className="font-semibold text-blue-700 text-sm">{t.name}</p>
              <p className="text-blue-400 text-xs">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}