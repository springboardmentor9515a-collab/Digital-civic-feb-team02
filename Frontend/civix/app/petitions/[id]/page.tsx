"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { petitionApi, governanceApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  FileText, MapPin, Tag, Clock, Users, ArrowLeft,
  CheckCircle, AlertCircle, Shield, PenLine, MessageSquare
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

interface Petition {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  signatureCount: number;
  creator: { _id: string; name: string; email: string; location: string };
  officialResponse?: string;
  respondedAt?: string;
  respondedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export default function PetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signError, setSignError] = useState("");
  const [signSuccess, setSignSuccess] = useState("");

  const [responseText, setResponseText] = useState("");
  const [responseStatus, setResponseStatus] = useState<"under_review" | "closed">("under_review");
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState("");
  const [responseSuccess, setResponseSuccess] = useState("");

  const fetchPetition = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await petitionApi.getById(id);
      if (res.success) {
        setPetition(res.petition);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Petition not found.");
      } else {
        setError("Failed to load petition. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPetition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSign = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setSigning(true);
    setSignError("");
    setSignSuccess("");
    try {
      const res = await petitionApi.sign(id);
      if (res.success) {
        setSigned(true);
        setSignSuccess("You have successfully signed this petition!");
        // Update the count locally
        if (petition) {
          setPetition({ ...petition, signatureCount: petition.signatureCount + 1 });
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message.toLowerCase().includes("already")) {
          setSigned(true);
          setSignError("You have already signed this petition.");
        } else {
          setSignError(err.message);
        }
      } else {
        setSignError("Failed to sign. Please try again.");
      }
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {error || "Petition not found"}
          </p>
          <Link
            href="/petitions"
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to petitions
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?._id === petition.creator?._id;
  const isOfficial = user?.role === "official";
  const canSign = user?.role === "citizen" && petition.status === "active" && !isCreator;
  const hasOfficialResponse = Boolean(petition.officialResponse && petition.officialResponse.trim());

  const handleSubmitResponse = async () => {
    if (!isOfficial) return;

    setSubmittingResponse(true);
    setResponseError("");
    setResponseSuccess("");

    try {
      const res = await governanceApi.respondToPetition(id, {
        response: responseText,
        status: responseStatus,
      });

      if (res.success) {
        setPetition(res.data);
        setResponseText("");
        setResponseSuccess("Response submitted successfully.");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setResponseError(err.message);
      } else {
        setResponseError("Failed to submit response. Please try again.");
      }
    } finally {
      setSubmittingResponse(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <Link
          href="/petitions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to petitions
        </Link>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-6">
          {/* Status + Category */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[petition.status] || STATUS_STYLES.closed}`}>
              {petition.status.replace("_", " ")}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100 capitalize flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {petition.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {petition.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {petition.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <strong className="text-gray-900 dark:text-white">{petition.signatureCount}</strong>
              &nbsp;signature{petition.signatureCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {new Date(petition.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </span>
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {petition.description}
            </p>
          </div>
        </div>

        {/* Creator Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Created by
          </h3>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{petition.creator?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{petition.creator?.location}</p>
            </div>
          </div>
        </div>

        {/* Official Response (Public Transparency) */}
        {hasOfficialResponse && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Official response
            </h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mb-4">
              {petition.officialResponse}
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-3">
              <span className="capitalize">
                Updated status: <strong>{petition.status.replace("_", " ")}</strong>
              </span>
              {petition.respondedAt && (
                <span>
                  Responded: {new Date(petition.respondedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Official Response Form */}
        {isOfficial && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Respond to petition
            </h3>

            {responseSuccess && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg px-4 py-3 mb-4 text-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {responseSuccess}
              </div>
            )}

            {responseError && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {responseError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Official comment
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  placeholder="Write an official response..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Update status
                </label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value as "under_review" | "closed")}
                  className="w-full sm:w-60 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="under_review">Under Review</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <button
                onClick={handleSubmitResponse}
                disabled={submittingResponse || responseText.trim().length === 0}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {submittingResponse ? "Submitting..." : "Submit response"}
              </button>
            </div>
          </div>
        )}

        {/* Sign Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Sign this petition
          </h3>

          {/* Success */}
          {signSuccess && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg px-4 py-3 mb-4 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {signSuccess}
            </div>
          )}

          {/* Error */}
          {signError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {signError}
            </div>
          )}

          {petition.status !== "active" ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This petition is <strong className="capitalize">{petition.status.replace("_", " ")}</strong> and no longer accepting signatures.
            </p>
          ) : isCreator ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You created this petition.
            </p>
          ) : !user ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Please log in to sign this petition.
              </p>
              <Link
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Log in
              </Link>
            </div>
          ) : user.role !== "citizen" ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only citizens can sign petitions.
            </p>
          ) : canSign && !signed ? (
            <button
              onClick={handleSign}
              disabled={signing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <PenLine className="h-4 w-4" />
              {signing ? "Signing..." : "Sign this petition"}
            </button>
          ) : signed ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="h-5 w-5" />
              You signed this petition
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
