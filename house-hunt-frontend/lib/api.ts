// lib/api.ts
// Centralized fetch helpers — swap DJANGO_API_URL in .env when backend is ready

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Houses ──────────────────────────────────────────────────────────────────

export const housesApi = {
  getAll: () => request<House[]>("/houses/"),
  getOne: (id: string) => request<House>(`/houses/${id}/`),
  create: (data: Omit<House, "id" | "createdAt" | "updatedAt">) =>
    request<House>("/houses/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<House>) =>
    request<House>(`/houses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<void>(`/houses/${id}/`, { method: "DELETE" }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (identifier: string, password: string) =>
    request<{ token: string; landlord: Landlord }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  register: (data: { name: string; phone: string; password: string }) =>
    request<{ message: string }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendOtp: (phone: string) =>
    request<{ message: string }>("/auth/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ message: string }>("/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),
  resetPassword: (phone: string, otp: string, newPassword: string) =>
    request<{ message: string }>("/auth/reset-password/", {
      method: "POST",
      body: JSON.stringify({ phone, otp, new_password: newPassword }),
    }),
};

// ─── Types (re-exported for convenience) ─────────────────────────────────────
import type { House, Landlord } from "./types";
export type { House, Landlord };