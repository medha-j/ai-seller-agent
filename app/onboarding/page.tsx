"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, category, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {session?.user?.name}! 👋
        </h1>
        <p className="text-gray-400 mb-8">
          Let's set up your store to get started
        </p>

        <form onSubmit={handleCreateStore}>
          <div className="mb-6">
            <label className="block text-white mb-2">Store Name</label>
            <input
              type="text"
              placeholder="e.g., TechHub Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded"
            >
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Food & Beverages</option>
              <option>Home & Garden</option>
              <option>Books</option>
              <option>Sports</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2">Description (Optional)</label>
            <textarea
              placeholder="Tell us about your store..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded h-24"
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 text-white rounded font-semibold"
          >
            {loading ? "Creating Store..." : "Create Store & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}