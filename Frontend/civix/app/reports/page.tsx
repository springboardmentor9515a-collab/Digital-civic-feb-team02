"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { reportApi, ApiError } from "@/lib/api";
import { AlertCircle, BarChart3, CheckCircle, Download, MapPin } from "lucide-react";

interface MonthlyPetitionTrend {
  month: string;
  petitions: number;
  signatures: number;
}

interface MonthlyVoteTrend {
  month: string;
  votes: number;
}

interface ReportData {
  location: string;
  petitions: {
    total: number;
    byStatus: Record<string, { count: number; signatures: number }>;
    monthlyTrends: MonthlyPetitionTrend[];
  };
  polls: {
    totalVotes: number;
    monthlyVoteTrends: MonthlyVoteTrend[];
  };
}

const monthBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
  };
};

export default function ReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const defaultDates = useMemo(() => monthBounds(), []);

  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const isOfficial = user?.role === "official";

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await reportApi.getReports({
        startDate,
        endDate,
        location: location || undefined,
      });

      if (res.success) {
        setReport(res.data);
        setLocation(res.data?.location || user?.location || "");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load reports.");
      }
    } finally {
      setLoading(false);
    }
  };

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

    setLocation(user.location);
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isOfficial, user]);

  const metrics = useMemo(() => {
    if (!report) {
      return {
        totalCreated: 0,
        resolved: 0,
        pending: 0,
        totalSignatures: 0,
        totalVotes: 0,
      };
    }

    const closedCount = report.petitions.byStatus?.closed?.count || 0;
    const activeCount = report.petitions.byStatus?.active?.count || 0;
    const underReviewCount = report.petitions.byStatus?.under_review?.count || 0;
    const totalSignatures = Object.values(report.petitions.byStatus || {}).reduce(
      (sum, item) => sum + (item.signatures || 0),
      0
    );

    return {
      totalCreated: report.petitions.total || 0,
      resolved: closedCount,
      pending: activeCount + underReviewCount,
      totalSignatures,
      totalVotes: report.polls.totalVotes || 0,
    };
  }, [report]);

  const handleExportCsv = async () => {
    setExporting(true);
    setExportMsg(null);

    try {
      const blob = await reportApi.exportCsv({
        type: "petitions",
        startDate,
        endDate,
        location: location || undefined,
      });

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `reports_${location || "location"}_${startDate}_${endDate}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setExportMsg({ ok: true, text: "CSV export downloaded." });
    } catch (err) {
      const text = err instanceof ApiError ? err.message : "Failed to export CSV.";
      setExportMsg({ ok: false, text });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    setExportMsg(null);

    try {
      const blob = await reportApi.exportPdf({
        type: "petitions",
        startDate,
        endDate,
        location: location || undefined,
      });

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `reports_${location || "location"}_${startDate}_${endDate}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setExportMsg({ ok: true, text: "PDF export downloaded." });
    } catch (err) {
      const text = err instanceof ApiError ? err.message : "Failed to export PDF.";
      setExportMsg({ ok: false, text });
    } finally {
      setExporting(false);
    }
  };

  const maxPetitions = Math.max(1, ...((report?.petitions.monthlyTrends || []).map((i) => i.petitions)));
  const maxVotes = Math.max(1, ...((report?.polls.monthlyVoteTrends || []).map((i) => i.votes)));

  if (authLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Location: {location || user?.location}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Download CSV"}
            </button>
            <button
              onClick={handleExportPdf}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {exporting ? "Exporting..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value={user?.location}>{user?.location}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReports}
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Loading..." : "Apply filters"}
            </button>
          </div>
        </div>

        {exportMsg && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm border ${
              exportMsg.ok
                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
            }`}
          >
            {exportMsg.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {exportMsg.text}
          </div>
        )}

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <MetricCard title="Total petitions created" value={metrics.totalCreated} />
              <MetricCard title="Petitions resolved" value={metrics.resolved} />
              <MetricCard title="Pending petitions" value={metrics.pending} />
              <MetricCard title="Total signatures" value={metrics.totalSignatures} />
              <MetricCard title="Total votes" value={metrics.totalVotes} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Petition trends (bar)
                </h2>
                <div className="space-y-3">
                  {(report?.petitions.monthlyTrends || []).slice(0, 6).map((item) => (
                    <div key={item.month}>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                        <span>{item.month}</span>
                        <span>{item.petitions}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${Math.max(8, (item.petitions / maxPetitions) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {(report?.petitions.monthlyTrends || []).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data for selected filters.</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Vote trends (line)
                </h2>
                <div className="h-44 flex items-end gap-2">
                  {(report?.polls.monthlyVoteTrends || []).slice(0, 8).map((item) => (
                    <div key={item.month} className="flex-1 flex flex-col items-center justify-end gap-2">
                      <div
                        className="w-full max-w-10 bg-indigo-500/85 rounded-t"
                        style={{ height: `${Math.max(8, (item.votes / maxVotes) * 140)}px` }}
                        title={`${item.month}: ${item.votes}`}
                      />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.month.slice(5)}</span>
                    </div>
                  ))}
                </div>
                {(report?.polls.monthlyVoteTrends || []).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">No vote trend data for selected filters.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
    </div>
  );
}
