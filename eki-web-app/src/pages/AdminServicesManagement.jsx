import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import { Layers, CheckCircle, Flag, RefreshCw, X, Mail, Phone, ExternalLink } from "lucide-react";
import { ServiceStatCard } from "../components/AdminServicesManagement/ServiceStatCard";
import { ServiceTable } from "../components/AdminServicesManagement/ServiceTable";
import { ServiceCategoryChart } from "../components/AdminServicesManagement/ServiceCategoryChart";
import { ServiceStatusChart } from "../components/AdminServicesManagement/ServiceStatusChart";
import { ServiceBulkActionBar } from "../components/AdminServicesManagement/ServiceBulkActionBar";
import api from "../services/api";

const GOLD = "#EFB034";



//Category label map
// Maps backend business_category values (service types) to human-readable labels
const CATEGORY_LABELS = {
  airlines:     "Airlines",
  transport:    "Transport",
  tailoring:    "Tailoring",
  hotels:       "Hotels",
  professional: "Professional",
};

const STATUS_MAP = {
  published: "Active",
  draft:     "Draft",
  archived:  "Archived",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price, priceUnit) => {
  if (price == null) return "—";
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  const formatted = `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  if (priceUnit) return `${formatted}/${priceUnit}`;
  return formatted;
};

/**
 * Normalise a raw ListingReadSerializer response into the shape the
 * ServiceTable and ServiceProfile components expect.
 */
const normaliseService = (raw) => ({
  id:           String(raw.id),
  serviceId:    raw.id ? `SRV-${String(raw.id).slice(0, 6).toUpperCase()}` : "—",
  title:        raw.title || "Untitled",
  category:     CATEGORY_LABELS[raw.business_category] || raw.business_category || "—",
  billingModel: formatPrice(raw.price, raw.price_unit),
  vendor:       raw.vendor_name || "—",
  buyer:        "—",   // orders endpoint needed for real buyer data
  availability: raw.availability,
  status:       STATUS_MAP[raw.status] || raw.status || "Draft",
  thumbnail:    raw.images?.find((img) => img.is_primary)?.image
                ?? raw.images?.[0]?.image
                ?? null,
  _raw: raw,
});

/** Build CategoryChart data from live services. */
const deriveCategoryData = (services) => {
  if (!services.length) return [];
  const counts = {};
  services.forEach((s) => {
    counts[s.category] = (counts[s.category] || 0) + 1;
  });
  const total = services.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      name,
      total: Math.round((count / total) * 100),
    }));
};

/** Build StatusChart data from live services. */
const deriveStatusData = (services) => {
  if (!services.length) return [];
  const counts = { Active: 0, Draft: 0, Flagged: 0, Archived: 0 };
  services.forEach((s) => {
    if (counts[s.status] !== undefined) counts[s.status]++;
  });
  const total = services.length;
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([label, count]) => ({
      label,
      percentage: Math.round((count / total) * 100),
    }));
};

// ─── Service Profile Modal ─────────────────────────────────────────────────────

const ServiceProfile = ({ service, onClose, onArchive, onDelete }) => {
  const [activeTab, setActiveTab] = useState("details");

  const raw         = service._raw ?? {};
  const images      = raw.images   ?? [];
  const detail      = raw.detail   ?? null;
  const vendorCity    = raw.vendor_city    ?? null;
  const vendorCountry = raw.vendor_country ?? null;
  const contactPhone  = raw.contact_phone  ?? null;
  const contactEmail  = raw.contact_email  ?? null;
  const websiteUrl    = raw.website_url    ?? null;

  // Mock orders — replace with real orders endpoint when available
  const orders = [
    { id: "ORD-8821", buyer: "Fintech Solutions Inc", date: "Dec 12, 2023", status: "In Progress", amount: service.billingModel },
    { id: "ORD-8754", buyer: "Global Retail Ltd",     date: "Nov 28, 2023", status: "Completed",   amount: service.billingModel },
    { id: "ORD-8712", buyer: "HealthCare Plus",        date: "Nov 15, 2023", status: "Completed",   amount: service.billingModel },
    { id: "ORD-8690", buyer: "EduTrack Systems",       date: "Nov 02, 2023", status: "Cancelled",   amount: "$0.00"              },
    { id: "ORD-8655", buyer: "Skyline Ventures",       date: "Oct 20, 2023", status: "Completed",   amount: service.billingModel },
  ];

  /**
   * Render type-specific detail fields from the backend detail serializer.
   * Each business_category has its own field shape.
   */
  const renderDetailFields = () => {
    if (!detail) return null;
    const bc = raw.business_category;

    if (bc === "airlines") {
      return [
        { label: "Airline",        value: detail.airline_name },
        { label: "Flight Number",  value: detail.flight_number },
        { label: "Origin",         value: detail.origin },
        { label: "Destination",    value: detail.destination },
        { label: "Departure",      value: detail.departure_datetime ? new Date(detail.departure_datetime).toLocaleString() : null },
        { label: "Arrival",        value: detail.arrival_datetime  ? new Date(detail.arrival_datetime).toLocaleString()  : null },
        { label: "Duration",       value: detail.flight_duration },
        { label: "Frequency",      value: detail.frequency },
        { label: "Cancellation",   value: detail.cancellation_policy },
      ];
    }
    if (bc === "transport") {
      return [
        { label: "Vehicle Type",   value: detail.vehicle_type },
        { label: "Model",          value: detail.vehicle_model },
        { label: "Driver",         value: detail.driver_name },
        { label: "Origin",         value: detail.origin },
        { label: "Destination",    value: detail.destination },
        { label: "Seats Available",value: detail.seats_available },
        { label: "Price / Seat",   value: detail.price_per_seat  ? `$${detail.price_per_seat}`  : null },
        { label: "Price / Vehicle",value: detail.price_per_vehicle ? `$${detail.price_per_vehicle}` : null },
        { label: "24h Available",  value: detail.available_24h ? "Yes" : "No" },
      ];
    }
    if (bc === "tailoring") {
      return [
        { label: "Service Type",   value: detail.service_type },
        { label: "Fabric",         value: detail.fabric_material },
        { label: "Delivery Mode",  value: detail.delivery_mode },
        { label: "Duration",       value: detail.duration_days ? `${detail.duration_days} days` : null },
        { label: "Languages",      value: Array.isArray(detail.languages) ? detail.languages.join(", ") : detail.languages },
        { label: "Inclusions",     value: detail.inclusions },
      ];
    }
    if (bc === "hotels") {
      return [
        { label: "Hotel Name",     value: detail.hotel_name },
        { label: "Property Type",  value: detail.property_type },
        { label: "Star Rating",    value: detail.star_rating ? `${detail.star_rating} ★` : null },
        { label: "Check-in",       value: detail.check_in_time },
        { label: "Check-out",      value: detail.check_out_time },
        { label: "Cancellation",   value: detail.cancellation_policy },
        { label: "Amenities",      value: Array.isArray(detail.amenities) ? detail.amenities.join(", ") : detail.amenities },
      ];
    }
    if (bc === "professional") {
      return [
        { label: "Sub-Category",   value: detail.sub_category },
        { label: "Price Unit",     value: detail.price_unit },
        { label: "Duration",       value: detail.duration },
        { label: "Delivery Mode",  value: detail.delivery_mode },
        { label: "Remote",         value: detail.is_remote ? "Yes" : "No" },
        { label: "Platform",       value: detail.platform_url },
        { label: "Languages",      value: Array.isArray(detail.languages) ? detail.languages.join(", ") : detail.languages },
        { label: "Inclusions",     value: detail.inclusions },
      ];
    }
    return [];
  };

  const detailFields = renderDetailFields()?.filter((f) => f.value != null && f.value !== "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Sticky header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">{service.title}</h2>
              <p className="text-[11px] text-gray-400">{service.serviceId}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onArchive} className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                Archive
              </button>
              <button onClick={onDelete} className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                Delete
              </button>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 px-5">
            {["details", "orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[11px] font-semibold capitalize transition-colors ${
                  activeTab === tab ? "border-b-2 text-amber-500" : "text-gray-400"
                }`}
                style={{ borderBottomColor: activeTab === tab ? GOLD : "transparent" }}
              >
                {tab === "details" ? "Service Details" : "Order History"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">

          {/* ── DETAILS TAB ─────────────────────────────────── */}
          {activeTab === "details" && (
            <div className="space-y-6">

              {/* Featured Image */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Featured Image
                </h4>
                <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center overflow-hidden">
                  {service.thumbnail ? (
                    <img src={service.thumbnail} alt={service.title} className="w-full h-48 object-cover rounded-xl" />
                  ) : (
                    <Layers size={48} className="text-gray-300" />
                  )}
                </div>
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

              {/* Price & status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{service.billingModel}</p>
                  <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                    {raw.availability?.replace(/_/g, " ") || ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase">Service ID</p>
                  <p className="text-xs font-mono text-gray-700">{service.serviceId}</p>
                </div>
              </div>

              {/* Description */}
              {raw.description && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Service Description
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{raw.description}</p>
                </div>
              )}

              {/* Core info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Category</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{service.category}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[9px] text-gray-400 uppercase font-bold">Status</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{service.status}</p>
                </div>
                {raw.branch_location && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Branch Location</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{raw.branch_location}</p>
                  </div>
                )}
                {raw.published_at && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Published</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {new Date(raw.published_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Type-specific details */}
              {detailFields?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Service Details
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-3">
                    {detailFields.map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[9px] text-gray-400">{label}</p>
                        <p className="text-xs text-gray-700 mt-0.5 break-words">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel room options */}
              {raw.business_category === "hotels" && detail?.rooms?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Room Options
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[480px]">
                      <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                        <tr>
                          <th className="px-3 py-2">Room Type</th>
                          <th className="px-3 py-2">Price / Night</th>
                          <th className="px-3 py-2">Available</th>
                          <th className="px-3 py-2">Max Adults</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detail.rooms.map((room, i) => (
                          <tr key={i} className="text-xs">
                            <td className="px-3 py-2 text-gray-700 capitalize">{room.room_type}</td>
                            <td className="px-3 py-2 font-medium text-gray-800">${parseFloat(room.price_per_night).toFixed(2)}</td>
                            <td className="px-3 py-2 text-gray-600">{room.rooms_available}</td>
                            <td className="px-3 py-2 text-gray-600">{room.max_adults}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Airline seat classes */}
              {raw.business_category === "airlines" && detail?.seat_classes?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Seat Classes
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[400px]">
                      <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                        <tr>
                          <th className="px-3 py-2">Class</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">Seats Available</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detail.seat_classes.map((sc, i) => (
                          <tr key={i} className="text-xs">
                            <td className="px-3 py-2 capitalize text-gray-700">{sc.seat_class}</td>
                            <td className="px-3 py-2 font-medium text-gray-800">${parseFloat(sc.price).toFixed(2)}</td>
                            <td className="px-3 py-2 text-gray-600">{sc.seats_available}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Contact */}
              {(contactPhone || contactEmail || websiteUrl) && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Contact
                  </h4>
                  <div className="space-y-1.5">
                    {contactPhone && (
                      <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-teal-700">
                        <Phone size={12} className="text-gray-400" /> {contactPhone}
                      </a>
                    )}
                    {contactEmail && (
                      <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-teal-700">
                        <Mail size={12} className="text-gray-400" /> {contactEmail}
                      </a>
                    )}
                    {websiteUrl && (
                      <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-teal-600 hover:underline">
                        <ExternalLink size={12} /> {websiteUrl}
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
                    <p className="font-semibold text-gray-800">{service.vendor}</p>
                    {(vendorCity || vendorCountry) && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {[vendorCity, vendorCountry].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS TAB ──────────────────────────────────── */}
          {activeTab === "orders" && (
            <div>
              <p className="text-[10px] text-gray-400 mb-3">
                Showing placeholder orders — connect to the orders endpoint to display real data.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-3 py-2">Order ID</th>
                      <th className="px-3 py-2">Buyer</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="text-xs">
                        <td className="px-3 py-2 font-medium text-gray-800">{order.id}</td>
                        <td className="px-3 py-2 text-gray-600">{order.buyer}</td>
                        <td className="px-3 py-2 text-gray-500">{order.date}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                            order.status === "Completed"   ? "bg-green-50 text-green-600" :
                            order.status === "In Progress" ? "bg-blue-50 text-blue-600"   :
                            order.status === "Cancelled"   ? "bg-red-50 text-red-500"     : "bg-gray-100 text-gray-500"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800">{order.amount}</td>
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AdminServicesManagement = () => {
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [services, setServices]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [error, setError]                     = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedRows, setSelectedRows]       = useState([]);
  const [totalCount, setTotalCount]           = useState(0);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setError(null);
    try {
      // Page 1 — gives us count + first 20
      const firstPage = await api.get("/listings/admin/services/", { params: { page: 1 } });
      const payload   = firstPage.data;

      let results = [];
      let count   = 0;

      if (Array.isArray(payload.data)) {
        results = payload.data;
        count   = payload.data.length;
      } else if (payload.data?.results) {
        results = payload.data.results;
        count   = payload.data.count || results.length;
      } else if (Array.isArray(payload)) {
        results = payload;
        count   = payload.length;
      }

      // Fetch remaining pages (cap at 10 pages / 200 services)
      const pageSize   = 20;
      const totalPages = Math.ceil(count / pageSize);

      if (totalPages > 1) {
        const pagePromises = [];
        for (let p = 2; p <= Math.min(totalPages, 10); p++) {
          pagePromises.push(api.get("/listings/admin/services/", { params: { page: p } }));
        }
        const extraPages = await Promise.all(pagePromises);
        extraPages.forEach((res) => {
          const d = res.data;
          if (Array.isArray(d.data))       results = [...results, ...d.data];
          else if (d.data?.results)        results = [...results, ...d.data.results];
        });
      }

      setTotalCount(count);
      setServices(results.map(normaliseService));
    } catch (err) {
      console.error("Failed to load services:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load services. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => { setRefreshing(true); setLoading(true); await loadData(); };

  // ── Derived data ─────────────────────────────────────────────────────────
  const categories      = useMemo(() => deriveCategoryData(services), [services]);
  const serviceStatuses = useMemo(() => deriveStatusData(services),   [services]);

  const stats = useMemo(() => ({
    total:   String(totalCount || services.length),
    active:  String(services.filter((s) => s.status === "Active").length),
    flagged: String(services.filter((s) => s.status === "Flagged").length),
  }), [services, totalCount]);

  // ── Row selection ─────────────────────────────────────────────────────────
  const handleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  const handleSelectAll = (ids, checked) => setSelectedRows(checked ? ids : []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleArchive = async (service) => {
    try {
      await api.patch(`/listings/${service.id}/status/`, { status: "archived" });
      setServices((prev) =>
        prev.map((s) => s.id === service.id ? { ...s, status: "Archived" } : s)
      );
    } catch (err) {
      console.error("Archive failed:", err);
    }
    setSelectedService(null);
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/listings/${service.id}/`);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      setTotalCount((c) => c - 1);
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setSelectedService(null);
  };

  const handleBulkActivate = async () => {
    await Promise.allSettled(
      selectedRows.map((id) => api.patch(`/listings/${id}/status/`, { status: "published" }))
    );
    setServices((prev) =>
      prev.map((s) => selectedRows.includes(s.id) ? { ...s, status: "Active" } : s)
    );
    setSelectedRows([]);
  };

  const handleBulkArchive = async () => {
    await Promise.allSettled(
      selectedRows.map((id) => api.patch(`/listings/${id}/status/`, { status: "archived" }))
    );
    setServices((prev) =>
      prev.map((s) => selectedRows.includes(s.id) ? { ...s, status: "Archived" } : s)
    );
    setSelectedRows([]);
  };

  const handleBulkExport = () => {
    const selected = services.filter((s) => selectedRows.includes(s.id));
    const headers  = ["Service ID", "Title", "Category", "Billing Model", "Vendor", "Status"];
    const rows     = selected.map((s) =>
      [`"${s.serviceId}"`, `"${s.title}"`, `"${s.category}"`, `"${s.billingModel}"`, `"${s.vendor}"`, `"${s.status}"`].join(",")
    );
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "selected_services.csv";
    a.click();
    URL.revokeObjectURL(url);
    setSelectedRows([]);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#ecece7] font-sans">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6 max-w-7xl mx-auto space-y-5">

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Services Management</h1>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Audit, model, and track service-based listings across all categories.
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="font-semibold">Error:</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ServiceStatCard
                  label="Total Services"
                  value={loading ? "—" : stats.total}
                  change="+12.5%"
                  icon={Layers}
                  bgColor="bg-[#235E5D]"
                />
                <ServiceStatCard
                  label="Active Services"
                  value={loading ? "—" : stats.active}
                  change="+4.2%"
                  icon={CheckCircle}
                  bgColor="bg-[#EFB034]"
                />
                <ServiceStatCard
                  label="Flagged Services"
                  value={loading ? "—" : stats.flagged}
                  icon={Flag}
                  bgColor="bg-red-500"
                />
              </div>

              {/* Charts */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
                  <div className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <ServiceCategoryChart
                    categories={categories}
                    title="Services by Category"
                    subtitle="Volume distribution across primary marketplace verticals"
                  />
                  <ServiceStatusChart
                    statuses={serviceStatuses}
                    title="Service Status"
                    subtitle="Operational health overview"
                  />
                </div>
              ) : null}

              {/* Services Table */}
              {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse" />
              ) : (
                <ServiceTable
                  services={services}
                  onSelect={setSelectedService}
                  selectedId={selectedService?.id}
                  selectedRows={selectedRows}
                  onSelectRow={handleSelectRow}
                  onSelectAll={handleSelectAll}
                />
              )}
            </main>

            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. SellEasy.</div>
              <div>© 2026 Admin Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="relative inline-block cursor-pointer hover:underline">
                  eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
                </span>
                <span className="cursor-pointer hover:underline">Support</span>
                <span className="cursor-pointer hover:underline">Privacy Policy</span>
                <span className="cursor-pointer hover:underline">Terms of Service</span>
                <span className="cursor-pointer hover:underline">Ijoema ltd</span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {selectedService && (
        <ServiceProfile
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onArchive={() => handleArchive(selectedService)}
          onDelete={() => handleDelete(selectedService)}
        />
      )}

      <ServiceBulkActionBar
        selectedCount={selectedRows.length}
        onActivate={handleBulkActivate}
        onArchive={handleBulkArchive}
        onExport={handleBulkExport}
      />
    </div>
  );
};

export default AdminServicesManagement;