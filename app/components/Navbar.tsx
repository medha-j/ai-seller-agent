"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex gap-6">
        <Link href="/dashboard" className="font-bold text-lg">
          🤖 AI Seller Agent
        </Link>
        {session && (
          <>
            <Link href="/products" className="hover:text-blue-400">
              Products
            </Link>
            <Link href="/sales" className="hover:text-blue-400">
              Sales
            </Link>
            <Link href="/recommendations" className="hover:text-blue-400">
              AI Recommendations
            </Link>
            <Link href="/audit" className="hover:text-blue-400">
              Audit Trail
            </Link>
          </>
        )}
      </div>
      {session && (
        <div className="flex gap-4 items-center">
          <span className="text-sm">{session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}