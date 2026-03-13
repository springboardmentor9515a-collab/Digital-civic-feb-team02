"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, MapPin, List, Send, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { tokenManager } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  // Redirect if user is not authorized
  useEffect(() => {
    if (!authLoading && user) {
      const role = user.role?.toLowerCase();
      if (role !== "official" && role !== "admin") {
        router.push("/polls");
      }
    }
  }, [user, authLoading, router]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Please provide a poll title");
      return false;
    }
    const validOptions = options.filter(opt => opt.trim() !== "");
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
      const token = tokenManager.getToken();
      const validOptions = options.map(opt => opt.trim()).filter(opt => opt !== "");
      
      const res = await fetch(`${API_BASE_URL}/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          title: title.trim(),
          options: validOptions,
          location: location.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create poll");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/polls");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const role = user?.role?.toLowerCase();
  if (!user || (role !== "official" && role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/polls"
          className="mb-6 inline-block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to Polls
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create a Poll</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create a poll to gather opinions from users in your community
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-300">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              <span>Poll created successfully! Redirecting...</span>
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4" />
                Target Location *
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                placeholder="City, State, or Region"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || success}
                className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all ${
                  loading || success
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
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
  );
}
