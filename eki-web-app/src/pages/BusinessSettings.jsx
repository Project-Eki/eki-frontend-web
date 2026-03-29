import React, { useState, useEffect, useRef } from "react";
import { getVendorProfile, updateVendorProfile } from "../services/api";
import VendorSidebar from "../components/VendorSidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import {
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlineClipboardList,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlinePhotograph,
  HiOutlineGlobeAlt,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

/* ── inline footer matching the rest of the app ── */
const Footer = () => (
  <footer className="bg-[#125852] text-white py-2.5 px-5 flex justify-between items-center text-[8px] rounded-xl mx-5 mb-3">
    <div>Buy Smart. Sell Fast. Grow Together...</div>
    <div>© 2026 Vendor Portal. All rights reserved.</div>
  </footer>
);

/* ── document status config ── */
const DOC_STATUS = {
  Verified: { color: "text-green-600", bg: "bg-green-50", icon: HiOutlineCheckCircle },
  Pending:  { color: "text-amber-600", bg: "bg-amber-50",  icon: HiOutlineClock       },
  Missing:  { color: "text-red-500",   bg: "bg-red-50",    icon: HiOutlineExclamationCircle },
};

const quickLinks = [
  { title: "Listings Management", desc: "Manage your products, inventory, and offers",       icon: HiOutlineClipboardList, path: "/product-dashboard" },
  { title: "Payout Settings",     desc: "Configure bank accounts and payment schedules",     icon: HiOutlineCreditCard,    path: "/payment"           },
  { title: "Dashboard Access",    desc: "View analytics and performance metrics",            icon: HiOutlineChartBar,      path: "/vendordashboard"   },
];

const fields = [
  { key: "business_name",     label: "Business Name",      locked: true,  span: false },
  { key: "business_category", label: "Business Category",  locked: false, span: false },
  { key: "address",           label: "Street Address",     locked: false, span: true  },
  { key: "city",              label: "City",               locked: false, span: false },
  { key: "country",           label: "Country",            locked: false, span: false },
  { key: "business_email",    label: "Contact Email",      locked: false, span: false },
  { key: "business_phone",    label: "Contact Phone",      locked: false, span: false },
  { key: "website",           label: "Website Link",       locked: false, span: true  },
];

/* ── field row ── */
const FieldRow = ({ fieldKey, label, locked, value, editing, tempValue, onStartEdit, onConfirm, onTempChange }) => {
  const isPhone = fieldKey === "business_phone";
  const isWebsite = fieldKey === "website";

  if (locked) {
    return (
      <div className="flex items-center justify-between h-11 px-4 bg-slate-100 rounded-xl">
        <span className="text-sm text-slate-700 font-semibold truncate">{value}</span>
        <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">LOCKED</span>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex gap-2">
        {isPhone ? (
          <div className="flex-1 bg-white border-2 border-[#F5B841] rounded-xl px-3 h-11 flex items-center">
            <PhoneInput
              international
              defaultCountry="UG"
              value={tempValue}
              onChange={onTempChange}
              className="eki-phone-input w-full"
            />
          </div>
        ) : (
          <input
            autoFocus
            value={tempValue}
            onChange={e => onTempChange(e.target.value)}
            className="flex-1 h-11 px-4 border-2 border-[#F5B841] rounded-xl text-sm outline-none bg-white"
          />
        )}
        <button
          onClick={onConfirm}
          className="h-11 px-4 bg-[#125852] text-white text-xs font-bold rounded-xl hover:bg-[#0e4440] transition-colors shrink-0"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-11 px-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors cursor-default">
      <span className="text-sm text-slate-700 font-medium truncate">
        {isWebsite && value && <HiOutlineGlobeAlt className="inline mr-2 text-blue-400 shrink-0" />}
        {value || <span className="text-slate-300">Add {label}</span>}
      </span>
      <button
        onClick={() => onStartEdit(fieldKey, value)}
        className="text-slate-300 group-hover:text-[#F5B841] transition-colors shrink-0 ml-2 p-1"
        title={`Edit ${label}`}
      >
        <HiOutlinePencil size={15} />
      </button>
    </div>
  );
};

/* main component */
const fmt = (t) => {
  if (!t) return "--:--";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const BusinessSettings = () => {
  const [formData, setFormData] = useState({
    business_name: "", address: "", city: "", country: "", business_email: "", business_phone: "",
    website: "", business_category: "", opening_time: "", closing_time: "", logo: null,
    has_gov_id: false, has_country_id: false, has_license: false, has_tax: false, has_incorp: false,
  });

  const [originalData, setOriginalData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingHours, setEditingHours] = useState(false);
  const [tempHours, setTempHours] = useState({ opening_time: "", closing_time: "" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getVendorProfile();
        if (data) {
          const mapped = {
            business_name:     data.business_name     || "",
            address:           data.address           || "",
            city:              data.city              || "",
            country:           data.country           || "",
            business_email:    data.business_email    || "",
            business_phone:    data.business_phone    || "",
            website:           data.website           || "",
            business_category: data.business_category || "",
            opening_time:      data.opening_time      || "",
            closing_time:      data.closing_time      || "",
            logo:              null,
            has_gov_id: data.has_government_issued_id,
            has_country_id: data.has_country_issued_id,
            has_license: data.has_business_license,
            has_tax: data.has_tax_certificate,
            has_incorp: data.has_incorporation_cert,
          };
          setFormData(mapped);
          setOriginalData(mapped);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Dynamic Docs Array for UI
  const docs = [
    { label: "Government Issued ID", status: formData.has_gov_id ? "Verified" : "Missing", apiKey: "government_issued_id" },
    { label: "Country Issued ID",    status: formData.has_country_id ? "Verified" : "Missing", apiKey: "country_issued_id" },
    { label: "Business License",     status: formData.has_license ? "Verified" : "Missing", apiKey: "business_license" },
    { label: "Tax Certificate",      status: formData.has_tax ? "Verified" : "Missing", apiKey: "tax_certificate" },
    { label: "Incorporation Cert",   status: formData.has_incorp ? "Verified" : "Missing", apiKey: "incorporation_cert" },
  ];

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(p => ({ ...p, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFileUpload = async (e, apiKey) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      await updateVendorProfile({ [apiKey]: file });
      const updatedData = await getVendorProfile();
      setFormData(prev => ({
        ...prev,
        has_gov_id: updatedData.has_government_issued_id,
        has_country_id: updatedData.has_country_issued_id,
        has_license: updatedData.has_business_license,
        has_tax: updatedData.has_tax_certificate,
        has_incorp: updatedData.has_incorporation_cert,
      }));
      alert("Document uploaded successfully!");
    } catch (err) {
      alert("Failed to upload document.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (key, value) => { setEditingField(key); setTempValue(value); };
  const confirmEdit = (key) => { setFormData(p => ({ ...p, [key]: tempValue })); setEditingField(null); };

  const startHoursEdit = () => {
    setTempHours({ opening_time: formData.opening_time, closing_time: formData.closing_time });
    setEditingHours(true);
  };
  const confirmHours = () => {
    setFormData(p => ({ ...p, ...tempHours }));
    setEditingHours(false);
  };

  const getChangedFields = () => {
    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (key === "logo") {
        if (formData.logo instanceof File) changed.logo = formData.logo;
      } else if (!key.startsWith('has_') && formData[key] !== originalData[key]) {
        changed[key] = formData[key];
      }
    });
    return changed;
  };

  const handleSave = async () => {
    setSaveError("");
    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return;
    }
    setSaving(true);
    try {
      await updateVendorProfile(changedFields);
      setOriginalData({ ...formData, logo: null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 text-sm font-semibold">Loading profile...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">
      {/* VendorSidebar Component */}
      <VendorSidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />
        
        <div className="flex-1 overflow-y-auto">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h1 className="text-xl font-black text-slate-900">Business Settings</h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage store profile, documents, and details.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MAIN COLUMN */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" /> : <HiOutlinePhotograph size={28} className="text-slate-300" />}
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#125852] text-white rounded-lg flex items-center justify-center cursor-pointer shadow-md">
                        <HiOutlinePencil size={13} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </label>
                    </div>
                    <div>
                      <h2 className="text-[15px] font-black text-[#125852]">Business Brand</h2>
                      <p className="text-xs text-slate-400">Upload your logo for your storefront.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                      <h2 className="text-[15px] font-black text-[#125852]">Business Information</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {fields.map(({ key, label, locked, span }) => (
                        <div key={key} className={span ? "sm:col-span-2" : ""}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-0.5">{label}</p>
                          <FieldRow fieldKey={key} label={label} locked={locked} value={formData[key]} editing={editingField === key} tempValue={tempValue} onStartEdit={startEdit} onConfirm={() => confirmEdit(key)} onTempChange={setTempValue} />
                        </div>
                      ))}
                    </div>
                    <div className="px-5 pb-5">
                      <button onClick={handleSave} className={`w-full h-11 rounded-xl font-bold text-sm ${saved ? "bg-[#F5B841] text-white" : "bg-[#125852] text-white"}`}>{saved ? "✓ Saved" : "Save Changes"}</button>
                    </div>
                  </div>

                  {/* VENDOR DOCUMENTS */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                      <h2 className="text-[15px] font-black text-[#125852]">Vendor Documents</h2>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {docs.map((doc, i) => {
                        const cfg = DOC_STATUS[doc.status];
                        const StatusIcon = cfg.icon;
                        return (
                          <div key={i} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/60 flex items-center gap-3">
                            <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                              <StatusIcon size={17} className={cfg.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-700 truncate">{doc.label}</p>
                              <p className={`text-[10px] font-bold mt-0.5 ${cfg.color}`}>{doc.status}</p>
                            </div>
                            {doc.status === "Missing" ? (
                              <label className="text-[10px] font-black text-[#F5B841] hover:underline cursor-pointer uppercase">
                                UPLOAD
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.apiKey)} />
                              </label>
                            ) : (
                              <button className="text-[10px] font-black text-[#F5B841] hover:underline uppercase">VIEW</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="flex flex-col gap-5">
                  {/* QUICK LINKS */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                      <h2 className="text-[14px] font-black text-slate-800">Quick Links</h2>
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      {quickLinks.map(link => (
                        <a key={link.title} href={link.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                          <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-[#F5B841]/10 group-hover:text-[#F5B841] shrink-0">
                            <link.icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-800 leading-tight">{link.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{link.desc}</p>
                          </div>
                          <HiOutlineChevronRight size={15} className="text-slate-300 group-hover:text-slate-500" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* OPERATING HOURS */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                      <h2 className="text-[14px] font-black text-slate-800">Operating Hours</h2>
                      <button onClick={editingHours ? confirmHours : startHoursEdit} className="text-xs font-bold text-[#F5B841]">{editingHours ? "Save" : "Edit"}</button>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      {[{ label: "Opens", key: "opening_time" }, { label: "Closes", key: "closing_time" }].map(({ label, key }) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <HiOutlineClock size={14} className="text-[#F5B841]" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase">{label}</span>
                          </div>
                          {editingHours ? (
                            <input type="time" value={tempHours[key]} onChange={e => setTempHours(p => ({ ...p, [key]: e.target.value }))} className="text-sm font-bold bg-transparent border-b border-[#F5B841] outline-none" />
                          ) : (
                            <span className="text-sm font-bold text-slate-600">{fmt(formData[key])}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SUPPORT */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-[14px] font-black text-slate-800 mb-1">Need Assistance?</h3>
                    <p className="text-[12px] text-slate-500 mb-4 leading-relaxed">Our support team is here to help with any vendor account issues.</p>
                    <button className="w-full h-10 bg-[#F5B841] text-white font-bold rounded-xl text-sm hover:bg-[#E0A83B] transition-colors">Contact Support</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;