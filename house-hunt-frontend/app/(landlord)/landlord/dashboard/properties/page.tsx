// app/landlord/dashboard/properties/page.tsx
import type { Metadata } from "next";
import PropertiesClient from "./PropertiesClient";

export const metadata: Metadata = { title: "My Properties — Landlord Dashboard" };

export default function PropertiesPage() {
  return <PropertiesClient />;
}