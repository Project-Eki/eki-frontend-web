/**
 * ServiceManagement.jsx
 *
 * FIXES IN THIS VERSION:
 *
 * 1. TEAL COLOR BLEEDING TOP-RIGHT (the image showed a teal/green patch)
 *    Root cause: the SIDEBAR_W spacer div inside the fixed navbar had the OLD
 *    light-teal gradient. The new sidebar uses a dark-green gradient. The spacer
 *    must match. ALSO — the spacer approach causes color to bleed on any screen
 *    width between the sidebar and the navbar bg. Simplest fix: remove the spacer
 *    entirely and let Navbar3 span the full width. The navbar already visually
 *    "starts after the sidebar" because the sidebar sits beneath the navbar and
 *    the navbar is transparent up to its own bg-white. The REAL cause of the bleed
 *    was the spacer div bleeding its gradient into the top-right corner of the
 *    content area on large screens. Removing it eliminates the bleed.
 *
 * 3. EDIT / DELETE for existing service cards
 *    Each ServiceCard now has an Edit (pencil) and Delete (trash) button in
 *    the top-right corner (hover-reveal). Clicking Edit opens the ServiceForm
 *    in edit mode (passes the existing listing id + data). Clicking Delete shows
 *    a confirm dialog then calls deleteListing(id) from api.js.
 *
 * 4. TWO IMAGES
 *    ServiceForm now accepts TWO cover images instead of one. The Step 4 upload
 *    zone shows two upload slots. Both are uploaded as separate API calls to
 *    POST /listings/{id}/images/. The first image has is_primary: true, the
 *    second has is_primary: false.
 */

import React, { useState, useEffect, useMemo } from "react";
import { getServices, deleteListing } from "../services/api";
import VendorSidebar from "../components/VendorSidebar";
import Navbar3 from "../components/adminDashboard/Navbar4";
import ServiceForm from "../components/Vendormanagement/ServiceForm";

import {
  Plus, X, Briefcase, LayoutGrid, List,
  Clock, Calendar, Star, CheckCircle, ChevronDown,
  Search, SlidersHorizontal, Globe, MapPin, Package,
  Pencil, Trash2, AlertTriangle, Loader2
} from 'lucide-react';

// CONSTANTS — unchanged
const colorMap = {
  teal:   { bg:"bg-teal-50",   icon:"text-teal-600",   val:"text-teal-700"   },
  green:  { bg:"bg-green-50",  icon:"text-green-600",  val:"text-green-700"  },
  amber:  { bg:"bg-amber-50",  icon:"text-amber-600",  val:"text-amber-700"  },
  purple: { bg:"bg-purple-50", icon:"text-purple-600", val:"text-purple-700" },
};

const STATUS_STYLE = {
  published: "bg-green-50 text-green-700 border border-green-200",
  active:    "bg-green-50 text-green-700 border border-green-200",
  draft:     "bg-amber-50 text-amber-700 border border-amber-200",
  archived:  "bg-gray-100 text-gray-500 border border-gray-200",
  paused:    "bg-gray-100 text-gray-500 border border-gray-200",
};

// SERVICE CARD — with Edit + Delete buttons (hover-reveal top-right)
// ─────────────────────────────────────────────────────────────────────────────
const ServiceCard = ({ s, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="relative h-44 overflow-hidden bg-slate-50">
      {s.img ? (
        <img src={s.img} alt={s.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <Package size={28} className="text-slate-300"/>
          <span className="text-[10px] text-slate-300">No image</span>
        </div>
      )}
      {/* Remote / in-person badge */}
      <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        {s.mode === "remote" || s.mode === "online"
          ? <><Globe size={9}/> Remote</>
          : <><MapPin size={9}/> In-person</>}
      </span>
      {/* Edit + Delete — appear on hover */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(s)}
          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-[#125852] transition-colors"
          title="Edit service">
          <Pencil size={12}/>
        </button>
        <button onClick={() => onDelete(s)}
          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-red-500 transition-colors"
          title="Delete service">
          <Trash2 size={12}/>
        </button>
      </div>
    </div>

    <div className="p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest truncate max-w-[120px]">{s.category}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_STYLE[s.status] || STATUS_STYLE.draft}`}>{s.status}</span>
      </div>
      <h3 className="font-black text-[15px] text-slate-900 leading-tight mb-1 line-clamp-1">{s.title || '—'}</h3>
      <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">{s.desc || 'No description provided.'}</p>
      <div className="flex items-center justify-between text-[12px] text-slate-400 mb-3">
        <span className="flex items-center gap-1"><Clock size={12}/> {s.duration || 'N/A'}</span>
        <span className="flex items-center gap-1 font-semibold text-slate-400">
          <Calendar size={12}/> {s.avail || 'Available'}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div>
          <span className="text-[21px] font-black text-slate-900">${parseFloat(s.price || 0).toLocaleString()}</span>
          <span className="text-[11px] text-slate-400">/{s.unit || 'session'}</span>
        </div>
        <button onClick={() => onEdit(s)}
          className="text-[12px] font-bold text-teal-700 hover:text-amber-500 transition-colors flex items-center gap-1">
          Edit 
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({ service, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={22} className="text-red-500"/>
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">Delete Service?</h3>
      <p className="text-[11px] text-slate-500 mb-5">
        "<span className="font-bold text-slate-700">{service?.title}</span>" will be permanently removed. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={isDeleting}
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isDeleting}
          className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5">
          {isDeleting ? <><Loader2 size={11} className="animate-spin"/> Deleting…</> : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
);


// TEAL FOOTER
const TealFooter = () => (
  <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0 mx-3 mb-3 rounded-2xl">
    <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
    <div>© 2026 Vendor Portal. All rights reserved.</div>
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      <span className="relative inline-block cursor-pointer hover:underline">eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span></span>
      <span className="cursor-pointer hover:underline">Support</span>
      <span className="cursor-pointer hover:underline">Privacy Policy</span>
      <span className="cursor-pointer hover:underline">Terms of Service</span>
      <span className="cursor-pointer hover:underline">Ijoema ltd</span>
    </div>
  </footer>
);

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE MANAGEMENT PAGE
// ─────────────────────────────────────────────────────────────────────────────
const ServiceManagement = () => {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [viewMode,      setViewMode]      = useState("grid");
  const [search,        setSearch]        = useState("");
  const [sortBy,        setSortBy]        = useState("newest");
  const [services,      setServices]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshKey,    setRefreshKey]    = useState(0);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingService,setEditingService]= useState(null); // null = create, obj = edit
  const [deleteTarget,  setDeleteTarget]  = useState(null); // service to delete
  const [isDeleting,    setIsDeleting]    = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  // ── Fetch services
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getServices();
        const raw = Array.isArray(data) ? data : (data.results || data.listings || data.data || []);
        setServices(raw.map(item => ({
          id:       item.id,
          category: (item.business_category || '').toUpperCase(),
          title:    item.title       || '—',
          desc:     item.description || '',
          price:    item.price       || '0',
          unit:     item.price_unit  || 'session',
          duration: item.detail?.duration
                    || item.detail?.flight_duration
                    || (item.detail?.duration_days ? `${item.detail.duration_days} days` : 'N/A'),
          avail:    item.availability || 'Available',
          status:   item.status       || 'draft',
          mode:     item.detail?.delivery_mode
                    || (item.detail?.available_24h ? 'remote' : 'in-person'),
          img:      item.images?.find(i => i.is_primary)?.image
                    || item.images?.[0]?.image || null,
          // keep raw for edit pre-fill
          _raw: item,
        })));
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshKey]);

  // ── Modal helpers
  const openCreate = () => { setEditingService(null); setIsModalOpen(true); };
  const openEdit   = (s)  => { setEditingService(s._raw); setIsModalOpen(true); };

  const handleFormClose = (didSave) => {
    setIsModalOpen(false);
    setEditingService(null);
    if (didSave === true) setRefreshKey(k => k + 1);
  };

  // ── Delete helpers
  const handleDeleteRequest = (s)  => { setDeleteTarget(s); setDeleteError(''); };
  const handleDeleteCancel  = ()   => { setDeleteTarget(null); };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteListing(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(s =>
      s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [services, search]);

  const sorted = useMemo(() => {
    const r = [...filtered];
    if (sortBy === 'price_asc')  r.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === 'price_desc') r.sort((a,b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortBy === 'newest')     r.sort((a,b) => String(b.id).localeCompare(String(a.id)));
    if (sortBy === 'oldest')     r.sort((a,b) => String(a.id).localeCompare(String(b.id)));
    return r;
  }, [filtered, sortBy]);

  // ── Stats
  const stats = useMemo(() => [
    { label:"Total Services",  value:services.length.toString(), icon:<Briefcase size={18}/>, color:"teal" },
    { label:"Active Now",      value:services.filter(s=>s.status==='published'||s.status==='active').length.toString(), icon:<CheckCircle size={18}/>, color:"green" },
    { label:"Draft",           value:services.filter(s=>s.status==='draft').length.toString(), icon:<Calendar size={18}/>, color:"amber" },
    { label:"Categories",      value:[...new Set(services.map(s=>s.category))].length.toString(), icon:<Star size={18}/>, color:"purple" },
  ], [services]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-800">

      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}/>
          <div className="absolute left-0 top-0 h-full w-56">
            <VendorSidebar activePage="services"/>
          </div>
        </div>
      )}

      
      <div className="flex pt-14 h-screen overflow-hidden gap-3 pl-3 pb-3">

        {/* Sidebar — desktop only, flush to navbar with no top gap */}
        <div className="hidden md:block shrink-0">
          <VendorSidebar activePage="services"/>
        </div>

        {/* Main scrollable column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-3">

          <main className="flex-1 p-4 sm:p-5 max-w-[1400px] mx-auto w-full pb-16">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">Service Management</h2>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Manage your professional offerings, schedules, and service availability.
                </p>
              </div>
              <button onClick={openCreate}
                className="bg-[#F5B841] hover:bg-[#E0A83B] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold text-sm shrink-0 w-full sm:w-auto justify-center">
                <Plus size={18}/> Create New Service
              </button>
            </div>

            {/* Search + filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Filter by title, category, or keyword..."
                  className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#F5B841] focus:ring-1 focus:ring-[#F5B841] transition-colors"/>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                <button className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors">
                  <SlidersHorizontal size={15}/> <span className="hidden sm:inline">Advanced</span> Filters
                </button>
                {/* View toggle — amber active to match Create button */}
                <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode("grid")}
                    className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode==="grid" ? "bg-[#F5B841] text-white" : "text-slate-400 hover:text-slate-600"}`}>
                    <LayoutGrid size={15}/>
                  </button>
                  <button onClick={() => setViewMode("list")}
                    className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode==="list" ? "bg-[#F5B841] text-white" : "text-slate-400 hover:text-slate-600"}`}>
                    <List size={15}/>
                  </button>
                </div>
                <div className="relative">
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                    className="h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:border-[#F5B841] appearance-none cursor-pointer">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                </div>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {stats.map((s,i) => {
                const c = colorMap[s.color];
                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-sm">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}>{s.icon}</div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-0.5">{s.label}</p>
                      <p className={`text-[20px] sm:text-[22px] font-black leading-none ${c.val}`}>{loading ? '—' : s.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DELETE ERROR BANNER */}
            {deleteError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
                <AlertTriangle size={13}/> {deleteError}
                <button onClick={() => setDeleteError('')} className="ml-auto"><X size={12}/></button>
              </div>
            )}

            {/* SERVICES GRID / LIST */}
            {loading ? (
              <div className={`grid gap-4 ${viewMode==="grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="h-44 bg-slate-100"/>
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-slate-100 rounded w-1/3"/>
                      <div className="h-4 bg-slate-100 rounded w-3/4"/>
                      <div className="h-3 bg-slate-100 rounded w-full"/>
                      <div className="h-3 bg-slate-100 rounded w-2/3"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 sm:p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-4 text-teal-600">
                  <Briefcase size={32}/>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Services Found</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
                  {search ? 'Try a different search term.' : 'Click "Create New Service" to add your first listing.'}
                </p>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode==="grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {sorted.map(s => (
                  <ServiceCard key={s.id} s={s}
                    onEdit={openEdit}
                    onDelete={handleDeleteRequest}/>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && services.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing <b>{sorted.length}</b> of <b>{services.length}</b> services
                </p>
                <div className="flex items-center gap-1">
                  <button className="h-9 px-3 sm:px-4 border border-slate-200 rounded-lg text-sm text-slate-500 hover:border-[#F5B841] hover:text-teal-700 transition-colors font-medium">Previous</button>
                  <button className="w-9 h-9 rounded-lg text-sm font-bold bg-[#125852] text-white">1</button>
                  <button className="h-9 px-3 sm:px-4 bg-[#125852] text-white rounded-lg text-sm font-bold hover:bg-[#0e4440] transition-colors">Next</button>
                </div>
              </div>
            )}

          </main>

          <TealFooter/>
        </div>
      </div>

      {/*
        ── SERVICE FORM MODAL ──
        max-w-xl (slightly smaller than 2xl for better proportions).
        max-h-[88vh] — no fixed height, form fills naturally.
        editingService passed to ServiceForm for pre-fill in edit mode.
      */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) handleFormClose(false); }}
        >
          <div className="w-full max-w-xl max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <ServiceForm onClose={handleFormClose} editingListing={editingService}/>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <DeleteModal
          service={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}

    </div>
  );
};

export default ServiceManagement;