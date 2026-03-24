"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, LogOut, Moon, Sun, Vote, ShieldCheck, BarChart3 } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Check if we're on the homepage (which has dark background)
  const isHomePage = pathname === "/";

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isHomePage
          ? "bg-gray-900/80 backdrop-blur-md border-b border-gray-800"
          : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isHomePage
                  ? "text-gray-300 hover:text-white hover:bg-white/10"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {user ? (
              <>
                <span
                  className={`text-sm hidden md:block ${
                    isHomePage ? "text-gray-300" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isHomePage
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  href="/petitions"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isHomePage
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Petitions</span>
                </Link>
                <Link
                  href="/polls"
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isHomePage
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Vote className="h-4 w-4" />
                  <span className="hidden sm:inline">Polls</span>
                </Link>
                {user.role === "official" && (
                  <>
                    <Link
                      href="/governance"
                      className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                        isHomePage
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Governance</span>
                    </Link>
                    <Link
                      href="/reports"
                      className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                        isHomePage
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Reports</span>
                    </Link>
                  </>
                )}
                {user.role === "citizen" && (
                  <Link
                    href="/petitions/create"
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Create</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isHomePage
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                    isHomePage
                      ? "text-gray-300 hover:text-white hover:bg-white/10"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
