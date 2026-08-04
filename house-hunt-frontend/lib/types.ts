// lib/types.ts
export interface Landlord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  createdAt?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

/** Dwelling kind — stored separately from the bedroom count, because
 *  studios, bedsitters and single rooms all have zero bedrooms. */
export type PropertyType =
  | "single_room"
  | "bedsitter"
  | "studio"
  | "apartment"
  | "maisonette"
  | "bungalow"
  | "townhouse"
  | "villa"
  | "penthouse"
  | "servant_quarter";

/** Value/label pairs, ordered smallest-to-largest for the UI. */
export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "single_room", label: "Single Room" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio Apartment" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "maisonette", label: "Maisonette" },
  { value: "bungalow", label: "Bungalow" },
  { value: "townhouse", label: "Townhouse" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "servant_quarter", label: "Servant Quarter (SQ)" },
];

export function propertyTypeLabel(value?: string) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? "Property";
}

export interface House {
  id: string;
  title: string;
  location: string;
  price: number;
  available: boolean;
  units: number;
  /** A count, 0-5 (5 means 5 or more). Not a type — see property_type. */
  bedrooms: number;
  property_type: PropertyType;
  /** Human-readable label supplied by Django. */
  property_type_display?: string;
  images: string[];          // AWS S3 URLs
  video?: string;            // AWS S3 URL
  landlord: {
    id: number;
    name: string;
    /** null when the landlord account has been suspended */
    phone: string | null;
  };
  /** null when the landlord never set a map location for the property */
  coordinates: Coordinates | null;
  is_banned?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id?: string;
  houseId: string;
  phone: string;
  createdAt?: string;
}

export interface HouseFilters {
  location?: string;
  /** Minimum bedroom count, as a string. "" or undefined means any. */
  bedrooms?: string;
  /** A PropertyType value; "" or undefined means any. */
  property_type?: string;
  max_price?: string;
  available?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
}