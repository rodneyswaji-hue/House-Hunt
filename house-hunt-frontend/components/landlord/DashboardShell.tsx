"use client";

// components/landlord/DashboardShell.tsx
// Persistent dark sidebar + topbar. Wraps all /landlord/dashboard/* pages.

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusSquare,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
} from "lucide-react";
import type { Landlord } from "@/lib/types";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/landlord/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "My Properties",
    href: "/landlord/dashboard/properties",
    icon: <Building2 size={18} />,
  },
  {
    label: "Add Property",
    href: "/landlord/dashboard/add",
    icon: <PlusSquare size={18} />,
  },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
          : "text-slate-400 hover:text-white hover:bg-slate-700/60"
      }`}
    >
      <span className={active ? "text-white" : "text-slate-500 group-hover:text-blue-400 transition-colors"}>
        {item.icon}
      </span>
      {item.label}
      {active && <ChevronRight size={14} className="ml-auto" />}
    </Link>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch current landlord info
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setLandlord(data))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/landlord/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-blue-600 flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">HouseHunt</p>
            <p className="text-slate-500 text-xs mt-0.5">Landlord Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-4 mb-3">
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={
              item.href === "/landlord/dashboard"
                ? pathname === "/landlord/dashboard"
                : pathname.startsWith(item.href)
            }
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        {landlord && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-700/40">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {landlord.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{landlord.name}</p>
              <p className="text-slate-500 text-xs truncate">{landlord.phone}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={16} />
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col bg-slate-900 border-r border-slate-700/50 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full w-64 bg-slate-900 z-50 md:hidden flex flex-col"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-slate-900 border-b border-slate-700/50 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            className="md:hidden text-slate-400 hover:text-white transition"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="hidden md:block">
            <p className="text-slate-400 text-sm">
              Welcome back,{" "}
              <span className="text-white font-medium">{landlord?.name ?? "Landlord"}</span>
            </p>
          </div>
          <Link
            href="/listings"
            className="text-xs text-slate-400 hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <Home size={13} />
            View public site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}