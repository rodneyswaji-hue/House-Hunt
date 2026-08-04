"use client";

// app/landlord/dashboard/DashboardOverviewClient.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  XCircle,
  PlusSquare,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { House } from "@/lib/types";

function StatCard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardOverviewClient() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A 401 returns { error } — guard so the stats below don't throw.
    fetch("/api/houses?mine=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setHouses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = houses.length;
  const available = houses.filter((h) => h.available).length;
  const unavailable = total - available;
  const recent = houses.slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Your property portfolio at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Properties"
          value={loading ? "—" : total}
          icon={<Building2 size={22} className="text-blue-300" />}
          color="bg-blue-600/20"
          delay={0.05}
        />
        <StatCard
          label="Available"
          value={loading ? "—" : available}
          icon={<CheckCircle2 size={22} className="text-emerald-300" />}
          color="bg-emerald-600/20"
          delay={0.1}
        />
        <StatCard
          label="Unavailable"
          value={loading ? "—" : unavailable}
          icon={<XCircle size={22} className="text-red-300" />}
          color="bg-red-600/20"
          delay={0.15}
        />
      </div>

      {/* Quick actions */}
      <motion.div
        className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-400" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/landlord/dashboard/add"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <PlusSquare size={16} />
            Add New Property
          </Link>
          <Link
            href="/landlord/dashboard/properties"
            className="flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <Building2 size={16} />
            Manage Properties
          </Link>
        </div>
      </motion.div>

      {/* Recent properties */}
      <motion.div
        className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Properties</h2>
          <Link
            href="/landlord/dashboard/properties"
            className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-700/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <Building2 size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No properties yet</p>
            <Link href="/landlord/dashboard/add" className="text-blue-400 text-sm hover:underline mt-1 inline-block">
              Add your first property →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((house) => (
              <div
                key={house.id}
                className="flex items-center justify-between px-4 py-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{house.title}</p>
                  <p className="text-slate-400 text-xs truncate">{house.location}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-emerald-400 text-sm font-semibold">
                    KES {house.price.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      house.available
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {house.available ? "Available" : "Taken"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}