"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import Link from "next/link";
import {
  Users, FileText, MessageSquare, TrendingUp, ArrowRight,
  CheckCircle, Shield, Vote, ChevronDown, Sparkles,
  Building2, Globe, Award, Heart
} from "lucide-react";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
              transform: `scale(${1 + scrollY * 0.0005})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900" />
        </div>

        {/* Floating Elements Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-gray-300">Digital Civic Engagement Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Make Your Voice
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Heard
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Connect with your community, participate in local governance, and create meaningful change through civic engagement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {!user ? (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "2,400+", label: "Active Citizens", icon: Users, color: "from-indigo-500 to-blue-500" },
              { value: "1,200+", label: "Petitions Created", icon: FileText, color: "from-emerald-500 to-teal-500" },
              { value: "890+", label: "Official Responses", icon: MessageSquare, color: "from-purple-500 to-pink-500" },
              { value: "67%", label: "Success Rate", icon: TrendingUp, color: "from-amber-500 to-orange-500" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-center hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Images */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm font-medium text-indigo-400 mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful tools to engage with your community and make a real impact
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 mb-6 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Create & Sign Petitions</h3>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                Start petitions for causes you believe in or support existing ones. Track signatures in real-time and see your community come together for change.
              </p>
              <ul className="space-y-3">
                {["Easy petition creation", "Real-time signature tracking", "Share with your network"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">1,234</p>
                    <p className="text-sm text-gray-400">Signatures Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80"
                  alt="Voting"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Vote className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">89%</p>
                    <p className="text-sm text-gray-400">Participation Rate</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 mb-6 shadow-lg">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Vote on Community Polls</h3>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                Participate in polls that shape your community. Your vote matters in making collective decisions that affect everyone.
              </p>
              <ul className="space-y-3">
                {["Location-based polls", "Real-time results", "Anonymous voting"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 mb-6 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Get Official Responses</h3>
              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                Connect directly with local officials. Get transparent responses and track the progress of your petitions through the governance process.
              </p>
              <ul className="space-y-3">
                {["Direct official feedback", "Status tracking", "Transparent process"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80"
                  alt="Government building"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24h</p>
                    <p className="text-sm text-gray-400">Avg Response Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm font-medium text-purple-400 mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to start making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create Account", desc: "Sign up as a citizen or official to join your local community", icon: Users, color: "from-indigo-500 to-purple-500" },
              { step: "2", title: "Take Action", desc: "Create petitions, vote on polls, or support causes that matter", icon: Heart, color: "from-purple-500 to-pink-500" },
              { step: "3", title: "Make Impact", desc: "Track progress, get responses, and see real change happen", icon: Award, color: "from-amber-500 to-orange-500" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-750 hover:border-gray-600 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-lg font-bold text-white">{item.step}</span>
                </div>
                <div className="pt-6">
                  <div className="inline-flex p-3 rounded-xl bg-gray-700/50 mb-4">
                    <item.icon className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-purple-900/90 to-indigo-900/95" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of citizens who are already shaping the future of their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/petitions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all duration-300"
            >
              Browse Petitions
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: "Secure & Private" },
              { icon: Globe, label: "Location-Based" },
              { icon: Building2, label: "Government Verified" },
              { icon: Award, label: "Trusted Platform" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <item.icon className="h-8 w-8 text-gray-500" />
                <span className="text-gray-400 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Logo size="sm" showText={true} className="[&>span]:!text-white" />
            </div>
            <p className="text-gray-500 mb-4">
              Digital civic engagement platform for modern communities
            </p>
            <p className="text-sm text-gray-600">
              © 2026 Civix. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}
