// app/landlord/dashboard/properties/[id]/edit/page.tsx
import type { Metadata } from "next";
import EditPropertyClient from "./EditPropertyClient";

export const metadata: Metadata = {
  title: "Edit Property — HouseHunt Kenya",
  description: "Update your rental listing details, photos and location.",
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  return <EditPropertyClient id={id} />;
}
