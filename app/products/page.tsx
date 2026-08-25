"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

export default function ProductsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    price: "",
    costPrice: "",
    stock: "",
    description: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProducts();
    }
  }, [status]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          name: "",
          sku: "",
          category: "Electronics",
          price: "",
          costPrice: "",
          stock: "",
          description: "",
        });
        setShowForm(false);
        fetchProducts();
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete this product?")) {
      try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  if (status === "loading" || loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <form onSubmit={handleAddProduct}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="p-2 bg-gray-700 text-white rounded"
                required
              />
              <input
                type="text"
                placeholder="SKU"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="p-2 bg-gray-700 text-white rounded"
                required
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="p-2 bg-gray-700 text-white rounded"
              >
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Food</option>
                <option>Other</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="p-2 bg-gray-700 text-white rounded"
                required
              />
              <input
                type="number"
                placeholder="Cost Price (optional)"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="p-2 bg-gray-700 text-white rounded"
              />
              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 bg-gray-700 text-white rounded mt-4 h-20"
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-white mt-4 font-semibold"
            >
              Add Product
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-800 p-4 rounded">
            <h3 className="font-bold text-white mb-2">{product.name}</h3>
            <p className="text-gray-400 text-sm mb-1">SKU: {product.sku}</p>
            <p className="text-gray-400 text-sm mb-1">
              Category: {product.category}
            </p>
            <p className="text-blue-400 font-semibold mb-1">₹{product.price}</p>
            <p className="text-yellow-400 text-sm mb-4">
              Stock: {product.stock} units
            </p>
            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="w-full bg-red-600 hover:bg-red-700 p-2 rounded text-white text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {products.length === 0 && !showForm && (
        <p className="text-gray-400 text-center py-8">
          No products yet. Add your first product!
        </p>
      )}
    </div>
  );
}