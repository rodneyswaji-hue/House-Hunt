// app/landlord/dashboard/page.tsx
// Overview: stats cards + quick actions + recent listings preview

import type { Metadata } from "next";
import DashboardOverviewClient from "./DashboardOverviewClient";

export const metadata: Metadata = { title: "Overview — Landlord Dashboard" };

export default function DashboardPage() {
  return <DashboardOverviewClient />;
}