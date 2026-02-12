"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Citizen");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !location) {
      setError("Please fill all required fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    alert(`Registered as ${role} from ${location}`);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">

      {/* Glow Background */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600 opacity-30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-600 opacity-30 blur-3xl"></div>

      <form
        onSubmit={handleRegister}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl"
      >
        <h1 className="text-center text-3xl font-bold text-white">
          Civix Register
        </h1>
        <p className="mb-6 text-center text-sm text-white/70">
          Create your civic account
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          className="mb-4 w-full rounded-xl border border-white/30 bg-transparent px-4 py-3 text-white outline-none focus:border-indigo-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-xl border border-white/30 bg-transparent px-4 py-3 text-white outline-none focus:border-indigo-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          className="mb-4 w-full rounded-xl border border-white/30 bg-transparent px-4 py-3 text-white outline-none focus:border-indigo-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ROLE SELECTOR */}
        <select
          className="mb-4 w-full rounded-xl border border-white/30 bg-slate-900 px-4 py-3 text-white outline-none"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option>Citizen</option>
          <option>Official</option>
        </select>

        {/* LOCATION SELECTOR */}
        <select
          className="mb-4 w-full rounded-xl border border-white/30 bg-slate-900 px-4 py-3 text-white outline-none"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">Select City / Town</option>
          <option>Chennai</option>
          <option>Coimbatore</option>
          <option>Madurai</option>
          <option>Salem</option>
        </select>

        {/* FILE UPLOAD (Future ID Verification) */}
        <div className="mb-6">
          <input
            type="file"
            className="w-full text-xs text-white"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="mt-1 text-xs text-white/50">
            Optional: ID verification (future feature)
          </p>
        </div>

        {/* REGISTER BUTTON */}
        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-600 active:scale-[0.98]"
        >
          Register
        </button>
      </form>
    </div>
  );
}
