// app/landlord/register/page.tsx
import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { LandlordRegisterForm } from "@/components/landlord/AuthForms";

export const metadata: Metadata = {
  title: "Register as a Landlord — HouseHunt Kenya",
  description: "Create a landlord account to list your rental properties on HouseHunt.",
};

export default function LandlordRegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <LandlordRegisterForm />
      </main>
      <Footer />
    </div>
  );
}