// app/listings/map/[id]/page.tsx
import type { Metadata } from "next";
import SingleHouseMapClient from "./SingleHouseMapClient";

export const metadata: Metadata = {
  title: "Property Location — HouseHunt Kenya",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SingleHouseMapPage({ params }: PageProps) {
  const { id } = await params;
  return <SingleHouseMapClient id={id} />;
}