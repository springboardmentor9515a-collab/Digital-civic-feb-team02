"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, ShieldCheck, Activity, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState("citizen");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms of Service");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const fullName = `${firstName} ${lastName}`;
      await register({
        name: fullName,
        email,
        password,
        role,
        location,
      });
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
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* LEFT SIDE - FORM */}
      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-20">

        {/* Back Link */}
        <Link href="/" className="mb-8 text-sm font-medium text-gray-600 hover:text-gray-900">
          ← Back to Home
        </Link>

        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-900 text-white font-bold text-xl">
            C
          </div>
          <span className="text-xl font-bold text-gray-900">Civix</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-500">Join the movement for digital civic engagement</p>
        </div>

        {/* Role Toggle */}
        <div className="mb-8 flex rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setRole("citizen")}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${role === "citizen" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole("official")}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${role === "official" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Government Official
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Conditional Header based on Role */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            {role === "citizen" ? "Register as Citizen" : "Register as Official"}
          </h2>
          <p className="text-sm text-gray-500">
            {role === "citizen"
              ? "Engage with your community and track progress"
              : "Manage and respond to civic issues"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">First Name</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Last Name</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-[10px] text-gray-500">Must be at least 8 characters with letters and numbers</p>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Location</label>
            <div className="relative">
              <select
                required
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="" disabled>Select your city</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
                <option value="Houston">Houston</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* ID Verification */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">ID Verification (Optional)</label>
            <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-6 hover:bg-gray-50">
              <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Upload className="mb-2 h-5 w-5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {file ? file.name : "Upload government ID for verification"}
              </span>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-xs text-gray-600">
              I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-900 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-800 disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Sign In Link */}
          <div className="text-center text-xs text-gray-500">
            Already have an account? <Link href="/login" className="font-medium text-indigo-700 hover:underline">Sign In</Link>
          </div>
        </form>

        {/* Footer Security */}
        <div className="mt-8 flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-gray-500">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px]">Your data is encrypted and protected by industry-leading security standards</span>
        </div>

      </div>

      {/* RIGHT SIDE - HERO */}
      <div className="hidden w-1/2 flex-col justify-center bg-emerald-500 px-12 text-white lg:flex relative overflow-hidden">
        {/* Abstract Background Elements (Optional, simulated with CSS) */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/10 blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-lg">
          <h2 className="mb-6 text-4xl font-bold leading-tight">
            Be Part of the <br /> Change
          </h2>
          <p className="mb-10 text-lg text-emerald-100 opacity-90">
            Every signature matters. Every voice counts. Join a community committed to transparency and civic responsibility.
          </p>

          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Verified Community</h3>
                <p className="text-sm text-emerald-100 opacity-80">Join verified citizens making real impact</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Track Progress</h3>
                <p className="text-sm text-emerald-100 opacity-80">See real-time updates on your petitions</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Direct Impact</h3>
                <p className="text-sm text-emerald-100 opacity-80">Connect directly with government officials</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
