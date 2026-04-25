import React, { useState } from "react";
import { X, Package } from "lucide-react";

const GOLD = "#EFB034";

const getOrderStatusClass = (status) => {
  switch (status) {
    case "Completed": return "bg-green-50 text-green-600";
    case "Processing": return "bg-yellow-50 text-yellow-600";
    case "Cancelled": return "bg-red-50 text-red-500";
    default: return "bg-gray-100 text-gray-500";
  }
};

export const ProductProfileModal = ({ product, onClose, onArchive, onDelete }) => {
  const [activeTab, setActiveTab] = useState("details");

  const recentOrders = [
    { id: "ORD-9902", buyer: "Sarah Jenkins", date: "May 18, 2024", qty: 1, status: "Completed", total: "$349.99" },
    { id: "ORD-9881", buyer: "Michael Chen", date: "May 16, 2024", qty: 2, status: "Processing", total: "$699.98" },
    { id: "ORD-9875", buyer: "Elena Rodriguez", date: "May 15, 2024", qty: 1, status: "Completed", total: "$349.99" },
    { id: "ORD-9860", buyer: "Liam Wilson", date: "May 14, 2024", qty: 1, status: "Completed", total: "$349.99" },
    { id: "ORD-9842", buyer: "James Miller", date: "May 12, 2024", qty: 1, status: "Cancelled", total: "$0.00" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">{product.title}</h2>
              <p className="text-[11px] text-gray-400">{product.sku}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onArchive}
                className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Archive
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex gap-6 px-5">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 text-[11px] font-semibold transition-colors ${activeTab === "details" ? "border-b-2 text-amber-500" : "text-gray-400"}`}
              style={{ borderBottomColor: activeTab === "details" ? GOLD : "transparent" }}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-2 text-[11px] font-semibold transition-colors ${activeTab === "orders" ? "border-b-2 text-amber-500" : "text-gray-400"}`}
              style={{ borderBottomColor: activeTab === "orders" ? GOLD : "transparent" }}
            >
              Order History
            </button>
          </div>
        </div>

        <div className="p-5">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Featured Image — same layout as ServiceProfile */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Featured Image</h4>
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-xl" />
                  ) : (
                    <Package size={48} className="text-gray-300" />
                  )}
                </div>
              </div>

              {/* Pricing & Identity */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{product.price}</p>
                  <p className="text-sm text-gray-400 line-through">$399.00</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">INTERNAL SKU</p>
                  <p className="text-xs font-mono text-gray-700">{product.sku}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Experience world-class audio with the Aura G3. Featuring our patented adaptive noise cancellation technology,
                  these headphones provide an unparalleled soundstage for music lovers and professionals alike.
                  Precision-engineered drivers deliver deep bass and crystalline highs.
                </p>
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Category</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{product.category}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Published</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">2023-11-15</p>
                </div>
              </div>

              {/* Technical Specs */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Technical Specs</h4>
                <div className="bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-2 p-3">
                    <div>
                      <p className="text-[9px] text-gray-400">Dimensions</p>
                      <p className="text-xs text-gray-700">7.5 x 6.7 x 3.1 inches</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400">Weight</p>
                      <p className="text-xs text-gray-700">250g (0.55 lbs)</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400">Material</p>
                      <p className="text-xs text-gray-700">Recycled Plastic, Vegan Leather</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400">Connectivity</p>
                      <p className="text-xs text-gray-700">Bluetooth 5.2, USB-C</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400">Battery Life</p>
                      <p className="text-xs text-gray-700">40 Hours</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400">Warranty</p>
                      <p className="text-xs text-gray-700">2 Years Limited</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vendor Partner */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vendor Partner</h4>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{product.vendor}</p>
                    <p className="text-[10px] text-gray-500">ID: VEN-004</p>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-gray-500">Compliance Score</p>
                      <p className="font-bold text-green-600">98%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Response Time</p>
                      <p className="font-bold text-gray-800">&lt; 2h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-3 py-2">Order ID</th>
                      <th className="px-3 py-2">Buyer</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="text-xs">
                        <td className="px-3 py-2 font-medium text-gray-800">{order.id}</td>
                        <td className="px-3 py-2 text-gray-600">{order.buyer}</td>
                        <td className="px-3 py-2 text-gray-500">{order.date}</td>
                        <td className="px-3 py-2 text-gray-600">{order.qty}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getOrderStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800">{order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};