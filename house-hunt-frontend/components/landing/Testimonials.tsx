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