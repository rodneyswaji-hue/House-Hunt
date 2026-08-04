"use client";

// app/admin/page.tsx
// Full site admin dashboard — stats, landlord management, feedback queue, audit log.
// Protected: only accessible to Django superusers (is_staff=True).

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, MessageSquare,
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle,
  Mail, Clock, Eye, RefreshCw, ChevronRight,
  AlertTriangle, Star, FileText, Activity,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface Stats {
  landlords: { total: number; active: number; banned: number; new_this_week: number; new_this_month: number };
  houses: { total: number; available: number; unavailable: number };
  bookings: { total: number; this_week: number };
  tenants: { total: number; new_this_week: number };
  feedback: { total_reviews: number; pending_reviews: number; approved_reviews: number; unread_messages: number };
  audit: { recent_actions: { performed_by: string; action: string; target_repr: string; timestamp: string }[] };
}

interface Landlord {
  id: number; name: string; phone: string; email?: string;
  is_banned: boolean; ban_reason: string; created_at: string;
}

interface Review {
  id: number; tenant_name: string; landlord_name: string;
  rating: number; comment: string; created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "landlords", label: "Landlords", icon: <Users size={16} /> },
  { id: "feedback", label: "Feedback Queue", icon: <MessageSquare size={16} /> },
  { id: "audit", label: "Audit Log", icon: <Activity size={16} /> },
];

function StatCard({ label, value, icon, sub, color }: {
  label: string; value: number | string; icon: React.ReactNode; sub?: string; color: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${color}`}>
      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
      ))}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [auditLogs, setAuditLogs] = useState<{ performed_by: string; action: string; target_repr: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banModal, setBanModal] = useState<{ landlord: Landlord | null; open: boolean }>({ landlord: null, open: false });
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.status === 403) { setError("Admin access required."); return; }
      if (res.status === 401) { setError("Please sign in as an admin."); return; }
      if (!res.ok) { setError("Failed to load stats."); return; }
      setStats(await res.json());
    } catch { setError("Failed to load stats."); }
  }, []);

  const loadLandlords = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/landlords");
      const data = await res.json();
      setLandlords(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const loadFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const loadAudit = useCallback(async () => {
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([loadStats(), loadLandlords(), loadFeedback(), loadAudit()])
      .finally(() => setLoading(false));
  }, [loadStats, loadLandlords, loadFeedback, loadAudit]);

  // ── Ban / Unban ───────────────────────────────────────────────────────
  const handleBan = async () => {
    if (!banModal.landlord) return;
    setActionLoading(banModal.landlord.id);
    const res = await fetch(`/api/admin/landlords/${banModal.landlord.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ban", reason: banReason || "Violated terms of service" }),
    });
    if (res.ok) {
      await loadLandlords();
      await loadStats();
      setBanModal({ landlord: null, open: false });
      setBanReason("");
    }
    setActionLoading(null);
  };

  const handleUnban = async (landlord: Landlord) => {
    setActionLoading(landlord.id);
    const res = await fetch(`/api/admin/landlords/${landlord.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unban" }),
    });
    if (res.ok) { await loadLandlords(); await loadStats(); }
    setActionLoading(null);
  };

  // ── Review actions ────────────────────────────────────────────────────
  const handleReviewAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) { await loadFeedback(); await loadStats(); }
    setActionLoading(null);
  };

  const filteredLandlords = landlords.filter((l) =>
    (l.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.phone ?? "").includes(searchQuery)
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400 flex items-center gap-3">
        <RefreshCw size={20} className="animate-spin" />
        Loading admin dashboard…
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-red-400 flex items-center gap-2">
        <AlertTriangle size={20} /> {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-400" />
            HouseHunt Admin
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Site management dashboard</p>
        </div>
        <button onClick={() => { loadStats(); loadLandlords(); loadFeedback(); loadAudit(); }}
          className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-700">
          <RefreshCw size={16} />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-52 bg-slate-900 border-r border-slate-700/50 min-h-[calc(100vh-65px)] p-3">
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}>
                {t.icon} {t.label}
                {t.id === "feedback" && (stats?.feedback.pending_reviews ?? 0) > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {stats!.feedback.pending_reviews}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
              <h2 className="text-xl font-bold">Site Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Landlords" value={stats.landlords.total}
                  sub={`+${stats.landlords.new_this_week} this week`}
                  icon={<Users size={20} className="text-blue-300" />} color="bg-blue-900/40 border-blue-700/40 text-blue-100" />
                <StatCard label="Total Houses" value={stats.houses.total}
                  sub={`${stats.houses.available} available`}
                  icon={<Building2 size={20} className="text-emerald-300" />} color="bg-emerald-900/40 border-emerald-700/40 text-emerald-100" />
                <StatCard label="Tenants" value={stats.tenants.total}
                  sub={`+${stats.tenants.new_this_week} this week`}
                  icon={<Users size={20} className="text-purple-300" />} color="bg-purple-900/40 border-purple-700/40 text-purple-100" />
                <StatCard label="Bookings" value={stats.bookings.total}
                  sub={`${stats.bookings.this_week} this week`}
                  icon={<FileText size={20} className="text-amber-300" />} color="bg-amber-900/40 border-amber-700/40 text-amber-100" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Banned Landlords" value={stats.landlords.banned}
                  icon={<ShieldAlert size={20} className="text-red-300" />} color="bg-red-900/40 border-red-700/40 text-red-100" />
                <StatCard label="Pending Reviews" value={stats.feedback.pending_reviews}
                  icon={<Star size={20} className="text-amber-300" />} color="bg-amber-900/40 border-amber-700/40 text-amber-100" />
                <StatCard label="Approved Reviews" value={stats.feedback.approved_reviews}
                  icon={<CheckCircle2 size={20} className="text-emerald-300" />} color="bg-emerald-900/40 border-emerald-700/40 text-emerald-100" />
                <StatCard label="Unread Messages" value={stats.feedback.unread_messages}
                  icon={<Mail size={20} className="text-blue-300" />} color="bg-blue-900/40 border-blue-700/40 text-blue-100" />
              </div>

              {/* Recent audit actions */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-blue-400" /> Recent Actions
                </h3>
                <div className="space-y-2">
                  {stats.audit.recent_actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400 font-medium w-32 truncate">{a.performed_by}</span>
                      <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{a.action.replace("_", " ")}</span>
                      <span className="text-slate-400 truncate flex-1">{a.target_repr}</span>
                      <span className="text-slate-600 text-xs flex-shrink-0">
                        {new Date(a.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {stats.audit.recent_actions.length === 0 && (
                    <p className="text-slate-500 text-sm">No actions yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── LANDLORDS ── */}
          {tab === "landlords" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Landlords ({landlords.length})</h2>
                <input type="text" placeholder="Search by name or phone…"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 w-56" />
              </div>

              <div className="space-y-2">
                {filteredLandlords.map((landlord) => (
                  <div key={landlord.id}
                    className={`bg-slate-800/60 border rounded-2xl p-4 flex items-center gap-4 ${
                      landlord.is_banned ? "border-red-700/40" : "border-slate-700/50"
                    }`}>
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {landlord.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{landlord.name}</p>
                        {landlord.is_banned && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Banned</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs">{landlord.phone}</p>
                      {landlord.is_banned && landlord.ban_reason && (
                        <p className="text-red-400 text-xs mt-0.5">Reason: {landlord.ban_reason}</p>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs flex-shrink-0">
                      {new Date(landlord.created_at).toLocaleDateString()}
                    </p>
                    {landlord.is_banned ? (
                      <button onClick={() => handleUnban(landlord)}
                        disabled={actionLoading === landlord.id}
                        className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-3 py-2 rounded-lg transition flex-shrink-0">
                        <ShieldCheck size={13} />
                        {actionLoading === landlord.id ? "…" : "Unban"}
                      </button>
                    ) : (
                      <button onClick={() => setBanModal({ landlord, open: true })}
                        disabled={actionLoading === landlord.id}
                        className="flex items-center gap-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-lg transition flex-shrink-0">
                        <ShieldAlert size={13} />
                        Ban
                      </button>
                    )}
                  </div>
                ))}
                {filteredLandlords.length === 0 && (
                  <p className="text-slate-500 text-sm py-8 text-center">No landlords found</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── FEEDBACK QUEUE ── */}
          {tab === "feedback" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-4xl">
              <h2 className="text-xl font-bold">
                Pending Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-sm bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                    {reviews.length}
                  </span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-semibold">All caught up!</p>
                  <p className="text-slate-400 text-sm mt-1">No pending reviews to approve.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="text-white font-medium text-sm">{review.tenant_name}</span>
                            <ChevronRight size={14} className="text-slate-500" />
                            <span className="text-slate-400 text-sm">{review.landlord_name}</span>
                            <Stars rating={review.rating} />
                            {(review as any).complaint_reason && (
                              <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                                {(review as any).complaint_reason_display || (review as any).complaint_reason}
                              </span>
                            )}
                          </div>
                          {(review as any).explanation && (
                            <p className="text-slate-200 text-sm mt-1 font-medium">{(review as any).explanation}</p>
                          )}
                          {review.comment && (
                            <p className="text-slate-400 text-sm mt-1">{review.comment}</p>
                          )}
                          <p className="text-slate-500 text-xs mt-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleReviewAction(review.id, "approve")}
                            disabled={actionLoading === review.id}
                            className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 px-3 py-2 rounded-lg transition">
                            <CheckCircle2 size={13} />
                            {actionLoading === review.id ? "…" : "Approve"}
                          </button>
                          <button onClick={() => handleReviewAction(review.id, "reject")}
                            disabled={actionLoading === review.id}
                            className="flex items-center gap-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-lg transition">
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      </div>
                      {/* Proof images */}
                      {(review as any).proof_images?.length > 0 && (
                        <div className="flex gap-2 flex-wrap pt-1 border-t border-slate-700/40">
                          <span className="text-slate-500 text-xs self-center">Proof:</span>
                          {(review as any).proof_images.map((img: any) => (
                            <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer"
                              className="w-14 h-14 rounded-lg overflow-hidden border border-slate-600 hover:border-slate-400 transition flex-shrink-0">
                              <img src={img.url} alt="proof" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── AUDIT LOG ── */}
          {tab === "audit" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-4xl">
              <h2 className="text-xl font-bold">Audit Log</h2>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Admin</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Action</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Target</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, i) => (
                      <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                        <td className="px-4 py-3 text-white">{log.performed_by}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            log.action.includes("ban") ? "bg-red-500/20 text-red-400" :
                            log.action.includes("approve") ? "bg-emerald-500/20 text-emerald-400" :
                            log.action.includes("reject") ? "bg-amber-500/20 text-amber-400" :
                            "bg-slate-600/40 text-slate-300"
                          }`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{log.target_repr}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No actions logged yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* ── Ban Modal ── */}
      <AnimatePresence>
        {banModal.open && banModal.landlord && (
          <motion.div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert size={20} className="text-red-400" />
                <h3 className="text-white font-semibold">Ban {banModal.landlord.name}?</h3>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Their listings will remain visible but contact information will be hidden and a "Suspended" badge will appear.
              </p>
              <div className="mb-5">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Reason for ban
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Fraudulent listing, harassment of tenants…"
                  rows={3}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setBanModal({ landlord: null, open: false }); setBanReason(""); }}
                  className="flex-1 border border-slate-600 hover:border-slate-400 text-slate-300 text-sm font-medium py-2.5 rounded-xl transition">
                  Cancel
                </button>
                <button onClick={handleBan} disabled={actionLoading !== null}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition">
                  {actionLoading !== null ? "Banning…" : "Confirm Ban"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}