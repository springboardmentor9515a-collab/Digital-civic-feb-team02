"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { petitionApi } from "@/lib/api";
import {
  Clock, MapPin, Shield, TrendingUp, FileText,
  Users, CheckCircle, AlertCircle, XCircle, Plus,
  ChevronRight, BarChart3, Tag, RefreshCw
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const STATUS_NEXT: Record<string, { label: string; value: string; color: string }[]> = {
  active: [
    { label: "Set Under Review", value: "under_review", color: "bg-yellow-500 hover:bg-yellow-600 text-white" },
    { label: "Close", value: "closed", color: "bg-red-500 hover:bg-red-600 text-white" },
  ],
  under_review: [
    { label: "Activate", value: "active", color: "bg-green-500 hover:bg-green-600 text-white" },
    { label: "Close", value: "closed", color: "bg-red-500 hover:bg-red-600 text-white" },
  ],
  closed: [
    { label: "Reopen", value: "active", color: "bg-green-500 hover:bg-green-600 text-white" },
  ],
};

interface Petition {
  _id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  signatureCount: number;
  createdAt: string;
  creator?: { name: string };
}

interface Stats {
  totalPetitions: number;
  activePetitions: number;
  underReviewPetitions: number;
  closedPetitions: number;
  totalSignatures: number;
}

// ─── Official Dashboard ────────────────────────────────────────────────────────
function OfficialDashboard({ user }: { user: { name: string; role: string; location: string; isVerified: boolean; _id: string } }) {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        petitionApi.getAll(),
        petitionApi.getStats(),
      ]);
      if (pRes.success) setPetitions(pRes.petitions || []);
      if (sRes.success) setStats(sRes.stats);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user.location]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (petitionId: string, newStatus: string) => {
    setUpdating(petitionId);
    setStatusMsg(null);
    try {
      const res = await petitionApi.updateStatus(petitionId, newStatus);
      if (res.success) {
        setPetitions((prev) =>
          prev.map((p) => p._id === petitionId ? { ...p, status: newStatus } : p)
        );
        setStatusMsg({ id: petitionId, msg: res.message, ok: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setStatusMsg({ id: petitionId, msg, ok: false });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Header with Background Image */}
      <div className="relative h-[240px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/75" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">
                  Official Dashboard
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Welcome, {user.name}
              </h1>
              <p className="text-gray-300 mt-2 flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" /> Managing all petitions across users
              </p>
            </div>
            <button onClick={load} className="flex items-center gap-2 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg transition-all">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-12">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-md">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-indigo-50 dark:bg-indigo-900/30">
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPetitions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-md">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-emerald-50 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePetitions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-md">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-amber-50 dark:bg-amber-900/30">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.underReviewPetitions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-md">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gray-100 dark:bg-gray-700">
                <XCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.closedPetitions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
            </div>
          </div>
        )}

        {/* Petitions management table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Petitions
              </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{petitions.length} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : petitions.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No petitions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {petitions.map((p) => (
                <div key={p._id} className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link href={`/petitions/${p._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
                          {p.title}
                        </Link>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[p.status] || STATUS_STYLES.closed}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{p.category}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.signatureCount} signatures</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      {/* Inline status message */}
                      {statusMsg?.id === p._id && (
                        <p className={`text-xs mt-2 ${statusMsg.ok ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                          {statusMsg.msg}
                        </p>
                      )}
                    </div>
                    {/* Status action buttons */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {(STATUS_NEXT[p.status] || []).map((action) => (
                        <button
                          key={action.value}
                          onClick={() => changeStatus(p._id, action.value)}
                          disabled={updating === p._id}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                        >
                          {updating === p._id ? "..." : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Citizen Dashboard ─────────────────────────────────────────────────────────
function CitizenDashboard({ user }: { user: { name: string; role: string; location: string; isVerified: boolean; _id: string; email: string } }) {
  const router = useRouter();
  const [myPetitions, setMyPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    petitionApi.getMine()
      .then((res) => { if (res.success) setMyPetitions(res.petitions || []); })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Header with Background Image */}
      <div className="relative h-[240px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/75" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">
                Citizen Dashboard
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user.name}
            </h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{user.location}</span>
              <span className={`flex items-center gap-1.5 ${user.isVerified ? "text-emerald-400" : "text-amber-400"}`}>
                {user.isVerified ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                {user.isVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-12">

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push("/petitions/create")}
            className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-6 transition-colors text-left shadow-lg"
          >
            <div className="h-12 w-12 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-lg">Create Petition</p>
              <p className="text-indigo-200 text-sm">Start a new civic petition</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/petitions")}
            className="flex items-center gap-4 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl p-6 transition-colors text-left shadow-md"
          >
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-bold text-lg">My Petitions</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">View petitions you created</p>
            </div>
          </button>
        </div>

        {/* My Petitions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Petitions</h2>
            <Link href="/petitions/create" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              + New
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : myPetitions.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't created any petitions yet.</p>
              <button onClick={() => router.push("/petitions/create")} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Create your first petition →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {myPetitions.map((p) => (
                <Link key={p._id} href={`/petitions/${p._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.title}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[p.status] || STATUS_STYLES.closed}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{p.category}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.signatureCount} signatures</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 shrink-0 ml-4 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Root Dashboard (role router) ─────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return user.role === "official" || user.role === "admin"
    ? <OfficialDashboard user={user} />
    : <CitizenDashboard user={user} />;
}
