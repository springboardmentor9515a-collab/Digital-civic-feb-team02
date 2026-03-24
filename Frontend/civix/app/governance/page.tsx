"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { governanceApi, ApiError } from "@/lib/api";
import { FileText, MapPin, Clock3 } from "lucide-react";

type PetitionStatus = "active" | "under_review" | "closed";

interface Petition {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: PetitionStatus;
  signatureCount: number;
  createdAt: string;
}

interface GovernanceStats {
  total: number;
  byStatus: {
    active: number;
    under_review: number;
    closed: number;
  };
}

const STATUS_STYLES: Record<PetitionStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export default function GovernancePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | PetitionStatus>("");

  const isOfficial = user?.role === "official";

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isOfficial) {
      router.push("/dashboard");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [petitionsRes, statsRes] = await Promise.all([
          governanceApi.getPetitions({ status: statusFilter || undefined, limit: 50 }),
          governanceApi.getStats(),
        ]);

        if (petitionsRes.success) {
          setPetitions(petitionsRes.data || []);
        }

        if (statsRes.success) {
          setStats(statsRes.data || null);
        }
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to load governance data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, isOfficial, router, statusFilter, user]);

  const summary = useMemo(() => {
    return {
      total: stats?.total || 0,
      active: stats?.byStatus?.active || 0,
      closed: stats?.byStatus?.closed || 0,
    };
  }, [stats]);

  if (authLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  if (!isOfficial) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Governance Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Location: {user.location}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-300">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | PetitionStatus)}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="under_review">Under Review</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total petitions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{summary.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active petitions</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{summary.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Closed petitions</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-2">{summary.closed}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Petitions in your location</h2>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="py-10 px-6 text-red-600 dark:text-red-400 text-sm">{error}</div>
          ) : petitions.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No petitions found for this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {petitions.map((petition) => (
                <Link
                  key={petition._id}
                  href={`/petitions/${petition._id}`}
                  className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{petition.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{petition.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {petition.signatureCount} signatures • {new Date(petition.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[petition.status]}`}
                    >
                      {petition.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          Click any petition to open the response-enabled detail page.
        </div>
      </div>
    </div>
  );
}
