"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Reasoning {
  reasoning: string;
  expectedImpact: string;
}

interface Recommendation {
  id: string;
  recommendationType: string;
  title: string;
  description: string;
  reasoning: string;
  status: string;
  createdAt: string;
  executedAt: string | null;
  projectedRevenueLift: number | null;
  actualRevenueLift: number | null;
}

export default function RecommendationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRecommendations();
    }
  }, [status]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch("/api/recommendations");
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        fetchRecommendations();
      } else {
        alert(data.error || "Failed to generate recommendations");
      }
    } catch (err) {
      console.error("Error generating recommendations:", err);
      alert("Error generating recommendations");
    } finally {
      setGenerating(false);
    }
  };

  const executeRecommendation = async (
    recommendationId: string,
    newStatus: "executed" | "rejected"
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchRecommendations();
      }
    } catch (err) {
      console.error("Error updating recommendation:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseReasoning = (reasoningStr: string): Reasoning | null => {
    try {
      return JSON.parse(reasoningStr);
    } catch {
      return null;
    }
  };

  if (status === "loading" || loadingRecs)
    return <p className="p-8">Loading...</p>;

  const pendingRecs = recommendations.filter((r) => r.status === "pending");
  const executedRecs = recommendations.filter((r) => r.status === "executed");
  const rejectedRecs = recommendations.filter((r) => r.status === "rejected");

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🤖 AI Recommendations</h1>
        <button
          onClick={generateRecommendations}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-white font-semibold disabled:opacity-50"
        >
          {generating ? "Generating..." : "✨ Generate New"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-500 p-4 rounded text-white">
          <p className="text-sm">Pending</p>
          <p className="text-2xl font-bold">{pendingRecs.length}</p>
        </div>
        <div className="bg-green-500 p-4 rounded text-white">
          <p className="text-sm">Executed</p>
          <p className="text-2xl font-bold">{executedRecs.length}</p>
        </div>
        <div className="bg-red-500 p-4 rounded text-white">
          <p className="text-sm">Rejected</p>
          <p className="text-2xl font-bold">{rejectedRecs.length}</p>
        </div>
      </div>

      {pendingRecs.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Pending Recommendations</h2>
          <div className="space-y-4 mb-8">
            {pendingRecs.map((rec) => {
              const reasoning = parseReasoning(rec.reasoning);
              return (
                <div
                  key={rec.id}
                  className="bg-gray-800 border-l-4 border-yellow-500 p-6 rounded"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-yellow-600 px-3 py-1 rounded text-sm text-white">
                        {rec.recommendationType.toUpperCase()}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">
                        {rec.title}
                      </h3>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-3">{rec.description}</p>

                  {reasoning && (
                    <div className="bg-gray-700 p-4 rounded mb-4">
                      <p className="text-sm text-gray-300 mb-2">
                        <strong>Why:</strong> {reasoning.reasoning}
                      </p>
                      <p className="text-sm text-blue-400">
                        <strong>Expected Impact:</strong>{" "}
                        {reasoning.expectedImpact}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => executeRecommendation(rec.id, "executed")}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 p-2 rounded text-white font-semibold disabled:opacity-50"
                    >
                      ✅ Execute
                    </button>
                    <button
                      onClick={() => executeRecommendation(rec.id, "rejected")}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 p-2 rounded text-white font-semibold disabled:opacity-50"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {executedRecs.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-green-400">
            Executed Recommendations
          </h2>
          <div className="space-y-4 mb-8">
            {executedRecs.map((rec) => (
              <div
                key={rec.id}
                className="bg-gray-800 border-l-4 border-green-500 p-6 rounded opacity-75"
              >
                <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                <p className="text-gray-400 text-sm">
                  Executed on{" "}
                  {rec.executedAt
                    ? new Date(rec.executedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">
            No recommendations yet. Generate your first one!
          </p>
          <button
            onClick={generateRecommendations}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded text-white font-semibold disabled:opacity-50"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </div>
  );
}