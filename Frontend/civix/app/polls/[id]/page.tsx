"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { pollApi } from "@/lib/api";
import {
  Vote,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Users,
  Lock,
  Trophy,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface PollOption {
  option: string;
  count: number;
  percentage: number;
}

interface Poll {
  _id: string;
  title: string;
  description?: string;
  options: string[];
  targetLocation: string;
  status: "active" | "closed";
  createdAt: string;
  expiresAt?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface PollData {
  poll: Poll;
  totalVotes: number;
  results: PollOption[];
  userVoted: boolean;
  userSelectedOption: string | null;
}

const OPTION_COLORS = [
  { bg: "from-indigo-500 to-purple-500", light: "bg-indigo-100 dark:bg-indigo-900/30" },
  { bg: "from-emerald-500 to-teal-500", light: "bg-emerald-100 dark:bg-emerald-900/30" },
  { bg: "from-amber-500 to-orange-500", light: "bg-amber-100 dark:bg-amber-900/30" },
  { bg: "from-rose-500 to-pink-500", light: "bg-rose-100 dark:bg-rose-900/30" },
  { bg: "from-cyan-500 to-blue-500", light: "bg-cyan-100 dark:bg-cyan-900/30" },
  { bg: "from-violet-500 to-purple-500", light: "bg-violet-100 dark:bg-violet-900/30" },
  { bg: "from-lime-500 to-green-500", light: "bg-lime-100 dark:bg-lime-900/30" },
  { bg: "from-fuchsia-500 to-pink-500", light: "bg-fuchsia-100 dark:bg-fuchsia-900/30" },
];

export default function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pollData, setPollData] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState("");
  const canManagePolls = user?.role === "official" || user?.role === "admin";
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && resolvedParams.id) {
      fetchPoll();
    }
  }, [user, resolvedParams.id]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await pollApi.getById(resolvedParams.id);
      setPollData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load poll");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !pollData) return;

    try {
      setVoting(true);
      setError("");
      await pollApi.vote(resolvedParams.id, selectedOption);
      setSuccessMessage("Your vote has been recorded!");

      // Refresh poll data
      await fetchPoll();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit vote");
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!pollData) return;

    try {
      setClosing(true);
      setError("");
      await pollApi.close(resolvedParams.id);
      await fetchPoll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close poll");
    } finally {
      setClosing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWinningOption = () => {
    if (!pollData || pollData.totalVotes === 0) return null;
    return pollData.results.reduce((max, opt) =>
      opt.count > max.count ? opt : max
    );
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !pollData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error}
          </h2>
          <Link
            href="/polls"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Polls
          </Link>
        </div>
      </div>
    );
  }

  if (!pollData) return null;

  const { poll, totalVotes, results, userVoted, userSelectedOption } = pollData;
  const winningOption = getWinningOption();
  const canVote =
    user.role === "citizen" &&
    poll.status === "active" &&
    !userVoted &&
    poll.targetLocation === user.location;
  const isCreator = poll.createdBy._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="relative h-[280px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1494172892981-ce47ca685ecd?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/75" />
        <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <Link
            href="/polls"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Polls
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                poll.status === "active"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
              }`}
            >
              {poll.status === "active" ? (
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
            </span>
            {totalVotes > 0 && (
              <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">
                {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            {poll.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {poll.targetLocation}
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {poll.createdBy.name}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDate(poll.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-12">
        {/* Success / Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {poll.description && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300">{poll.description}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Voting / Results Section */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {canVote ? (
                      <>
                        <Vote className="h-5 w-5 text-indigo-500" />
                        Cast Your Vote
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5 text-indigo-500" />
                        Results
                      </>
                    )}
                  </h2>
                  <button
                    onClick={fetchPoll}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    title="Refresh results"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {results.map((result, index) => {
                  const colorSet = OPTION_COLORS[index % OPTION_COLORS.length];
                  const isSelected = selectedOption === result.option;
                  const isUserVote = userSelectedOption === result.option;
                  const isWinner =
                    winningOption?.option === result.option && totalVotes > 0;

                  return (
                    <div
                      key={result.option}
                      onClick={() => canVote && setSelectedOption(result.option)}
                      className={`relative rounded-xl border-2 transition-all ${
                        canVote
                          ? "cursor-pointer hover:border-indigo-400 hover:shadow-md"
                          : ""
                      } ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                          : isUserVote
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                          : "border-gray-100 dark:border-gray-700"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {canVote && (
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "border-indigo-500 bg-indigo-500"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                )}
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {result.option}
                            </span>
                            {isUserVote && (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full">
                                Your vote
                              </span>
                            )}
                            {isWinner && poll.status === "closed" && (
                              <Trophy className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {result.percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              ({result.count})
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${colorSet.bg} transition-all duration-500 ease-out`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vote Button */}
              {canVote && (
                <div className="p-6 pt-0">
                  <button
                    onClick={handleVote}
                    disabled={!selectedOption || voting}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {voting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting Vote...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Submit Vote
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Cannot Vote Messages */}
              {!canVote && user.role === "citizen" && !userVoted && (
                <div className="p-6 pt-0">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <p className="text-amber-700 dark:text-amber-400 text-sm">
                        {poll.status === "closed"
                          ? "This poll has been closed and is no longer accepting votes."
                          : poll.targetLocation !== user.location
                          ? `This poll is only available for users in ${poll.targetLocation}.`
                          : "You cannot vote on this poll."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {canManagePolls && (
                <div className="p-6 pt-0">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                      <p className="text-indigo-700 dark:text-indigo-400 text-sm">
                        As an official/admin, you can view results but cannot vote on polls.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Statistics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>Total Votes</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totalVotes}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Vote className="h-4 w-4" />
                    <span>Options</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {poll.options.length}
                  </span>
                </div>

                {winningOption && totalVotes > 0 && (
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">Leading Option</span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {winningOption.option}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {winningOption.percentage.toFixed(1)}% ({winningOption.count} votes)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart Visualization */}
            {totalVotes > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Distribution
                </h3>

                {/* Simple CSS Pie Chart */}
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {results.reduce(
                      (acc, result, index) => {
                        const colorSet = OPTION_COLORS[index % OPTION_COLORS.length];
                        const startAngle = acc.offset;
                        const angle = (result.percentage / 100) * 360;
                        const endAngle = startAngle + angle;

                        const largeArc = angle > 180 ? 1 : 0;
                        const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                        const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                        if (result.percentage > 0) {
                          acc.paths.push(
                            <path
                              key={result.option}
                              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                              className={`fill-current`}
                              style={{
                                color:
                                  index === 0
                                    ? "#6366f1"
                                    : index === 1
                                    ? "#10b981"
                                    : index === 2
                                    ? "#f59e0b"
                                    : index === 3
                                    ? "#f43f5e"
                                    : "#06b6d4",
                              }}
                            />
                          );
                        }

                        return { paths: acc.paths, offset: endAngle };
                      },
                      { paths: [] as React.ReactElement[], offset: 0 }
                    ).paths}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalVotes}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={result.option} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            index === 0
                              ? "#6366f1"
                              : index === 1
                              ? "#10b981"
                              : index === 2
                              ? "#f59e0b"
                              : index === 3
                              ? "#f43f5e"
                              : "#06b6d4",
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                        {result.option}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Actions */}
            {isCreator && poll.status === "active" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Poll Management
                </h3>
                <button
                  onClick={handleClosePoll}
                  disabled={closing}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {closing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Close Poll
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
