"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, LogOut, Moon, Sun, TrendingUp } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition"
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
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
                  {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  href="/petitions"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md transition"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Petitions</span>
                </Link>
                <Link
                  href="/polls"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md transition"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Polls</span>
                </Link>
                {user.role === "citizen" && (
                  <Link
                    href="/petitions/create"
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-4 py-2 rounded-md transition"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Create</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-md transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-4 py-2 rounded-md transition"
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
