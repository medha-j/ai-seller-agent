"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: { email: string };
}

export default function AuditPage() {
  const { status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAuditLogs();
    }
  }, [status]);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("product")) return "bg-blue-600";
    if (action.includes("sales")) return "bg-green-600";
    if (action.includes("recommendation")) return "bg-purple-600";
    if (action.includes("agent")) return "bg-yellow-600";
    return "bg-gray-600";
  };

  const getActionLabel = (action: string) => {
    return action
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  if (status === "loading" || loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">📋 Audit Trail</h1>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Details</th>
              <th className="p-4 text-left">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-700">
                <td className="p-4">
                  <span className={`${getActionColor(log.action)} px-3 py-1 rounded text-white text-sm`}>
                    {getActionLabel(log.action)}
                  </span>
                </td>
                <td className="p-4 text-gray-300 text-sm">
                  {(() => {
                    try {
                      const details = JSON.parse(log.details);
                      return JSON.stringify(details).substring(0, 100) + "...";
                    } catch {
                      return log.details.substring(0, 100) + "...";
                    }
                  })()}
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <p className="text-gray-400 text-center py-12">
          No audit logs yet. Start using the app to see activity!
        </p>
      )}
    </div>
  );
}