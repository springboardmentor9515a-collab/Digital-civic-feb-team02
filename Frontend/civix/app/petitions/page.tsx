"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { petitionApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  FileText, MapPin, Tag, Clock, Users, ChevronRight,
  Filter, Search, Plus, TrendingUp
} from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "environment", label: "Environment" },
  { value: "transportation", label: "Transportation" },
  { value: "public-safety", label: "Public Safety" },
  { value: "housing", label: "Housing" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under Review" },
  { value: "closed", label: "Closed" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

interface Petition {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  signatureCount: number;
  creator: { name: string; email: string };
  createdAt: string;
}

export default function PetitionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canViewAllPetitions = user?.role === "official" || user?.role === "admin";

  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const fetchPetitions = async () => {
    setLoading(true);
    setError("");
    try {
      const filters: Record<string, string> = {};
      if (category) filters.category = category;
      if (status) filters.status = status;

      const res = await petitionApi.getAll(filters);
      if (res.success) {
        setPetitions(res.petitions || []);
      }
    } catch {
      setError("Failed to load petitions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, status]);

  const filtered = petitions.filter((p) =>
    search
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              {canViewAllPetitions ? "All Petitions" : "My Petitions"}
            </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
               {canViewAllPetitions
                 ? "View and manage all users' petitions"
                 : "View and manage petitions you created"}
              </p>
          </div>
          {user?.role === "citizen" && (
            <Link
              href="/petitions/create"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Petition
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input
               type="text"
               placeholder={canViewAllPetitions ? "Search petitions..." : "Search my petitions..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPetitions}
              className="text-indigo-600 dark:text-indigo-400 font-medium underline"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No petitions found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
               {search || category || status
                 ? "Try adjusting your filters"
                 : canViewAllPetitions
                 ? "No petitions available yet."
                 : "Create your first petition!"}
              </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {filtered.length} petition{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4">
              {filtered.map((petition) => (
                <Link
                  key={petition._id}
                  href={`/petitions/${petition._id}`}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title + status */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {petition.title}
                        </h2>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[petition.status] || STATUS_STYLES.closed}`}>
                          {petition.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {petition.description}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          <span className="capitalize">{petition.category}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {petition.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {petition.signatureCount} signature{petition.signatureCount !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(petition.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 shrink-0 mt-1 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
