"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { pollApi, ApiError } from "@/lib/api";
import { MapPin, Plus, TrendingUp, Search, LogIn } from "lucide-react";

interface Poll {
  id: string;
  _id?: string;
  title: string;
  location: string;
  totalVotes: number;
}

export default function PollsPage() {
  const { user, loading: authLoading } = useAuth();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPolls = async () => {
    setLoading(true);
    setError("");
    setNeedsLogin(false);
    try {
      const filters = user?.location ? { location: user.location } : undefined;
      const data = await pollApi.getAll(filters);
      // Handle both { polls: [] } and direct array responses
      setPolls(Array.isArray(data) ? data : (data.polls || []));
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setNeedsLogin(true);
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load polls.";
        setError(msg + " Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchPolls();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.location]);

  const filtered = polls.filter((p) =>
    search
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const canCreate =
    user?.role?.toLowerCase() === "official" ||
    user?.role?.toLowerCase() === "admin";

  // Show spinner while auth context is initialising (prevents flash/blank)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              Community Polls
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Have your say on local community decisions
            </p>
          </div>
          {canCreate && (
            <Link
              href="/polls/create"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Poll
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search polls by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : needsLogin ? (
          <div className="text-center py-24">
            <div className="inline-flex h-16 w-16 bg-indigo-100 dark:bg-indigo-900 rounded-full items-center justify-center mb-5">
              <LogIn className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to view polls
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Please log in to browse and participate in community polls.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPolls}
              className="text-indigo-600 dark:text-indigo-400 font-medium underline"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No polls found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {search
                ? "Try adjusting your search"
                : canCreate
                ? "Be the first to create a poll!"
                : "Check back later for new polls."}
            </p>
            {canCreate && !search && (
              <Link
                href="/polls/create"
                className="inline-flex items-center gap-2 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create the first poll
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {filtered.length} poll{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((poll) => {
                const pollId = poll.id || poll._id;
                return (
                  <Link
                    key={pollId}
                    href={`/polls/${pollId}`}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3">
                        {poll.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                        {poll.location}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2.5 py-1 rounded-md font-medium">
                        {poll.totalVotes || 0} Votes
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
