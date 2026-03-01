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

export interface House {
  id: string;
  title: string;
  location: string;
  price: number;
  available: boolean;
  units: number;
  bedrooms: 0 | 1 | 2 | 3; // 0 = bedsitter
  images: string[];          // AWS S3 URLs
  video?: string;            // AWS S3 URL
  landlord: {
    id: number;
    name: string;
    phone: string;
  };
  coordinates: Coordinates;
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
  bedrooms?: string;   // "0" | "1" | "2" | "3" | ""
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