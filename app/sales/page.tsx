"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface Sale {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  customerSegment: string | null;
  timestamp: string;
}

export default function SalesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    pricePerUnit: "",
    customerSegment: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProducts();
      fetchSales();
    }
  }, [status]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales");
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
          pricePerUnit: parseFloat(formData.pricePerUnit),
          customerSegment: formData.customerSegment || null,
        }),
      });

      if (res.ok) {
        setFormData({
          productId: "",
          quantity: "",
          pricePerUnit: "",
          customerSegment: "",
        });
        fetchSales();
      }
    } catch (err) {
      console.error("Error logging sale:", err);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  if (status === "loading" || loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Sales Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 p-4 rounded text-white">
          <p className="text-sm">Total Sales</p>
          <p className="text-2xl font-bold">{sales.length}</p>
        </div>
        <div className="bg-green-500 p-4 rounded text-white">
          <p className="text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-yellow-500 p-4 rounded text-white">
          <p className="text-sm">Avg Order Value</p>
          <p className="text-2xl font-bold">
            ₹{sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : 0}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Log New Sale</h2>
        <form onSubmit={handleLogSale}>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              className="p-2 bg-gray-700 text-white rounded"
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₹{p.price})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="p-2 bg-gray-700 text-white rounded"
              required
            />
            <input
              type="number"
              placeholder="Price Per Unit"
              value={formData.pricePerUnit}
              onChange={(e) =>
                setFormData({ ...formData, pricePerUnit: e.target.value })
              }
              className="p-2 bg-gray-700 text-white rounded"
              required
            />
            <select
              value={formData.customerSegment}
              onChange={(e) =>
                setFormData({ ...formData, customerSegment: e.target.value })
              }
              className="p-2 bg-gray-700 text-white rounded"
            >
              <option value="">Customer Segment (optional)</option>
              <option value="new">New Customer</option>
              <option value="repeat">Repeat Customer</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-white mt-4 font-semibold"
          >
            Log Sale
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Recent Sales</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Qty</th>
              <th className="p-4 text-left">Price/Unit</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Segment</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-700">
                <td className="p-4">{sale.product.name}</td>
                <td className="p-4">{sale.quantity}</td>
                <td className="p-4">₹{sale.pricePerUnit}</td>
                <td className="p-4 font-bold text-green-400">
                  ₹{sale.totalAmount}
                </td>
                <td className="p-4">
                  {sale.customerSegment || "N/A"}
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(sale.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sales.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No sales logged yet. Log your first sale!
        </p>
      )}
    </div>
  );
}