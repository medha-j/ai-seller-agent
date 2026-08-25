"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardMetrics {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  avgOrderValue: number;
  topProduct: {
    name: string;
    revenue: number;
  } | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    topProduct: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeRes = await fetch("/api/store");
        const storeData = await storeRes.json();

        if (!storeData.store) {
          router.push("/onboarding");
          return;
        }

        setStore(storeData.store);

        const [productsRes, salesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/sales"),
        ]);

        const products = await productsRes.json();
        const sales = await salesRes.json();

        const totalRevenue = sales.reduce(
          (sum: number, sale: any) => sum + sale.totalAmount,
          0
        );

        const topProduct = products.length > 0 ? products[0] : null;

        setMetrics({
          totalRevenue,
          totalSales: sales.length,
          totalProducts: products.length,
          avgOrderValue: sales.length > 0 ? totalRevenue / sales.length : 0,
          topProduct: topProduct
            ? { name: topProduct.name, revenue: topProduct.price }
            : null,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  if (status === "loading" || loading) return <p className="p-8">Loading...</p>;

  if (!store) return null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{store.storeName}</h1>
        <p className="text-gray-600">📍 {store.category}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-500 p-6 rounded text-white">
          <p className="text-sm opacity-80">Total Revenue</p>
          <p className="text-3xl font-bold">₹{metrics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-green-500 p-6 rounded text-white">
          <p className="text-sm opacity-80">Products</p>
          <p className="text-3xl font-bold">{metrics.totalProducts}</p>
        </div>
        <div className="bg-yellow-500 p-6 rounded text-white">
          <p className="text-sm opacity-80">Sales</p>
          <p className="text-3xl font-bold">{metrics.totalSales}</p>
        </div>
        <div className="bg-purple-500 p-6 rounded text-white">
          <p className="text-sm opacity-80">Avg Order Value</p>
          <p className="text-3xl font-bold">₹{metrics.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/products"
              className="block bg-blue-600 hover:bg-blue-700 p-3 rounded text-white text-center"
            >
              Manage Products
            </Link>
            <Link
              href="/sales"
              className="block bg-green-600 hover:bg-green-700 p-3 rounded text-white text-center"
            >
              Log Sales
            </Link>
            <Link
              href="/recommendations"
              className="block bg-purple-600 hover:bg-purple-700 p-3 rounded text-white text-center"
            >
              Get AI Recommendations
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-xl font-bold text-white mb-4">Top Product</h2>
          {metrics.topProduct ? (
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-white font-semibold">{metrics.topProduct.name}</p>
              <p className="text-gray-400 text-sm">
                Price: ₹{metrics.topProduct.revenue}
              </p>
            </div>
          ) : (
            <p className="text-gray-400">Add products to see analytics</p>
          )}
        </div>
      </div>
    </div>
  );
}