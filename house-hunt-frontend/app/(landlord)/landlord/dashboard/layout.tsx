// app/landlord/dashboard/layout.tsx
// Dark sidebar layout wrapping all dashboard pages.
// middleware.ts already guards this route — if we reach here, user is authenticated.

import type { Metadata } from "next";
import DashboardShell from "@/components/landlord/DashboardShell";

export const metadata: Metadata = {
  title: "Landlord Dashboard — HouseHunt Kenya",
  description: "Manage your rental property listings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
