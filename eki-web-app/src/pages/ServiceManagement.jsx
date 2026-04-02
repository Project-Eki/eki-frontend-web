/**
 *   Django stores uploaded images at a path like:
 *     /media/listings/images/2026/03/filename.jpg
 *   When Django's ListingImage serializer serializes the `image` field, it
 *   returns EITHER:
 *     a) A full URL:   "http://127.0.0.1:8000/media/listings/..."
 *        (when MEDIA_URL + DEFAULT_FILE_STORAGE is set to return full URLs)
 *     b) A relative path: "/media/listings/..."
 *        (when using the default FileSystemStorage without SITE_URL configured)
 *
 *   On localhost, case (a) works fine — the browser can reach 127.0.0.1:8000.
 *   On DigitalOcean, case (a) FAILS — the browser cannot reach 127.0.0.1:8000
 *   from the internet. The image tries to load from your laptop, not the server.
 *
 * THE FIX:
 *   Read MEDIA_BASE from the same variable as the axios API baseURL.
 *   This way, when you change api.js from localhost to your DigitalOcean URL,
 *   the image URL automatically updates too — you only change ONE place.
 *
 *   The axios instance is imported from api.js and exposes `api.defaults.baseURL`.
 *   We strip the "/api/v1" suffix from it to get the server root.
 *   Examples:
 *     baseURL = "http://127.0.0.1:8000/api/v1"
 *     → MEDIA_BASE = "http://127.0.0.1:8000"
 *
 *     baseURL = "http://134.122.22.45/api/v1"
 *     → MEDIA_BASE = "http://134.122.22.45"
 */

import React, { useState, useEffect, useMemo } from "react";
import { getServices, deleteListing } from "../services/api";

// ── IMPORTANT: we import the axios instance itself so we can read its baseURL ──
// api.defaults.baseURL gives us "http://127.0.0.1:8000/api/v1" (localhost) or
// "http://134.122.22.45/api/v1" (DigitalOcean) — whatever is set in api.js.
// We never hardcode the server URL here.
import api from "../services/api";

import VendorSidebar from "../components/VendorSidebar";
import Navbar4 from "../components/adminDashboard/Navbar4";
import ServiceForm from "../components/Vendormanagement/ServiceForm";

import {
  Plus, X, Briefcase, LayoutGrid, List,
  Clock, Calendar, CheckCircle, ChevronDown,
  Search, SlidersHorizontal, Globe, MapPin, Package,
  Pencil, Trash2, AlertTriangle, Loader2, Archive,
  PauseCircle, FileText,
} from 'lucide-react';

// 
// MEDIA_BASE — derived from the axios baseURL so it never needs manual updates.
//
// How this works step by step:
//   1. api.defaults.baseURL = "http://127.0.0.1:8000/api/v1"
//   2. We call .replace('/api/v1', '') to strip the API path:
//      → "http://127.0.0.1:8000"
//   3. .replace(/\/$/, '') removes any trailing slash for safety:
//      → "http://127.0.0.1:8000"
//
// On DigitalOcean, if api.js has:
//   baseURL: "http://134.122.22.45/api/v1"
// Then MEDIA_BASE automatically becomes:
//   "http://134.122.22.45"
// And images resolve to:
//   "http://134.122.22.45/media/listings/images/..."
// 
const MEDIA_BASE = (api.defaults.baseURL || '')
  .replace('/api/v1', '')   // strip the API path suffix
  .replace(/\/$/, '');       // strip trailing slash if any

// resolveImage takes a URL string from the backend and turns it into something
// the browser can load.
//
// Case A: url is null/undefined → return null (no image)
// Case B: url starts with 'http' → it's already absolute, use as-is
//   Example: "http://134.122.22.45/media/listings/img.jpg" → unchanged
// Case C: url starts with '/' → it's a relative path from the server root
//   Example: "/media/listings/2026/03/img.jpg"
//   → becomes: "http://134.122.22.45/media/listings/2026/03/img.jpg"
const resolveImage = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
};

// 
// CURRENCY MAP
//
// This function takes a country name (as a string) and returns the correct
// currency symbol. We use .toLowerCase() so "Uganda" and "uganda" both match.
// The fallback is '$' when the country isn't in the map.
//
// WHY IT SHOWED $ BEFORE:
//   The vendor profile API was returning a country name, but the code was
//   looking at the wrong field name. We now check all possible field names:
// ───────────────────────────────────────────────────────────────────────────
const getCurrencySymbol = (country) => {
  if (!country) return '$';
  const map = {
    // East Africa (most common for this platform)
    'uganda': 'UGX', 'kenya': 'KES', 'tanzania': 'TZS',
    'rwanda': 'RWF', 'ethiopia': 'ETB', 'burundi': 'BIF',
    'south sudan': 'SSP', 'somalia': 'SOS', 'djibouti': 'DJF',
    // West Africa
    'nigeria': '₦', 'ghana': '₵', 'senegal': 'CFA',
    'cameroon': 'CFA', 'ivory coast': 'CFA', "côte d'ivoire": 'CFA',
    'mali': 'CFA', 'burkina faso': 'CFA', 'niger': 'CFA',
    // Southern Africa
    'south africa': 'R', 'zambia': 'ZMW', 'zimbabwe': 'ZWL',
    'botswana': 'BWP', 'namibia': 'NAD', 'malawi': 'MWK',
    'mozambique': 'MZN', 'angola': 'AOA',
    // North Africa
    'egypt': 'EGP', 'morocco': 'MAD', 'tunisia': 'TND',
    'libya': 'LYD', 'algeria': 'DZD', 'sudan': 'SDG',
    // Americas
    'united states': '$', 'usa': '$', 'canada': 'CA$',
    'mexico': 'MX$', 'brazil': 'R$', 'argentina': '$',
    'colombia': '$', 'chile': 'CLP', 'peru': 'S/',
    'venezuela': 'Bs', 'uruguay': '$U', 'ecuador': '$',
    // Europe
    'united kingdom': '£', 'uk': '£', 'germany': '€',
    'france': '€', 'italy': '€', 'spain': '€', 'portugal': '€',
    'netherlands': '€', 'belgium': '€', 'austria': '€',
    'switzerland': 'CHF', 'sweden': 'kr', 'norway': 'kr',
    'denmark': 'kr', 'finland': '€', 'poland': 'zł',
    'czechia': 'Kč', 'hungary': 'Ft', 'romania': 'lei',
    'russia': '₽', 'ukraine': '₴', 'turkey': '₺',
    // Asia
    'china': '¥', 'japan': '¥', 'india': '₹',
    'south korea': '₩', 'indonesia': 'Rp', 'malaysia': 'RM',
    'thailand': '฿', 'singapore': 'S$', 'philippines': '₱',
    'vietnam': '₫', 'bangladesh': '৳', 'pakistan': '₨',
    'sri lanka': '₨', 'nepal': '₨', 'myanmar': 'K',
    // Middle East
    'saudi arabia': 'SAR', 'united arab emirates': 'AED', 'uae': 'AED',
    'qatar': 'QAR', 'kuwait': 'KWD', 'bahrain': 'BHD',
    'jordan': 'JOD', 'israel': '₪', 'iran': 'IRR', 'iraq': 'IQD',
    // Pacific
    'australia': 'A$', 'new zealand': 'NZ$',
  };
  return map[country.toLowerCase().trim()] || '$';
};

// STATUS STYLES
// These control the badge color on each service card.
const STATUS_STYLE = {
  published: "bg-green-50 text-green-700 border border-green-200",
  active:    "bg-green-50 text-green-700 border border-green-200",
  draft:     "bg-amber-50 text-amber-700 border border-amber-200",
  archived:  "bg-gray-100 text-gray-500 border border-gray-200",
  paused:    "bg-blue-50 text-blue-600 border border-blue-200",
};

// SERVICE CARD
// Displays one service. Shows the image (with fallback), status badge,
// title, description, duration, availability, and price in the vendor's currency.
// Edit + Delete buttons appear on hover (opacity-0 → opacity-100).

const ServiceCard = ({ s, onEdit, onDelete, currencySymbol }) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="relative h-44 overflow-hidden bg-slate-50">

      {/* IMAGE:
          s.img is the result of resolveImage() — already an absolute URL.
          onError: if the image fails to load (wrong URL, server down, etc.)
          we hide the img tag and show the fallback div below it.
          The nextSibling is the fallback div immediately after the img tag. */}
      {s.img ? (
        <img src={s.img} alt={s.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            e.target.style.display = 'none';        // hide broken image
            e.target.nextSibling.style.display = 'flex'; // show fallback
          }}
        />
      ) : null}

      {/* FALLBACK: shown when there is no image OR when the image fails to load.
          `display: s.img ? 'none' : 'flex'` — start hidden if we have an img src,
          start visible if we have no src at all. */}
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-1"
        style={{ display: s.img ? 'none' : 'flex' }}
      >
        <Package size={28} className="text-slate-300"/>
        <span className="text-[10px] text-slate-300">No image</span>
      </div>

      {/* Remote/in-person badge — top left */}
      <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        {s.mode === "remote" || s.mode === "online"
          ? <><Globe size={9}/> Remote</>
          : <><MapPin size={9}/> In-person</>}
      </span>

      {/* Edit + Delete buttons — top right, visible only on hover */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(s)}
          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-[#125852] transition-colors"
          title="Edit this service">
          <Pencil size={12}/>
        </button>
        <button onClick={() => onDelete(s)}
          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-slate-600 hover:text-red-500 transition-colors"
          title="Delete this service">
          <Trash2 size={12}/>
        </button>
      </div>
    </div>

    <div className="p-4">
      <div className="flex items-center justify-between mb-1.5">
        {/* Category label — e.g. "TAILORING", "HOTELS" */}
        <span className="text-[10px] font-bold text-slate-400 tracking-widest truncate max-w-[120px]">
          {s.category}
        </span>
        {/* Status badge — color determined by STATUS_STYLE above */}
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
          {/* CURRENCY-AWARE PRICE:
              currencySymbol comes from the vendor's country (fetched on mount).
              For Uganda: "UGX 20,000/session"
              For Kenya:  "KES 5,000/session"
              For UK:     "£ 150/session"
              parseFloat converts the string "20000" to a number for .toLocaleString() */}
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

// 
// DELETE CONFIRMATION MODAL
// Shows before actually deleting to prevent accidental deletions.
// isDeleting controls the loading state while the API call is in progress.
// 
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

// 
// TEAL FOOTER — matches the brand colors
// 
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

// 
// MAIN PAGE COMPONENT
// 
const ServiceManagement = () => {

  //  UI state 
  const [sidebarOpen,    setSidebarOpen]    = useState(false);   // mobile sidebar toggle
  const [viewMode,       setViewMode]       = useState("grid");  // "grid" or "list"
  const [search,         setSearch]         = useState("");      // text search filter
  const [sortBy,         setSortBy]         = useState("newest");
  const [statusFilter,   setStatusFilter]   = useState("all");  // which stat tab is active

  //Data state 
  const [services,       setServices]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshKey,     setRefreshKey]     = useState(0);       // increment to re-fetch

  // Modal state 
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editingService, setEditingService] = useState(null);    // null = create mode

  //Delete state
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [isDeleting,     setIsDeleting]     = useState(false);
  const [deleteError,    setDeleteError]    = useState('');

  // Currency state 
  // Starts as '$' — updated once the vendor profile loads.
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [vendorCountry,  setVendorCountry]  = useState('');

  // FETCH VENDOR COUNTRY FOR CURRENCY 
  // This runs once when the component mounts.
  // We try GET /accounts/vendor/profile/ first because it's the standard endpoint.
  // The country field may be named differently depending on your backend version,
  // so we check all possible names.
  //
  // If the profile endpoint doesn't have the country, we fall back to
  // GET /accounts/register-vendor/ which has the full onboarding data.
  //
  // Why this was failing before:
  //   - The code only checked `d?.country`
  //   - But the VendorProfile model stores it as `business_country` or `country`
  //     depending on which endpoint you hit
  //   - When the field was missing, country = '' and getCurrencySymbol('') returned '$'
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        // Try the vendor profile endpoint first
        const res = await api.get('/accounts/vendor/profile/');
        const d = res.data?.data ?? res.data;

        // Check all possible field names for the country
        const country =
          d?.country ||           // plain "country" field
          d?.business_country ||  // "business_country" from onboarding
          d?.vendor_country ||    // alternative name
          '';

        if (country) {
          console.log('[Currency] Found country from /profile/:', country);
          setVendorCountry(country);
          setCurrencySymbol(getCurrencySymbol(country));
          return; // Found it — no need for fallback
        }

        // Fallback: try the onboarding endpoint which has the full profile data
        const res2 = await api.get('/accounts/register-vendor/');
        const d2 = res2.data?.data ?? res2.data;
        const country2 =
          d2?.country ||
          d2?.business_country ||
          '';

        if (country2) {
          console.log('[Currency] Found country from /register-vendor/:', country2);
          setVendorCountry(country2);
          setCurrencySymbol(getCurrencySymbol(country2));
        } else {
          // Could not find the country — this is a data issue on the backend.
          // Currency will stay as '$'. You can debug by checking:
          //   console.log('[Currency] full profile data:', d2)
          console.warn('[Currency] Country not found in vendor profile. Staying at $.');
        }
      } catch (err) {
        // Silent fail — currency stays at '$'
        console.warn('[Currency] Profile fetch failed:', err.message);
      }
    };

    loadCurrency();
  }, []); // Empty array = run once on mount

  // FETCH SERVICES 
  // Runs whenever refreshKey changes (incremented after create/edit/delete).
  // GET /listings/?listing_type=service
  useEffect(() => {
    const fetchMyServices = async () => {
      setLoading(true);
      try {
        const data = await getServices();

        // getServices() returns the full axios response data.
        // The backend wraps it as: { success: true, data: [...], message: "" }
        // So we try data.data first, then fall back to array-based formats.
        const raw = Array.isArray(data)
          ? data
          : (data.data || data.results || data.listings || []);

        setServices(raw.map(item => ({
          id:       item.id,
          // toUpperCase() so "tailoring" displays as "TAILORING" on the card
          category: (item.business_category || '').toUpperCase(),
          title:    item.title        || '—',
          desc:     item.description  || '',
          price:    item.price        || '0',
          unit:     item.price_unit   || 'session',
          // Duration comes from different places depending on service type:
          // - Professional: detail.duration (string like "60 min")
          // - Airline: detail.flight_duration (string like "2h 30min")
          // - Tailoring: detail.duration_days (number, we format it)
          // - Other: 'N/A'
          duration: item.detail?.duration
                    || item.detail?.flight_duration
                    || (item.detail?.duration_days ? `${item.detail.duration_days} days` : 'N/A'),
          avail:    item.availability || 'Available',
          status:   item.status       || 'draft',
          // Mode: prefer delivery_mode from detail, fall back to available_24h hint
          mode:     item.detail?.delivery_mode
                    || (item.detail?.available_24h ? 'remote' : 'in-person'),
          // IMAGE FIX: resolveImage() converts relative paths to absolute URLs.
          // Without this, "/media/listings/img.jpg" becomes a broken image on production.
          img: resolveImage(
            item.images?.find(i => i.is_primary)?.image  // prefer is_primary=true image
            || item.images?.[0]?.image                    // otherwise use first image
            || null                                        // null = show fallback
          ),
          // _raw: keep the original API object so we can pre-fill the edit form
          _raw: item,
        })));
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyServices();
  }, [refreshKey]); // Re-runs whenever refreshKey changes

  // MODAL HELPERS 
  const openCreate = () => {
    setEditingService(null);   // null = create mode (ServiceForm starts empty)
    setIsModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingService(s._raw); // Pass raw API object → ServiceForm pre-fills fields
    setIsModalOpen(true);
  };

  const handleFormClose = (didSave) => {
    setIsModalOpen(false);
    setEditingService(null);
    // didSave=true means a service was created or edited → refresh the grid
    if (didSave === true) setRefreshKey(k => k + 1);
  };

  // DELETE HELPERS 
  const handleDeleteRequest = (s) => {
    setDeleteTarget(s);  // Set which service to delete → shows confirm modal
    setDeleteError('');
  };

  const handleDeleteCancel = () => setDeleteTarget(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // DELETE /listings/{id}/
      await deleteListing(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshKey(k => k + 1); // Refresh the grid to remove the deleted card
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  //  COUNTS FOR STAT TABS
  // useMemo means this only recalculates when `services` changes, not on every render.
  // Each count is just a filter + length — very efficient.
  const counts = useMemo(() => ({
    all:       services.length,
    published: services.filter(s => s.status === 'published' || s.status === 'active').length,
    draft:     services.filter(s => s.status === 'draft').length,
    archived:  services.filter(s => s.status === 'archived').length,
    paused:    services.filter(s => s.status === 'paused').length,
  }), [services]);

  // STAT TAB DEFINITIONS 
  // Each tab has a key (matches the status value), a label, an icon, a color,
  // and a hint (shown as tooltip on hover — `title` attribute).
  const statTabs = [
    { key:'all',       label:'All Services', icon:<Briefcase size={16}/>,  color:'teal',  hint:'Every service you have created' },
    { key:'published', label:'Published',    icon:<CheckCircle size={16}/>, color:'green', hint:'Live — visible to buyers on the marketplace' },
    { key:'draft',     label:'Draft',        icon:<FileText size={16}/>,   color:'amber', hint:'Saved but not yet public — only you can see these' },
    { key:'archived',  label:'Archived',     icon:<Archive size={16}/>,    color:'slate', hint:'Hidden from buyers but kept in your records' },
    { key:'paused',    label:'Paused',       icon:<PauseCircle size={16}/>,color:'blue',  hint:'Temporarily unavailable — you paused bookings' },
  ];

  // Color class sets for the tabs — each color has background, icon, value, and active border
  const colorMap = {
    teal:  { bg:'bg-teal-50',  icon:'text-teal-600',  val:'text-teal-700',  active:'border-b-teal-500'  },
    green: { bg:'bg-green-50', icon:'text-green-600', val:'text-green-700', active:'border-b-green-500' },
    amber: { bg:'bg-amber-50', icon:'text-amber-600', val:'text-amber-700', active:'border-b-amber-500' },
    slate: { bg:'bg-slate-100',icon:'text-slate-500', val:'text-slate-600', active:'border-b-slate-500' },
    blue:  { bg:'bg-blue-50',  icon:'text-blue-600',  val:'text-blue-700',  active:'border-b-blue-500'  },
  };

  // FILTER + SORT 
  const filtered = useMemo(() => {
    let list = services;

    // Step 1: filter by status tab
    // 'all' → no filter
    // 'published' → match both 'published' AND 'active' (they mean the same thing)
    // anything else → exact match
    if (statusFilter !== 'all') {
      list = list.filter(s =>
        statusFilter === 'published'
          ? (s.status === 'published' || s.status === 'active')
          : s.status === statusFilter
      );
    }

    // Step 2: text search — case-insensitive, searches title and category
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [services, search, statusFilter]);

  // Sort the filtered results
  const sorted = useMemo(() => {
    const r = [...filtered];
    if (sortBy === 'price_asc')  r.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
    if (sortBy === 'price_desc') r.sort((a,b) => parseFloat(b.price) - parseFloat(a.price));
    if (sortBy === 'newest')     r.sort((a,b) => String(b.id).localeCompare(String(a.id)));
    if (sortBy === 'oldest')     r.sort((a,b) => String(a.id).localeCompare(String(b.id)));
    return r;
  }, [filtered, sortBy]);

  // RENDER
  return (
    // LAYOUT: same flex pattern as ProductDashboard
    // flex min-h-screen = sidebar + main column fill the screen height
    // p-3 gap-3 = 12px padding + 12px gap between sidebar and main
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">

      {/* ── DESKTOP SIDEBAR ──
          hidden on mobile (hidden md:block)
          On desktop: sidebar is first in the flex row → navbar starts after it */}
      <div className="hidden md:block shrink-0">
        <VendorSidebar activePage="services"/>
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ──
          fixed: covers the whole screen
          z-50: appears above all other content
          Only shown when sidebarOpen = true (triggered by hamburger in Navbar3) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Dark backdrop — tap to close */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}/>
          {/* Sidebar panel — slides in from left */}
          <div className="absolute left-0 top-0 h-full w-56 p-3">
            <VendorSidebar activePage="services"/>
          </div>
        </div>
      )}

      {/* ── MAIN COLUMN ──
          flex-1: takes all remaining width after the sidebar
          flex flex-col: stacks Navbar4 → main content → footer vertically
          min-w-0: prevents flex overflow issues with long text */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Navbar4 renders at the top of the main column.
            It uses sticky top-0 internally so it stays visible when scrolling.
            onMenuClick: called when the hamburger button inside Navbar4 is pressed */}
        <Navbar4 onMenuClick={() => setSidebarOpen(true)}/>

        {/* ── SCROLLABLE CONTENT ── */}
        <main className="flex-1 p-4 sm:p-5 max-w-[1400px] mx-auto w-full pb-16">

          {/* Page heading + Create button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Service Management</h2>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Manage your professional offerings, schedules, and service availability.
                {/* Show country + currency badge when loaded */}
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

          {/* ── INTERACTIVE STATUS TABS ──
              5 cards, one for each status. Clicking a card filters the grid below.
              The active tab gets a colored bottom border (border-b-2).
              Hovering shows a tooltip (title=) explaining what the status means.
              Clicking the already-active tab resets the filter to "all". */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
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
                      : 'border-slate-200 hover:border-slate-300 hover:shadow'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}>
                    {tab.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-0.5 truncate">
                      {tab.label}
                    </p>
                    <p className={`text-[20px] font-black leading-none ${isActive ? c.val : 'text-slate-800'}`}>
                      {loading ? '—' : counts[tab.key]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active filter indicator — shows what is currently being filtered */}
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

          {/* ── SEARCH + SORT + VIEW TOOLBAR ── */}
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
              {/* View toggle: grid/list. Active = amber (#F5B841) to match Create button */}
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

          {/* Delete error banner */}
          {deleteError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
              <AlertTriangle size={13}/> {deleteError}
              <button onClick={() => setDeleteError('')} className="ml-auto"><X size={12}/></button>
            </div>
          )}

          {/* ── SERVICE GRID ── */}
          {loading ? (
            // Skeleton loading cards — shown while fetching data
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
            // Empty state — shown when filter returns no results
            <div className="bg-white border border-slate-200 rounded-2xl p-16 sm:p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#E0F2F1] rounded-full flex items-center justify-center mb-4 text-teal-600">
                <Briefcase size={32}/>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {statusFilter !== 'all' ? `No ${statusFilter} services` : 'No Services Found'}
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">
                {search ? 'Try a different search term.'
                  : statusFilter !== 'all' ? `You have no services with status "${statusFilter}" yet.`
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
                  currencySymbol={currencySymbol}  // passes UGX, KES, etc.
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
                <button className="h-9 px-4 border border-slate-200 rounded-lg text-sm text-slate-500 hover:border-[#EFB034FF] font-medium">Previous</button>
                <button className="w-9 h-9 rounded-lg text-sm font-bold bg-[#EFB034FF] text-white">1</button>
                <button className="h-9 px-4 bg-[#EFB034FF] text-white rounded-lg text-sm font-bold hover:bg-[#F5B841]">Next</button>
              </div>
            </div>
          )}

        </main>

        <TealFooter/>
      </div>

      {/* ── SERVICE FORM MODAL ──
          max-h-[88vh]: limits height to 88% of viewport so it doesn't go off screen
          max-w-xl: keeps it readable, not too wide
          rounded-3xl overflow-hidden: rounded corners clip the ServiceForm inside */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) handleFormClose(false); }}
        >
          <div className="w-full max-w-xl max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* editingListing=null → create mode; editingListing=object → edit mode */}
            <ServiceForm onClose={handleFormClose} editingListing={editingService}/>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
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