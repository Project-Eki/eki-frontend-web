import React, { useState, useEffect, useRef, useCallback } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

import VendorSidebar from "../components/VendorSidebar";
import Navbar4 from "../components/adminDashboard/Navbar4";
import Footer from "../components/Footer"; // Added Footer import
import { getVendorBusinessSettings, updateVendorBusinessSettings } from "../services/api";

import {
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlinePhotograph,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineGlobeAlt,
} from "react-icons/hi";

// Constants
const GOLD = "#EFB034";
const TEAL = "#125852";

/**
 * DJANGO_BASE — the root URL of your Django server.
 */
const DJANGO_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/api\/v1\/?$/, "");
  return "http://127.0.0.1:8000";
})();

const resolveDocUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${DJANGO_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

const DOC_STATUS_CFG = {
  Verified: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: HiOutlineCheckCircle,
  },
  Missing: {
    color: "text-rose-400",
    bg: "bg-rose-50",
    border: "border-rose-100",
    icon: HiOutlineExclamationCircle,
  },
};

const getFileTypeBadge = (url) => {
  if (!url) return null;
  const ext = url.split("?")[0].split(".").pop().toUpperCase();
  return ["PDF", "JPG", "JPEG", "PNG", "WEBP"].includes(ext) ? ext : "FILE";
};

const Spinner = ({ size = 18, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    className="animate-spin" style={{ color }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
      strokeDasharray="31.4 31.4" strokeLinecap="round" />
  </svg>
);

const DocViewerModal = ({ url, label, onClose }) => {
  const [loaded, setLoaded] = useState(false);
  const absoluteUrl = resolveDocUrl(url); 
  const isPDF = absoluteUrl?.split("?")[0].toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <HiOutlineX size={17} className="text-slate-500" />
          </button>
        </div>
        {!loaded && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Spinner size={32} />
              <p className="text-xs text-slate-400">Loading document…</p>
            </div>
          </div>
        )}
        <div className={`flex-1 overflow-auto ${loaded ? "block" : "hidden"}`}>
          {isPDF ? (
            <iframe src={absoluteUrl} title={label}
              className="w-full h-[75vh]" onLoad={() => setLoaded(true)} />
          ) : (
            <img src={absoluteUrl} alt={label}
              className="w-full h-auto object-contain p-4" onLoad={() => setLoaded(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

const AddressAutocomplete = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);
  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchSuggestions = useCallback((q) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data); setOpen(data.length > 0);
      } catch { /* silent */ }
    }, 600);
  }, []);

  const handleChange = (e) => { const v = e.target.value; setQuery(v); onChange(v); fetchSuggestions(v); };

  return (
    <div ref={wrapRef} className="relative">
      <input value={query} onChange={handleChange} placeholder={placeholder || "Start typing an address…"}
        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 bg-white transition-all" />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.place_id}
              onClick={() => { setQuery(s.display_name); onChange(s.display_name); setOpen(false); }}
              className="px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 cursor-pointer border-b border-slate-50 last:border-0">
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CityAutocomplete = ({ value, onChange, countryCode }) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);
  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchCities = useCallback((q) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const cp = countryCode ? `&countrycodes=${countryCode.toLowerCase()}` : "";
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}${cp}&featuretype=city&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const cities = [...new Set(data.map((d) => d.address?.city || d.address?.town || d.name).filter(Boolean))];
        setSuggestions(cities); setOpen(cities.length > 0);
      } catch { /* silent */ }
    }, 600);
  }, [countryCode]);

  const handleChange = (e) => { const v = e.target.value; setQuery(v); onChange(v); fetchCities(v); };

  return (
    <div ref={wrapRef} className="relative">
      <input value={query} onChange={handleChange} placeholder="City"
        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 bg-white transition-all" />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-44 overflow-y-auto">
          {suggestions.map((city, i) => (
            <li key={i} onClick={() => { setQuery(city); onChange(city); setOpen(false); }}
              className="px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 cursor-pointer border-b border-slate-50 last:border-0">
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CountrySelect = ({ value, onChange }) => {
  const list = Object.entries(countries.getNames("en", { select: "official" }))
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-amber-400 bg-white transition-all appearance-none cursor-pointer">
      <option value="">Select country…</option>
      {list.map(({ code, name }) => <option key={code} value={name}>{name}</option>)}
    </select>
  );
};

const getCountryCode = (name) => {
  const all = countries.getNames("en", { select: "official" });
  const entry = Object.entries(all).find(([, n]) => n === name);
  return entry ? entry[0] : "";
};

// Reusable UI Sub-components
const FieldLabel = ({ text }) => <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{text}</label>;
const ActionBtn = ({ label, onClick }) => <button onClick={onClick} className="h-8 px-3 rounded-lg bg-slate-800 text-white text-[11px] font-bold hover:bg-black transition-colors">{label}</button>;
const CancelBtn = ({ onClick }) => <button onClick={onClick} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><HiOutlineX size={14}/></button>;

const DisplayRow = ({ value, label, onEdit }) => (
  <div className="flex items-center justify-between h-9 px-3 border border-slate-100 bg-slate-50/50 rounded-lg group">
    <span className="text-sm text-slate-600 truncate mr-4">{value || `Add ${label.toLowerCase()}…`}</span>
    <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-white rounded-md transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-amber-100">
      <HiOutlinePencil size={13} />
    </button>
  </div>
);

const LockedField = ({ label, value, hint }) => (
  <div>
    <FieldLabel text={label} />
    <div className="h-9 px-3 border border-slate-100 bg-slate-50 rounded-lg flex items-center justify-between">
      <span className="text-sm text-slate-400 italic">{value}</span>
      <HiOutlineClock size={14} className="text-slate-300" />
    </div>
    {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const EditableField = ({ label, value, editing, tempValue, onStart, onConfirm, onCancel, onTempChange, fieldKey, prefix }) => (
  <div>
    <FieldLabel text={label} />
    {editing ? (
      <div className="flex gap-2">
        <div className="flex-1 flex items-center h-9 border border-amber-400 rounded-lg px-3 bg-white ring-1 ring-amber-100">
          {prefix}
          <input value={tempValue} onChange={(e) => onTempChange(e.target.value)} autoFocus
            className="w-full text-sm text-slate-700 outline-none" />
        </div>
        <ActionBtn label="Save" onClick={() => onConfirm(fieldKey)} />
        <CancelBtn onClick={onCancel} />
      </div>
    ) : (
      <DisplayRow value={value} label={label} onEdit={() => onStart(fieldKey)} />
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const BusinessSettings = () => {
  const [form, setForm] = useState({
    business_name: "", business_category: "", address: "", city: "",
    country: "", business_email: "", business_phone: "", website: "",
    opening_time: "", closing_time: "",
  });
  const [savedForm, setSavedForm] = useState({});
  const [docData, setDocData] = useState({
    has_government_issued_id: false, has_country_issued_id: false,
    has_business_license: false, has_tax_certificate: false, has_incorporation_cert: false,
    government_issued_id_url: null, country_issued_id_url: null,
    business_license_url: null, tax_certificate_url: null, incorporation_cert_url: null,
    verification_status: "", rejection_reason: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMsg, setSaveMsg] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [editingHours, setEditingHours] = useState(false);
  const [tempHours, setTempHours] = useState({ opening_time: "", closing_time: "" });
  const [viewerDoc, setViewerDoc] = useState(null);
  const [docUploading, setDocUploading] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVendorBusinessSettings();
        if (!data) return;
        const snap = {
          business_name: data.business_name || "",
          business_category: data.business_category || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          business_email: data.business_email || "",
          business_phone: data.business_phone || "",
          website: data.website || "",
          opening_time: data.opening_time || "",
          closing_time: data.closing_time || "",
        };
        setForm(snap); setSavedForm(snap);
        setDocData({
          has_government_issued_id: data.has_government_issued_id || false,
          has_country_issued_id: data.has_country_issued_id || false,
          has_business_license: data.has_business_license || false,
          has_tax_certificate: data.has_tax_certificate || false,
          has_incorporation_cert: data.has_incorporation_cert || false,
          government_issued_id_url: data.government_issued_id_url || null,
          country_issued_id_url: data.country_issued_id_url || null,
          business_license_url: data.business_license_url || null,
          tax_certificate_url: data.tax_certificate_url || null,
          incorporation_cert_url: data.incorporation_cert_url || null,
          verification_status: data.verification_status || "",
          rejection_reason: data.rejection_reason || "",
        });
      } catch (err) {
        console.error("Failed to load business settings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const startEdit = (k) => { setEditingField(k); setTempValue(form[k] || ""); };
  const cancelEdit = () => setEditingField(null);
  const confirmEdit = (k) => { setField(k, tempValue); setEditingField(null); };

  const startHoursEdit = () => { setTempHours({ opening_time: form.opening_time, closing_time: form.closing_time }); setEditingHours(true); };
  const confirmHours = () => { setForm((p) => ({ ...p, ...tempHours })); setEditingHours(false); };

  const handleLogoChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const changed = {};
    Object.keys(form).forEach((k) => { if (form[k] !== savedForm[k]) changed[k] = form[k]; });
    if (logoFile) changed.logo = logoFile;

    if (Object.keys(changed).length === 0) {
      setSaveStatus("success"); setSaveMsg("Already up to date.");
      setTimeout(() => setSaveStatus("idle"), 2500); return;
    }

    setSaving(true); setSaveStatus("idle");
    try {
      await updateVendorBusinessSettings(changed);
      setSavedForm({ ...form }); setLogoFile(null);
      setSaveStatus("success"); setSaveMsg("Changes saved!");
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("error");
      setSaveMsg(err?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleDocUpload = async (e, apiKey) => {
    const file = e.target.files[0]; if (!file) return;
    setDocUploading((p) => ({ ...p, [apiKey]: true }));
    try {
      await updateVendorBusinessSettings({ [apiKey]: file });
      const updated = await getVendorBusinessSettings();
      setDocData({
        has_government_issued_id: updated.has_government_issued_id || false,
        has_country_issued_id: updated.has_country_issued_id || false,
        has_business_license: updated.has_business_license || false,
        has_tax_certificate: updated.has_tax_certificate || false,
        has_incorporation_cert: updated.has_incorporation_cert || false,
        government_issued_id_url: updated.government_issued_id_url || null,
        country_issued_id_url: updated.country_issued_id_url || null,
        business_license_url: updated.business_license_url || null,
        tax_certificate_url: updated.tax_certificate_url || null,
        incorporation_cert_url: updated.incorporation_cert_url || null,
        verification_status: updated.verification_status || "",
        rejection_reason: updated.rejection_reason || "",
      });
    } catch (err) {
      console.error(`Upload failed (${apiKey}):`, err);
      alert("Upload failed. Please try again.");
    } finally {
      setDocUploading((p) => ({ ...p, [apiKey]: false }));
    }
  };

  const fmt = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hr = parseInt(h, 10);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const docs = [
    { label: "Government Issued ID", hasIt: docData.has_government_issued_id, url: docData.government_issued_id_url, apiKey: "government_issued_id" },
    { label: "Country Issued ID", hasIt: docData.has_country_issued_id, url: docData.country_issued_id_url, apiKey: "country_issued_id" },
    { label: "Business License", hasIt: docData.has_business_license, url: docData.business_license_url, apiKey: "business_license" },
    { label: "Tax Certificate", hasIt: docData.has_tax_certificate, url: docData.tax_certificate_url, apiKey: "tax_certificate" },
    { label: "Certificate of Incorporation", hasIt: docData.has_incorporation_cert, url: docData.incorporation_cert_url, apiKey: "incorporation_cert" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={36} /><p className="text-sm text-slate-400">Loading business settings…</p>
        </div>
      </div>
    );
  }

  const countryIso2 = getCountryCode(form.country);

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar4 />

        <div className="flex-1 overflow-y-auto">
          <main className="flex-1 px-3 sm:px-5 lg:px-7 py-5">
            <div className="max-w-4xl mx-auto">

              <div className="mb-5">
                <h1 className="text-lg font-bold text-slate-800">Business Settings</h1>
                <p className="text-xs text-slate-400 mt-0.5">Manage your store profile, documents, and operating details.</p>
              </div>

              {docData.verification_status === "rejected" && docData.rejection_reason && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  <span className="font-semibold">Application rejected: </span>{docData.rejection_reason}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {logoPreview
                          ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                          : <HiOutlinePhotograph size={22} className="text-slate-300" />}
                      </div>
                      <label className="absolute -bottom-1.5 -right-1.5 w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer shadow"
                        style={{ background: GOLD }}>
                        <HiOutlinePencil size={12} className="text-white" />
                        <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Business Logo</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Recommended: 200×200px · JPG, PNG, or WEBP · max 2 MB</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <h2 className="text-sm font-semibold text-slate-800">Business Information</h2>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <LockedField label="Business Name" value={form.business_name} />
                      <EditableField label="Business Category" fieldKey="business_category"
                        value={form.business_category}
                        editing={editingField === "business_category"}
                        tempValue={editingField === "business_category" ? tempValue : ""}
                        onStart={startEdit} onConfirm={confirmEdit} onCancel={cancelEdit} onTempChange={setTempValue} />

                      <LockedField label="Contact Email" value={form.business_email}
                        hint="Contact support to change your business email" />

                      <div>
                        <FieldLabel text="Contact Phone" />
                        {editingField === "business_phone" ? (
                          <div className="flex gap-2">
                            <div className="flex-1 h-9 border border-amber-400 rounded-lg px-3 flex items-center bg-white ring-1 ring-amber-100">
                              <PhoneInput international defaultCountry="UG"
                                value={tempValue} onChange={setTempValue}
                                className="eki-phone w-full text-sm" />
                            </div>
                            <ActionBtn label="Save" onClick={() => confirmEdit("business_phone")} />
                            <CancelBtn onClick={cancelEdit} />
                          </div>
                        ) : (
                          <DisplayRow value={form.business_phone} label="Contact Phone" onEdit={() => startEdit("business_phone")} />
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel text="Street Address" />
                        {editingField === "address" ? (
                          <div className="flex flex-col gap-2">
                            <AddressAutocomplete value={tempValue} onChange={setTempValue}
                              placeholder="Start typing your street address…" />
                            <div className="flex gap-2">
                              <ActionBtn label="Save" onClick={() => confirmEdit("address")} />
                              <CancelBtn onClick={cancelEdit} />
                            </div>
                          </div>
                        ) : (
                          <DisplayRow value={form.address} label="Street Address" onEdit={() => startEdit("address")} />
                        )}
                      </div>

                      <div>
                        <FieldLabel text="City" />
                        {editingField === "city" ? (
                          <div className="flex flex-col gap-2">
                            <CityAutocomplete value={tempValue} onChange={setTempValue} countryCode={countryIso2} />
                            <div className="flex gap-2">
                              <ActionBtn label="Save" onClick={() => confirmEdit("city")} />
                              <CancelBtn onClick={cancelEdit} />
                            </div>
                          </div>
                        ) : (
                          <DisplayRow value={form.city} label="City" onEdit={() => startEdit("city")} />
                        )}
                      </div>

                      <div>
                        <FieldLabel text="Country" />
                        {editingField === "country" ? (
                          <div className="flex flex-col gap-2">
                            <CountrySelect value={form.country}
                              onChange={(val) => { setField("country", val); setTempValue(val); }} />
                            <div className="flex gap-2">
                              <ActionBtn label="Save" onClick={() => { setField("country", tempValue); setEditingField(null); }} />
                              <CancelBtn onClick={cancelEdit} />
                            </div>
                          </div>
                        ) : (
                          <DisplayRow value={form.country} label="Country" onEdit={() => startEdit("country")} />
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <EditableField label="Website" fieldKey="website"
                          value={form.website}
                          editing={editingField === "website"}
                          tempValue={editingField === "website" ? tempValue : ""}
                          onStart={startEdit} onConfirm={confirmEdit} onCancel={cancelEdit} onTempChange={setTempValue}
                          prefix={<HiOutlineGlobeAlt size={13} className="text-slate-300 mr-1.5 shrink-0" />} />
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      {saveStatus === "error" && (
                        <p className="text-xs text-rose-500 mb-2">{saveMsg}</p>
                      )}
                      <button onClick={handleSave} disabled={saving}
                        className="w-full h-9 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                        style={{
                          background: saving ? "#9ca3af" : saveStatus === "success" ? "#16a34a" : GOLD,
                        }}>
                        {saving
                          ? <><Spinner size={15} color="#fff" /> Saving…</>
                          : saveStatus === "success" ? `✓ ${saveMsg}`
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <h2 className="text-sm font-semibold text-slate-800">Vendor Documents</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">All 5 required for verification.</p>
                    </div>

                    <div className="p-3 flex flex-col gap-2">
                      {docs.map((doc) => {
                        const status = doc.hasIt ? "Verified" : "Missing";
                        const cfg = DOC_STATUS_CFG[status];
                        const StatusIcon = cfg.icon;
                        const badge = getFileTypeBadge(doc.url);
                        const isUploading = docUploading[doc.apiKey];

                        return (
                          <div key={doc.apiKey}
                            className={`p-2.5 border ${cfg.border} rounded-xl ${cfg.bg} flex items-center gap-2.5`}>
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                              <StatusIcon size={14} className={cfg.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-slate-700 truncate leading-tight">{doc.label}</p>
                              <div className="items-center gap-1 mt-0.5 flex">
                                <span className={`text-[9px] font-medium ${cfg.color}`}>{status}</span>
                                {doc.hasIt && badge && (
                                  <span className="text-[8px] font-bold px-1 py-0.5 bg-white border border-slate-200 rounded text-slate-500 uppercase">
                                    {badge}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0">
                              {isUploading ? (
                                <Spinner size={14} />
                              ) : doc.hasIt ? (
                                <button
                                  onClick={() => setViewerDoc(doc)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm">
                                  <HiOutlineEye size={13} />
                                </button>
                              ) : (
                                <label className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-sm cursor-pointer">
                                  <HiOutlinePencil size={13} />
                                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleDocUpload(e, doc.apiKey)} />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
                     <h2 className="text-sm font-semibold text-slate-800 mb-3">Operating Hours</h2>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Opening Time</span>
                           <span className="font-medium text-slate-700">{fmt(form.opening_time)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400">Closing Time</span>
                           <span className="font-medium text-slate-700">{fmt(form.closing_time)}</span>
                        </div>
                        <button onClick={startHoursEdit} className="w-full mt-2 py-2 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wider">
                           Update Hours
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Modals */}
      {viewerDoc && (
        <DocViewerModal url={viewerDoc.url} label={viewerDoc.label} onClose={() => setViewerDoc(null)} />
      )}

      {editingHours && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Set Operating Hours</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <FieldLabel text="Opening" />
                <input type="time" value={tempHours.opening_time} onChange={(e) => setTempHours({...tempHours, opening_time: e.target.value})}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <FieldLabel text="Closing" />
                <input type="time" value={tempHours.closing_time} onChange={(e) => setTempHours({...tempHours, closing_time: e.target.value})}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={confirmHours} className="flex-1 h-10 rounded-xl bg-slate-800 text-white text-sm font-bold">Apply</button>
              <button onClick={() => setEditingHours(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSettings;