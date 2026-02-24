// app/page.tsx  — Landing Page
// SEO metadata exported for Next.js
import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import HeroSection from "@/components/landing/HeroSection";
import {
  FeaturesSection,
  HighlightsSection,
  TestimonialsSection,
} from "@/components/landing/LandingSections";

export const metadata: Metadata = {
  title: "HouseHunt Kenya — Find Your Next Rental Home",
  description:
    "Browse verified rental listings across Nairobi and Kenya. Connect directly with landlords. No agents, no hidden fees. Free to browse.",
  keywords: ["houses for rent Kenya", "rental homes Nairobi", "HouseHunt", "apartments Nairobi"],
  openGraph: {
    title: "HouseHunt Kenya",
    description: "Find verified rental homes across Kenya.",
    url: "https://househunt.co.ke",
    siteName: "HouseHunt Kenya",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <HighlightsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}