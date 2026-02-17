"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* LEFT SIDE - FORM */}
      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-20">

        {/* Back Link */}
        <Link href="/" className="mb-8 text-sm font-medium text-gray-600 hover:text-gray-900">
          ← Back to Home
        </Link>

        {/* Logo */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-900 text-white font-bold text-xl">
            C
          </div>
          <span className="text-xl font-bold text-gray-900">Civix</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-500">Sign in to continue your civic engagement journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Dynamic Form Structure */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">
            Sign In
          </h2>
          <p className="mb-6 text-xs text-gray-500">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-gray-600">
                Remember me for 30 days
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-900 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-800 disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mb-8 text-center text-sm text-gray-500">
          Don't have an account? <Link href="/register" className="font-semibold text-indigo-700 hover:underline">Create Account</Link>
        </div>

        {/* Footer Security */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-gray-500">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span className="text-[10px] leading-tight">Your data is encrypted and protected by industry-leading security standards</span>
        </div>

      </div>

      {/* RIGHT SIDE - HERO */}
      <div className="hidden w-1/2 flex-col justify-center bg-indigo-600 px-12 text-white lg:flex relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center bg-no-blend-multiply bg-indigo-700/90 bg-blend-multiply">

        <div className="relative z-10 max-w-lg">
          <h2 className="mb-6 text-4xl font-bold leading-tight">
            Your Voice Matters
          </h2>
          <p className="mb-12 text-lg text-indigo-100 opacity-90">
            Join millions of citizens creating meaningful change through digital civic engagement.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10">
            <div>
              <div className="text-3xl font-bold">2.4M+</div>
              <div className="text-sm text-indigo-200">Active Citizens</div>
            </div>
            <div>
              <div className="text-3xl font-bold">12K+</div>
              <div className="text-sm text-indigo-200">Petitions</div>
            </div>
            <div>
              <div className="text-3xl font-bold">8.9K+</div>
              <div className="text-sm text-indigo-200">Responses</div>
            </div>
            <div>
              <div className="text-3xl font-bold">67%</div>
              <div className="text-sm text-indigo-200">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
