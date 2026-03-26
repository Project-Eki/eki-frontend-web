import React, { useState, useEffect, useMemo } from "react";
import { getServices } from "../services/api";
import Sidebar from "../components/Vendormanagement/Sidebar";
import Navbar from "../components/Vendormanagement/Navbar";
import ServiceForm from "../components/Vendormanagement/ServiceForm";
import Footer from "../components/Vendormanagement/footer";

import {
  Plus, X, Briefcase, LayoutGrid, List,
  Clock, Calendar, Star, CheckCircle, ChevronDown,
  Search, SlidersHorizontal, Globe, MapPin, Package
} from 'lucide-react';

// COLOR MAP — used by the stat cards to pick their icon + value colors.
// Keeping this outside the component so it's not re-created on every render.
const colorMap = {
  teal:   { bg: "bg-teal-50",   icon: "text-teal-600",   val: "text-teal-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-600",  val: "text-green-700"  },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  val: "text-amber-700"  },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", val: "text-purple-700" },
};

// STATUS / AVAILABILITY STYLE MAPS — used inside ServiceCard
const STATUS_STYLE = {
  published: "bg-green-50 text-green-700 border border-green-200",
  active:    "bg-green-50 text-green-700 border border-green-200",
  draft:     "bg-amber-50 text-amber-700 border border-amber-200",
  archived:  "bg-gray-100 text-gray-500 border border-gray-200",
  paused:    "bg-gray-100 text-gray-500 border border-gray-200",
};
const AVAIL_COLOR = {
  "Fully Booked": "text-red-500",
  "Limited":      "text-amber-500",
  "limited":      "text-amber-500",
  "booked":       "text-red-500",
};
// SERVICE CARD — renders one listing card from real API data.
//
// `s` is the mapped service object built inside the useEffect below.
// Every field here comes from the API
const ServiceCard = ({ s }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">

    {/* Cover image — from API images array, or a placeholder */}
    <div className="relative h-44 overflow-hidden bg-gray-50">
      {s.img ? (
        <img
          src={s.img}
          alt={s.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        // Placeholder when no image was uploaded for this listing
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <Package size={28} className="text-gray-300" />
          <span className="text-[10px] text-gray-300">No image</span>
        </div>
      )}

      {/* Remote / in-person badge — derived from API delivery_mode field */}
      <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        {s.mode === "remote" || s.mode === "online"
          ? <><Globe size={9}/> Remote</>
          : <><MapPin size={9}/> In-person</>
        }
      </span>
    </div>

    <div className="p-4">
      {/* Category + status row */}
      <div className="flex items-center justify-between mb-1.5">
        {/* Category: comes from business_category, uppercased in the map */}
        <span className="text-[10px] font-bold text-gray-400 tracking-widest truncate max-w-[120px]">
          {s.category}
        </span>
        {/* Status badge: "published", "draft", "archived" from API */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_STYLE[s.status] || STATUS_STYLE.draft}`}>
          {s.status}
        </span>
      </div>

      {/* Title — from API title field */}
      <h3 className="font-black text-[15px] text-gray-900 leading-tight mb-1 line-clamp-1">
        {s.title || '—'}
      </h3>

      {/* Description — from API description field */}
      <p className="text-[12px] text-gray-500 line-clamp-2 mb-3">
        {s.desc || 'No description provided.'}
      </p>

      {/* Duration + availability row */}
      <div className="flex items-center justify-between text-[12px] text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12}/> {s.duration || 'N/A'}
        </span>
        <span className={`flex items-center gap-1 font-semibold ${AVAIL_COLOR[s.avail] || "text-gray-400"}`}>
          <Calendar size={12}/> {s.avail || 'Available'}
        </span>
      </div>

      {/* Price + view link */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          {/* Price from API price field */}
          <span className="text-[21px] font-black text-gray-900">
            ${parseFloat(s.price || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400">/{s.unit || 'session'}</span>
        </div>
        <button className="text-[12px] font-bold text-teal-700 hover:text-amber-500 transition-colors flex items-center gap-1">
          View Details <span className="text-[10px]">↗</span>
        </button>
      </div>
    </div>
  </div>
);

// SERVICE MANAGEMENT PAGE — main component
const ServiceManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode,    setViewMode]    = useState("grid");
  const [search,      setSearch]      = useState("");
  const [sortBy,      setSortBy]      = useState("newest");

  // ── DATA STATE ──
  // services: the array of mapped listing objects from the API
  // loading:  true while the fetch is in progress (shows skeleton)
  // refreshKey: incrementing this number re-triggers the useEffect fetch.
  //             This is how we refresh the grid after a new service is created.
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── MODAL STATE ──
  // Controls whether the ServiceForm modal is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FETCH SERVICES
  //
  // Runs on mount (refreshKey = 0) and every time refreshKey
  // is incremented. Incrementing refreshKey is what causes the
  // grid to re-render with the newly created listing card.
  //
  // API: GET /api/v1/listings/
  // Returns an array (or paginated object) of listing items.
  // We map each item to the flat shape ServiceCard expects.
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMyServices = async () => {
      setLoading(true);
      try {
        const data = await getServices();

        // Normalise: API may return a plain array or { results: [...] }
        const raw = Array.isArray(data) ? data : (data.results || data.listings || []);

        // Map API fields → flat shape that ServiceCard reads from
        const formatted = raw.map(item => ({
          id:       item.id,
          // business_category comes as lowercase from API, uppercase it for display
          category: (item.business_category || '').toUpperCase(),
          title:    item.title        || '—',
          desc:     item.description  || '',
          price:    item.price        || '0',
          unit:     item.price_unit   || 'session',
          // Duration lives inside the nested `detail` object — path differs per type
          duration: item.detail?.duration
                    || item.detail?.flight_duration
                    || item.detail?.duration_days && `${item.detail.duration_days} days`
                    || 'N/A',
          avail:    item.availability || 'Available',
          status:   item.status       || 'draft',
          // Delivery mode — professional services use detail.delivery_mode
          mode:     item.detail?.delivery_mode
                    || (item.detail?.available_24h ? 'remote' : 'in-person'),
          // Primary image: find is_primary flag, fall back to first image
          img:      item.images?.find(img => img.is_primary)?.image
                    || item.images?.[0]?.image
                    || null,
        }));

        setServices(formatted);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyServices();
  }, [refreshKey]); // re-runs every time refreshKey changes
  // FORM CLOSE HANDLER
  //
  // ServiceForm calls onClose(didCreate) when it finishes.
  //   didCreate = true  → new listing was saved → increment
  //                        refreshKey so useEffect re-fetches
  //   didCreate = false → user cancelled → just close modal
  //
  // This is the single wire that connects form submission to
  // the card grid updating.
  
  const handleFormClose = (didCreate) => {
    setIsModalOpen(false);

    if (didCreate === true) {
      // Incrementing refreshKey triggers the useEffect above,
      // which re-fetches the listings and the new card appears.
      setRefreshKey(prev => prev + 1);
    }
  };


  // ── FILTER — client-side search over already-fetched data ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [services, search]);


  // ── STATS — derived from real API data, not hardcoded ──
  // These update automatically every time `services` changes (after a re-fetch).
  const stats = useMemo(() => [
    {
      label: "Total Services",
      // Count of all listings returned by the API
      value: services.length.toString(),
      icon:  <Briefcase size={18} />,
      color: "teal",
    },
    {
      label: "Active Now",
      // Count listings where status is "published" or "active"
      value: services.filter(s => s.status === 'published' || s.status === 'active').length.toString(),
      icon:  <CheckCircle size={18} />,
      color: "green",
    },
    {
      label: "Draft",
      // Count listings still in draft — not yet published
      value: services.filter(s => s.status === 'draft').length.toString(),
      icon:  <Calendar size={18} />,
      color: "amber",
    },
    {
      label: "Categories",
      // Count distinct business categories in the vendor's listings
      value: [...new Set(services.map(s => s.category))].length.toString(),
      icon:  <Star size={18} />,
      color: "purple",
    },
  ], [services]);


  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <main className="flex-1 p-5 sm:p-8">
            <div className="max-w-7xl mx-auto">

              {/* ── Page header + Create button ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Service Management</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Manage your professional offerings, schedules, and service availability.
                  </p>
                </div>

                {/* "Create New Service" — opens the ServiceForm modal */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold text-sm shrink-0 w-full sm:w-auto justify-center"
                >
                  <Plus size={18} /> Create New Service
                </button>
              </div>

              {/* ── Search + filter bar ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filter by title, category, or keyword..."
                    className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors">
                    <SlidersHorizontal size={15} /> <span className="hidden sm:inline">Advanced</span> Filters
                  </button>
                  <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-teal-700 text-white" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <LayoutGrid size={15}/>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-teal-700 text-white" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <List size={15}/>
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="h-10 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_asc">Price: Low → High</option>
                      <option value="price_desc">Price: High → Low</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
              </div>

              {/* ── STAT CARDS ──
                  These are now derived from real API data via the `stats`
                  useMemo above. They update automatically after a re-fetch.
                   */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {stats.map((s, i) => {
                  const c = colorMap[s.color];
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                          {s.label}
                        </p>
                        {/* Show "—" while loading so it doesn't flash 0 then jump */}
                        <p className={`text-[20px] sm:text-[22px] font-black leading-none ${c.val}`}>
                          {loading ? '—' : s.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── SERVICES GRID ──
                  Loading: show skeleton cards
                  No results after filter: show empty state
                  Data ready: show real ServiceCards */}
              {loading ? (
                // Skeleton grid — same size as real cards so no layout shift
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-44 bg-gray-100" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>

              ) : filtered.length === 0 ? (
                // Empty state — different message depending on whether a search
                // filter is active or there are genuinely no listings yet
                <div className="bg-white border border-gray-200 rounded-2xl p-16 sm:p-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 text-teal-600">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No Services Found</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">
                    {search
                      ? 'Try a different search term.'
                      : 'Click "Create New Service" to add your first listing.'}
                  </p>
                </div>

              ) : (
                // Real cards — one per listing from the API
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {filtered.map(s => <ServiceCard key={s.id} s={s} />)}
                </div>
              )}

              {/* ── Pagination — shows real count from services array ── */}
              {!loading && services.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing <b>{filtered.length}</b> of <b>{services.length}</b> services
                  </p>
                  <div className="flex items-center gap-1">
                    <button className="h-9 px-3 sm:px-4 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-teal-500 hover:text-teal-700 transition-colors font-medium">
                      Previous
                    </button>
                    <button className="w-9 h-9 rounded-lg text-sm font-bold bg-teal-700 text-white">1</button>
                    <button className="h-9 px-3 sm:px-4 bg-teal-700 text-white rounded-lg text-sm font-bold hover:bg-teal-800 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* 
          SERVICE FORM MODAL

          Rendered when isModalOpen is true.

          The key fix from my  original code:
          ServiceForm receives onClose={handleFormClose}

          handleFormClose(didCreate):
            - always closes the modal
            - if didCreate === true, increments refreshKey
            - refreshKey change triggers useEffect re-fetch
            - new card appears in the grid automatically
       */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">New Service Listing</h2>
              <button
                onClick={() => handleFormClose(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18}/>
              </button>
            </div>

            {/*
              ServiceForm gets handleFormClose as its onClose prop.
              When the vendor submits successfully, ServiceForm calls:
                onClose(true)
              Which triggers handleFormClose(true), which increments
              refreshKey, which triggers the useEffect re-fetch above.
            */}
            <ServiceForm onClose={handleFormClose} />
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceManagement;