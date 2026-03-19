"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, MapPin, List, Send, Plus, Trash2, Lock, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { pollApi } from "@/lib/api";
import Navbar from "@/components/Navbar";

const TAMIL_NADU_LOCATIONS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kancheepuram",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

export default function CreatePollPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-fill location from logged-in user
  useEffect(() => {
    if (user?.location) {
      setLocation(user.location);
    }
  }, [user]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Please provide a poll title");
      return false;
    }
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      setError("Please provide at least 2 options");
      return false;
    }
    if (!location.trim()) {
      setError("Please provide a target location");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!validateForm()) return;
    setLoading(true);
    try {
      const validOptions = options.map((opt) => opt.trim()).filter(Boolean);
      await pollApi.create({
        title: title.trim(),
        options: validOptions,
        targetLocation: location.trim(),
      });
      setSuccess(true);
      setTimeout(() => router.push("/polls"), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Show spinner while auth is initialising
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

  // Show "access denied" card for non-official logged-in users (instead of blank page)
  const role = user?.role?.toLowerCase();
  if (user && role !== "official" && role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 max-w-md w-full text-center shadow-sm">
            <div className="inline-flex h-14 w-14 bg-indigo-100 dark:bg-indigo-900 rounded-full items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Restricted
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Only <span className="font-semibold text-indigo-600 dark:text-indigo-400">Officials</span> and{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Admins</span> can create polls.
              You are currently logged in as a <span className="font-medium capitalize">{user.role}</span>.
            </p>
            <Link
              href="/polls"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Browse Polls
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated: redirect handled by useEffect, render nothing while redirecting
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/polls"
            className="mb-6 inline-block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Polls
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create a Poll
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Create a poll to gather opinions from users in your community
            </p>
          </div>

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-300">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                <span>Poll created successfully! Redirecting to polls...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  Poll Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  placeholder="Ask a clear question"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <List className="h-4 w-4" />
                  Options (Minimum 2) *
                </label>

                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      required={index < 2}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        aria-label="Remove option"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4" />
                  Target Location *
                </label>
                <div className="relative">
                  <select
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a district / city
                    </option>
                    {TAMIL_NADU_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc.toUpperCase()}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Select the district this poll targets
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all ${
                    loading || success
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Poll...
                    </>
                  ) : success ? (
                    <>
                      <Send className="h-4 w-4" />
                      Created!
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Create Poll
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading || success}
                  className="h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
