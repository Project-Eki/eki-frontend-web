/**
 * 1. IMAGES FIXED
 *    The backend returns relative URLs like "/media/listings/images/2026/04/pants.jpg".
 *    MEDIA_BASE is now derived from api.defaults.baseURL so it automatically
 *    works on both localhost and DigitalOcean without any manual changes.
 *    api.defaults.baseURL = "http://127.0.0.1:8000/api/v1"
 *    → MEDIA_BASE = "http://127.0.0.1:8000"
 *    → image URL = "http://127.0.0.1:8000/media/listings/images/2026/04/pants.jpg"
 *
 * 2. CURRENCY FROM currency.js
 *    Now imports getCurrencySymbol from src/utils/currency.js .
 *    Falls back to fetching /accounts/register-vendor/ if /vendor/profile/ has no country.
 */

import React, { useState, useEffect, useMemo } from "react";
import { getServices, deleteListing } from "../services/api";
import api from "../services/api";
import VendorSidebar from "../components/VendorSidebar";
import Navbar4 from "../components/adminDashboard/Navbar4";
import ServiceForm from "../components/Vendormanagement/ServiceForm";

//Import currency utility 
// If the import fails (file not found), the fallback function below is used.
let getCurrencySymbol;
try {
  getCurrencySymbol = require('../utils/currency').getCurrencySymbol;
  // If  mfile uses a default export, use this instead:
  // getCurrencySymbol = require('../utils/currency').default;
} catch (_) {
  // Fallback if currency.js doesn't exist or has a different export name
  getCurrencySymbol = (country) => {
    if (!country) return 'UGX'; // Default to UGX since this is a Uganda-based platform
    const map = {
      'uganda': 'UGX', 'kenya': 'KES', 'tanzania': 'TZS',
      'rwanda': 'RWF', 'ethiopia': 'ETB', 'nigeria': '₦',
      'ghana': '₵', 'south africa': 'R', 'zambia': 'ZMW',
      'egypt': 'EGP', 'morocco': 'MAD', 'united states': '$', 'usa': '$',
      'united kingdom': '£', 'uk': '£', 'germany': '€', 'france': '€',
      'india': '₹', 'china': '¥', 'japan': '¥',
      'united arab emirates': 'AED', 'uae': 'AED',
      'saudi arabia': 'SAR', 'australia': 'A$', 'canada': 'CA$',
    };
    return map[country.toLowerCase().trim()] || 'UGX';
  };
}

import {
  Plus, X, Briefcase, LayoutGrid, List,
  Clock, Calendar, CheckCircle, ChevronDown,
  Search, SlidersHorizontal, Globe, MapPin, Package,
  Pencil, Trash2, AlertTriangle, Loader2, Archive, FileText,
} from 'lucide-react';


// MEDIA_BASE
// Derived automatically from the axios instance baseURL.
// When you change baseURL in api.js, images update automatically.
//
// Example on localhost:
//   api.defaults.baseURL = "http://127.0.0.1:8000/api/v1"
//   → MEDIA_BASE = "http://127.0.0.1:8000"
//
// Example on DigitalOcean:
//   api.defaults.baseURL = "http://134.122.22.45/api/v1"
//   → MEDIA_BASE = "http://134.122.22.45"
const MEDIA_BASE = (api.defaults.baseURL || 'http://127.0.0.1:8000')
  .replace('/api/v1', '')
  .replace(/\/$/, '');

// Converts a backend image path to a full URL the browser can load.
// "/media/listings/img.jpg" → "http://127.0.0.1:8000/media/listings/img.jpg"
const resolveImage = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url; // already absolute
  return `${MEDIA_BASE}${url}`;            // prepend server base
};

// STATUS BADGE STYLES
const STATUS_STYLE = {
  published: "bg-green-50 text-green-700 border border-green-200",
  active:    "bg-green-50 text-green-700 border border-green-200",
  draft:     "bg-amber-50 text-amber-700 border border-amber-200",
  archived:  "bg-gray-100 text-gray-500 border border-gray-200",
};


// SERVICE CARD
const ServiceCard = ({ s, onEdit, onDelete, currencySymbol }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="relative h-44 overflow-hidden bg-slate-50">

      {/* Image — only rendered if s.img is truthy */}
      {s.img && (
        <img
          src={s.img}
          alt={s.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            // If image fails to load (network error, wrong URL), hide it
            // and show the fallback div
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement.querySelector('.img-fallback');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      )}

      {/* Fallback — shown when no image or image load fails */}
      <div
        className="img-fallback w-full h-full flex flex-col items-center justify-center gap-1"
        style={{ display: s.img ? 'none' : 'flex' }}
      >
        <Package size={28} className="text-slate-300"/>
        <span className="text-[10px] text-slate-300">No image</span>
      </div>

      {/* Remote / In-person badge */}
      <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        {s.mode === "remote" || s.mode === "online"
          ? <><Globe size={9}/> Remote</>
          : <><MapPin size={9}/> In-person</>}
      </span>

      {/* Edit + Delete — hover reveal */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(s)}
          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-[#125852] transition-colors"
          title="Edit">
          <Pencil size={12}/>
        </button>
        <button onClick={() => onDelete(s)}
          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-red-500 transition-colors"
          title="Delete">
          <Trash2 size={12}/>
        </button>
      </div>
    </div>

    <div className="p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest truncate max-w-[120px]">{s.category}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_STYLE[s.status] || STATUS_STYLE.draft}`}>
          {s.status}
        </span>
      </div>
      <h3 className="font-black text-[15px] text-slate-900 leading-tight mb-1 line-clamp-1">{s.title || '—'}</h3>
      <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">{s.desc || 'No description provided.'}</p>
      <div className="flex items-center justify-between text-[12px] text-slate-400 mb-3">
        <span className="flex items-center gap-1"><Clock size={12}/> {s.duration || 'N/A'}</span>
        <span className="flex items-center gap-1 font-semibold"><Calendar size={12}/> {s.avail || 'Available'}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div>
          <span className="text-[18px] font-black text-slate-900">
            {currencySymbol} {parseFloat(s.price || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">/{s.unit || 'session'}</span>
        </div>
        <button onClick={() => onEdit(s)}
          className="text-[12px] font-bold text-teal-700 hover:text-amber-500 transition-colors">
          Edit 
        </button>
      </div>
    </div>
  </div>
);


// DELETE CONFIRM MODAL

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
          className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 flex items-center justify-center gap-1.5">
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


// MAIN COMPONENT

const ServiceManagement = () => {

  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [viewMode,       setViewMode]       = useState("grid");
  const [search,         setSearch]         = useState("");
  const [sortBy,         setSortBy]         = useState("newest");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [services,       setServices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshKey,     setRefreshKey]     = useState(0);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [isDeleting,     setIsDeleting]     = useState(false);
  const [deleteError,    setDeleteError]    = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('UGX');
  const [vendorCountry,  setVendorCountry]  = useState('');

  // ── Fetch vendor country for currency ──────────────────────────────────────
  // The API response for listings does NOT include the vendor's country.
  // We must fetch the vendor profile separately.
  //
  // We check /accounts/register-vendor/ because that's where the country
  // is stored during onboarding (via completeVendorOnboarding in api.js).
  // The /accounts/vendor/profile/ endpoint may or may not include it.
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        // Primary: check vendor profile endpoint
        const res = await api.get('/accounts/vendor/profile/');
        const d = res.data?.data ?? res.data;

        // Log full response so you can find the exact field name
        console.log('[Currency DEBUG] /vendor/profile/ response:', d);

        const country =
          d?.country           ||  // most common field name
          d?.business_country  ||  // alternative from onboarding model
          d?.vendor_country    ||
          d?.location          ||  // some backends use location as country
          '';

        if (country) {
          setVendorCountry(country);
          setCurrencySymbol(getCurrencySymbol(country));
          return;
        }

        // Fallback: the register-vendor endpoint (full onboarding data)
        const res2 = await api.get('/accounts/register-vendor/');
        const d2 = res2.data?.data ?? res2.data;

        console.log('[Currency DEBUG] /register-vendor/ response:', d2);

        const country2 =
          d2?.country          ||
          d2?.business_country ||
          '';

        if (country2) {
          setVendorCountry(country2);
          setCurrencySymbol(getCurrencySymbol(country2));
        }
        // If still not found, UGX is kept as default (better than $ for this platform)
      } catch (err) {
        console.warn('[Currency] fetch failed:', err.message);
        // Keep UGX as sensible default for this platform
      }
    };
    loadCurrency();
  }, []);

  // ── Fetch services ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMyServices = async () => {
      setLoading(true);
      try {
        const response = await getServices();
        // Backend wraps response as: { success: true, data: [...], message: "" }
        // So we read response.data, not the full axios response
        const raw = Array.isArray(response)
          ? response
          : (response.data || response.results || response.listings || []);

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
          // resolveImage turns "/media/listings/img.jpg"
          // into "http://127.0.0.1:8000/media/listings/img.jpg"
          img: resolveImage(
            item.images?.find(i => i.is_primary)?.image
            || item.images?.[0]?.image
            || null
          ),
          _raw: item,
        })));
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyServices();
  }, [refreshKey]);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const openCreate = () => { setEditingService(null); setIsModalOpen(true); };
  const openEdit   = (s) => { setEditingService(s._raw); setIsModalOpen(true); };

  const handleFormClose = (didSave) => {
    // This function ONLY closes the modal and optionally refreshes.
    // It does NOT navigate anywhere. If you are being redirected to /products
    // after saving, the issue is in your App.jsx router — check that
    // /services and /products don't share the same component or layout wrapper
    // that navigates on state change.
    setIsModalOpen(false);
    setEditingService(null);
    if (didSave === true) setRefreshKey(k => k + 1);
  };

  // ── Delete helpers ──────────────────────────────────────────────────────────
  const handleDeleteRequest = (s)  => { setDeleteTarget(s); setDeleteError(''); };
  const handleDeleteCancel  = ()   => setDeleteTarget(null);
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

  // ── Counts for stat tabs ────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:       services.length,
    published: services.filter(s => s.status === 'published' || s.status === 'active').length,
    draft:     services.filter(s => s.status === 'draft').length,
    archived:  services.filter(s => s.status === 'archived').length,
  }), [services]);

  // ── 4 stat tabs (paused removed) ───────────────────────────────────────────
  const statTabs = [
    { key:'all',       label:'All Services', icon:<Briefcase size={16}/>,  color:'teal',  hint:'Every service you have created' },
    { key:'published', label:'Published',    icon:<CheckCircle size={16}/>, color:'green', hint:'Live and visible to buyers' },
    { key:'draft',     label:'Draft',        icon:<FileText size={16}/>,   color:'amber', hint:'Saved but not yet published' },
    { key:'archived',  label:'Archived',     icon:<Archive size={16}/>,    color:'slate', hint:'Hidden from buyers, kept for records' },
  ];

  const colorMap = {
    teal:  { bg:'bg-teal-50',  icon:'text-teal-600',  val:'text-teal-700',  active:'border-b-teal-500'  },
    green: { bg:'bg-green-50', icon:'text-green-600', val:'text-green-700', active:'border-b-green-500' },
    amber: { bg:'bg-amber-50', icon:'text-amber-600', val:'text-amber-700', active:'border-b-amber-500' },
    slate: { bg:'bg-slate-100',icon:'text-slate-500', val:'text-slate-600', active:'border-b-slate-500' },
  };

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = services;
    if (statusFilter !== 'all') {
      list = list.filter(s =>
        statusFilter === 'published'
          ? (s.status === 'published' || s.status === 'active')
          : s.status === statusFilter
      );
    }
    const q = search.toLowerCase().trim();
    if (q) list = list.filter(s =>
      s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
    return list;
  }, [services, search, statusFilter]);

  const sorted = useMemo(() => {
    const r = [...filtered];
    if (sortBy === 'price_asc')  r.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === 'price_desc') r.sort((a,b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortBy === 'newest')     r.sort((a,b) => String(b.id).localeCompare(String(a.id)));
    if (sortBy === 'oldest')     r.sort((a,b) => String(a.id).localeCompare(String(b.id)));
    return r;
  }, [filtered, sortBy]);

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">

      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <VendorSidebar activePage="services"/>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}/>
          <div className="absolute left-0 top-0 h-full w-56 p-3">
            <VendorSidebar activePage="services"/>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar4 onMenuClick={() => setSidebarOpen(true)}/>

        <main className="flex-1 p-4 sm:p-5 max-w-[1400px] mx-auto w-full pb-16">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Service Management</h2>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Manage your professional offerings and service availability.
                {vendorCountry && (
                  <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-500 text-[9px]">
                    {vendorCountry} · {currencySymbol}
                  </span>
                )}
              </p>
            </div>
            <button onClick={openCreate}
              className="bg-[#F5B841] hover:bg-[#E0A83B] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold text-sm shrink-0 w-full sm:w-auto justify-center">
              <Plus size={18}/> Create New Service
            </button>
          </div>

          {/* 4 interactive stat tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {statTabs.map(tab => {
              const c = colorMap[tab.color];
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(isActive ? 'all' : tab.key)}
                  title={tab.hint}
                  className={`bg-white rounded-2xl border px-4 py-3.5 flex items-center gap-3 shadow-sm
                    transition-all text-left w-full cursor-pointer
                    ${isActive
                      ? `border-b-2 ${c.active} border-t-slate-200 border-l-slate-200 border-r-slate-200 shadow-md`
                      : 'border-slate-200 hover:border-slate-300 hover:shadow'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}>
                    {tab.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-0.5 truncate">{tab.label}</p>
                    <p className={`text-[20px] font-black leading-none ${isActive ? c.val : 'text-slate-800'}`}>
                      {loading ? '—' : counts[tab.key]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active filter badge */}
          {statusFilter !== 'all' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] text-slate-500">
                Showing: <span className="font-bold text-slate-700 capitalize">{statusFilter}</span> services
              </span>
              <button onClick={() => setStatusFilter('all')}
                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 border border-slate-200 rounded-full px-2 py-0.5">
                <X size={9}/> Clear
              </button>
            </div>
          )}

          {/* Search + sort toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Filter by title or category..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#F5B841] focus:ring-1 focus:ring-[#F5B841]"/>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <button className="flex items-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">
                <SlidersHorizontal size={15}/> <span className="hidden sm:inline">Advanced</span> Filters
              </button>
              <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode("grid")}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode==="grid" ? "bg-[#F5B841] text-white" : "text-slate-400"}`}>
                  <LayoutGrid size={15}/>
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`w-10 h-10 flex items-center justify-center transition-colors ${viewMode==="list" ? "bg-[#F5B841] text-white" : "text-slate-400"}`}>
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

          {/* Delete error */}
          {deleteError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
              <AlertTriangle size={13}/> {deleteError}
              <button onClick={() => setDeleteError('')} className="ml-auto"><X size={12}/></button>
            </div>
          )}

          {/* Service grid */}
          {loading ? (
            <div className={`grid gap-4 ${viewMode==="grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-44 bg-slate-100"/>
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-1/3"/>
                    <div className="h-4 bg-slate-100 rounded w-3/4"/>
                    <div className="h-3 bg-slate-100 rounded w-full"/>
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 sm:p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-4 text-teal-600">
                <Briefcase size={32}/>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {statusFilter !== 'all' ? `No ${statusFilter} services` : 'No Services Found'}
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
                {search ? 'Try a different search term.'
                  : statusFilter !== 'all' ? `You have no ${statusFilter} services yet.`
                  : 'Click "Create New Service" to add your first listing.'}
              </p>
              {statusFilter !== 'all' && (
                <button onClick={() => setStatusFilter('all')}
                  className="mt-4 text-sm font-bold text-teal-700 hover:underline">
                  View all services
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode==="grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {sorted.map(s => (
                <ServiceCard
                  key={s.id}
                  s={s}
                  onEdit={openEdit}
                  onDelete={handleDeleteRequest}
                  currencySymbol={currencySymbol}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && services.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing <b>{sorted.length}</b> of <b>{services.length}</b> services
              </p>
              <div className="flex items-center gap-1">
                <button className="h-9 px-4 border border-slate-200 rounded-lg text-sm text-slate-500 hover:border-[#F5B841] font-medium">Previous</button>
                <button className="w-9 h-9 rounded-lg text-sm font-bold bg-[#EFB034FF] text-white">1</button>
                <button className="h-9 px-4 bg-[#EFB034FF] text-white rounded-lg text-sm font-bold hover:bg-[#F5B841]">Next</button>
              </div>
            </div>
          )}

        </main>

        <TealFooter/>
      </div>

      {/* Service form modal */}
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

      {/* Delete confirm modal */}
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