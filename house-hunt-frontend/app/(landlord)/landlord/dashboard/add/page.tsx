// app/landlord/dashboard/add/page.tsx
import type { Metadata } from "next";
import HouseFormClient from "./HouseFormClient";

export const metadata: Metadata = { title: "Add Property — Landlord Dashboard" };

export default function AddPropertyPage() {
  return <HouseFormClient />;
}