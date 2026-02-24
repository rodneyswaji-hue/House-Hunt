// app/landlord/forgot-password/page.tsx
import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ForgotPasswordForm } from "@/components/landlord/AuthForms";

export const metadata: Metadata = {
  title: "Reset Password — HouseHunt Kenya",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <ForgotPasswordForm />
      </main>
      <Footer />
    </div>
  );
}