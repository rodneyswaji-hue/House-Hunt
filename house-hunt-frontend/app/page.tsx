// app/page.tsx — Landing Page
import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import Footer from "@/components/ui/Footer";
import HeroSection from "@/components/landing/HeroSection";
import {
  
  HowItWorksSection,
  FeaturesSection,
  HighlightsSection,
  LandlordCTASection,
  TestimonialsSection,
  FinalCTASection,
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
      <LandingNavbar />
      <main className="flex-grow">
        <HeroSection />
        
        <HowItWorksSection />
        <FeaturesSection />
        <HighlightsSection />
        <LandlordCTASection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
