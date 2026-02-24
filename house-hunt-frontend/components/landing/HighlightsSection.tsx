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