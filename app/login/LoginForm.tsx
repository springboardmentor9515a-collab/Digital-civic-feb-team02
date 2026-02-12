"use client";

import { useState } from "react";

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);

  // Shared States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Register Only States
  const [name, setName] = useState("");
  const [role, setRole] = useState("Citizen");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    const userRole = email.includes("official") ? "Official" : "Citizen";
    alert(`Logged in as ${userRole}`);
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

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="mb-6 text-center text-sm text-white/70">
          {isLogin ? "Login to access your dashboard" : "Join your community today"}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>

          {/* Register Fields */}
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <input
                type="text"
                placeholder="Full Name"
                className="mb-4 w-full rounded-xl border border-white/30 bg-transparent px-4 py-3 text-white outline-none focus:border-indigo-400 placeholder:text-white/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* Shared Fields */}
          <input
            type="email"
            placeholder="Email"
            className="mb-4 w-full rounded-xl border border-white/30 bg-transparent px-4 py-3 text-white outline-none focus:border-indigo-400 placeholder:text-white/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="mb-4 w-full rounded-xl border border-white/30 bg-transparent px-4 py-3 text-white outline-none focus:border-indigo-400 placeholder:text-white/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* More Register Fields */}
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <select
                className="mb-4 w-full rounded-xl border border-white/30 bg-slate-900/50 px-4 py-3 text-white outline-none focus:border-indigo-400"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Citizen">Citizen</option>
                <option value="Official">Official</option>
              </select>

              <select
                className="mb-4 w-full rounded-xl border border-white/30 bg-slate-900/50 px-4 py-3 text-white outline-none focus:border-indigo-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Select City / Town</option>
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Salem">Salem</option>
              </select>

              <div className="mb-6">
                <input
                  type="file"
                  className="w-full text-xs text-white file:mr-4 file:rounded-full file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-600"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs text-white/50">
                  Optional: ID verification
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-600 active:scale-[0.98] shadow-lg shadow-indigo-500/30"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
