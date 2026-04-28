import React, { useState } from "react";
import { X, Package, ExternalLink, Mail, Phone } from "lucide-react";

const GOLD = "#EFB034";

const getOrderStatusClass = (status) => {
  switch (status) {
    case "Completed":  return "bg-green-50 text-green-600";
    case "Processing": return "bg-yellow-50 text-yellow-600";
    case "Cancelled":  return "bg-red-50 text-red-500";
    default:           return "bg-gray-100 text-gray-500";
  }
};

/**
 * Renders a key→value detail row from product.detail (ProductDetail serializer).
 * Handles nested objects like variants gracefully.
 */
const DetailRow = ({ label, value }) => {
  if (value == null || value === "" || value === "—") return null;
  const display =
    typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
  return (
    <div>
      <p className="text-[9px] text-gray-400 capitalize">{label.replace(/_/g, " ")}</p>
      <p className="text-xs text-gray-700 mt-0.5 break-words">{display}</p>
    </div>
  );
};

export const ProductProfileModal = ({ product, onClose, onArchive, onDelete }) => {
  const [activeTab, setActiveTab] = useState("details");

  // The real backend detail object (ProductDetailSerializer output or null)
  const detail   = product._raw?.detail   ?? null;
  const variants = detail?.variants       ?? [];
  const images   = product._raw?.images   ?? [];

  // Vendor info from ListingReadSerializer
  const vendorCity    = product._raw?.vendor_city    ?? "—";
  const vendorCountry = product._raw?.vendor_country ?? "—";
  const contactPhone  = product._raw?.contact_phone  ?? null;
  const contactEmail  = product._raw?.contact_email  ?? null;
  const websiteUrl    = product._raw?.website_url    ?? null;

  // Mock orders (replace with real order endpoint when available)
  const recentOrders = [
    { id: "ORD-9902", buyer: "Sarah Jenkins",    date: "May 18, 2024", qty: 1, status: "Completed",  total: "$349.99" },
    { id: "ORD-9881", buyer: "Michael Chen",     date: "May 16, 2024", qty: 2, status: "Processing", total: "$699.98" },
    { id: "ORD-9875", buyer: "Elena Rodriguez",  date: "May 15, 2024", qty: 1, status: "Completed",  total: "$349.99" },
    { id: "ORD-9860", buyer: "Liam Wilson",      date: "May 14, 2024", qty: 1, status: "Completed",  total: "$349.99" },
    { id: "ORD-9842", buyer: "James Miller",     date: "May 12, 2024", qty: 1, status: "Cancelled",  total: "$0.00"   },
  ];

  const primaryImage = images.find((img) => img.is_primary) ?? images[0] ?? null;

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

          {/* Tabs */}
          <div className="flex gap-6 px-5">
            {["details", "variants", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[11px] font-semibold capitalize transition-colors ${
                  activeTab === tab ? "border-b-2 text-amber-500" : "text-gray-400"
                }`}
                style={{ borderBottomColor: activeTab === tab ? GOLD : "transparent" }}
              >
                {tab === "variants" ? `Variants (${variants.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">

          {/* ── DETAILS TAB ─────────────────────────────────────────── */}
          {activeTab === "details" && (
            <div className="space-y-6">

              {/* Featured Image */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Featured Image
                </h4>
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center overflow-hidden">
                  {primaryImage?.image ? (
                    <img
                      src={primaryImage.image}
                      alt={primaryImage.alt_text || product.title}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <Package size={48} className="text-gray-300" />
                  )}
                </div>
                {/* Thumbnail strip for multiple images */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {images.map((img) => (
                      <img
                        key={img.id}
                        src={img.image}
                        alt={img.alt_text || ""}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Price & SKU */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{product.price}</p>
                  {detail?.sale_status && (
                    <p className="text-[10px] text-amber-600 font-medium mt-0.5 uppercase">
                      {detail.sale_status}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase">Internal SKU</p>
                  <p className="text-xs font-mono text-gray-700">{detail?.sku || product.sku}</p>
                </div>
              </div>

              {/* Description */}
              {product._raw?.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product._raw.description}
                  </p>
                </div>
              )}

              {/* Core Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Category</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{product.category}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Status</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{product.status}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Availability</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 capitalize">
                    {product._raw?.availability?.replace(/_/g, " ") || "—"}
                  </p>
                </div>
                {detail?.weight_kg && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Weight</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{detail.weight_kg} kg</p>
                  </div>
                )}
                {detail?.stock != null && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Base Stock</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{detail.stock}</p>
                  </div>
                )}
                {detail?.total_stock != null && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Total Stock</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{detail.total_stock}</p>
                  </div>
                )}
              </div>

              {/* Contact & Links */}
              {(contactPhone || contactEmail || websiteUrl) && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Contact
                  </h4>
                  <div className="space-y-1.5">
                    {contactPhone && (
                      <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-teal-700">
                        <Phone size={12} className="text-gray-400" />
                        {contactPhone}
                      </a>
                    )}
                    {contactEmail && (
                      <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-teal-700">
                        <Mail size={12} className="text-gray-400" />
                        {contactEmail}
                      </a>
                    )}
                    {websiteUrl && (
                      <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-teal-600 hover:underline">
                        <ExternalLink size={12} />
                        {websiteUrl}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Vendor Partner */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Vendor Partner
                </h4>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{product.vendor}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {vendorCity !== "—" ? `${vendorCity}, ` : ""}{vendorCountry}
                    </p>
                  </div>
                  {product._raw?.branch_location && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Branch</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {product._raw.branch_location}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Published date */}
              {product._raw?.published_at && (
                <p className="text-[10px] text-gray-400">
                  Published:{" "}
                  {new Date(product._raw.published_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              )}
            </div>
          )}

          {/* ── VARIANTS TAB ─────────────────────────────────────────── */}
          {activeTab === "variants" && (
            <div>
              {variants.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">
                  No variants for this product.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[540px]">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                      <tr>
                        <th className="px-3 py-2">Color</th>
                        <th className="px-3 py-2">Size</th>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Stock</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variants.map((v) => (
                        <tr key={v.id} className="text-xs">
                          <td className="px-3 py-2 text-gray-700">{v.color || "—"}</td>
                          <td className="px-3 py-2 text-gray-700">{v.size  || "—"}</td>
                          <td className="px-3 py-2 font-mono text-gray-500 text-[10px]">{v.sku || "—"}</td>
                          <td className="px-3 py-2 font-medium text-gray-800">
                            {v.effective_price != null
                              ? `$${parseFloat(v.effective_price).toFixed(2)}`
                              : v.price != null
                              ? `$${parseFloat(v.price).toFixed(2)}`
                              : "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{v.stock ?? "—"}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                                v.stock_status === "in_stock"
                                  ? "bg-green-50 text-green-600"
                                  : v.stock_status === "low_stock"
                                  ? "bg-yellow-50 text-yellow-600"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              {v.stock_status?.replace(/_/g, " ") || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ───────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div>
              <p className="text-[10px] text-gray-400 mb-3">
                Showing mock orders — connect to the orders endpoint to display real data.
              </p>
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