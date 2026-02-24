
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