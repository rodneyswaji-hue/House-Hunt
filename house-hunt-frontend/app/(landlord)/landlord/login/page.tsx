// app/landlord/login/page.tsx
import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { LandlordLoginForm } from "@/components/landlord/AuthForms";

export const metadata: Metadata = {
  title: "Landlord Login — HouseHunt Kenya",
  description: "Login to manage your rental property listings on HouseHunt.",
};

export default function LandlordLoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <LandlordLoginForm />
      </main>
      <Footer />
    </div>
  );
}