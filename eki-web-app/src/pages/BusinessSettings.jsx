import React, { useState } from "react";
import {
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlineClipboardList,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineX,
} from "react-icons/hi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import VendorNavbar from "../components/Vendormanagement/Navbar2";

/* ── inline footer matching the rest of the app ── */
const Footer = () => (
  <footer className="bg-[#235E5D] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
    <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
    <div>© 2026 Vendor Portal. All rights reserved.</div>
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      <span className="relative inline-block cursor-pointer hover:underline">
        eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
      </span>
      <span className="cursor-pointer hover:underline">Support</span>
      <span className="cursor-pointer hover:underline">Privacy Policy</span>
      <span className="cursor-pointer hover:underline">Terms of Service</span>
      <span className="cursor-pointer hover:underline">Ijoema ltd</span>
    </div>
  </footer>
);

/* ── document status config ── */
const DOC_STATUS = {
  Verified: { color: "text-green-600", bg: "bg-green-50", icon: HiOutlineCheckCircle },
  Pending:  { color: "text-amber-600", bg: "bg-amber-50",  icon: HiOutlineClock       },
  Missing:  { color: "text-red-500",   bg: "bg-red-50",    icon: HiOutlineExclamationCircle },
};

const docs = [
  { label: "Government Issued ID",        status: "Verified" },
  { label: "Country Issued ID",           status: "Missing"  },
  { label: "Business License",            status: "Pending"  },
  { label: "Tax Certificate",             status: "Verified" },
  { label: "Incorporation Certificate",   status: "Missing"  },
];

const quickLinks = [
  { title: "Listings Management", desc: "Manage your products, inventory, and offers",       icon: HiOutlineClipboardList, path: "/product-dashboard" },
  { title: "Payout Settings",     desc: "Configure bank accounts and payment schedules",     icon: HiOutlineCreditCard,    path: "/payment"           },
  { title: "Dashboard Access",    desc: "View analytics and performance metrics",            icon: HiOutlineChartBar,      path: "/vendordashboard"   },
];

const fields = [
  { key: "business_name",    label: "Business Name",      locked: true,  span: false },
  { key: "category",         label: "Business Category",  locked: false, span: false },
  { key: "business_address", label: "Street Address",     locked: false, span: true  },
  { key: "city",             label: "City",               locked: false, span: false },
  { key: "country",          label: "Country",            locked: false, span: false },
  { key: "contact_email",    label: "Contact Email",      locked: false, span: false },
  { key: "contact_phone",    label: "Contact Phone",      locked: false, span: false },
  { key: "website",          label: "Website Link",       locked: false, span: true  },
];

/* ── field row ── */
const FieldRow = ({ fieldKey, label, locked, value, editing, tempValue, onStartEdit, onConfirm, onTempChange }) => {
  const isPhone = fieldKey === "contact_phone";
  const isWebsite = fieldKey === "website";

  if (locked) {
    return (
      <div className="flex items-center justify-between h-11 px-4 bg-gray-100 rounded-xl">
        <span className="text-sm text-gray-700 font-semibold truncate">{value}</span>
        <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-2">LOCKED</span>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex gap-2">
        {isPhone ? (
          <div className="flex-1 bg-white border-2 border-[#F2B53D] rounded-xl px-3 h-11 flex items-center">
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
            className="flex-1 h-11 px-4 border-2 border-[#F2B53D] rounded-xl text-sm outline-none bg-white"
          />
        )}
        <button
          onClick={onConfirm}
          className="h-11 px-4 bg-[#235E5D] text-white text-xs font-bold rounded-xl hover:bg-[#1a4544] transition-colors shrink-0"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-11 px-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors cursor-default">
      <span className="text-sm text-gray-700 font-medium truncate">
        {isWebsite && value && <HiOutlineGlobeAlt className="inline mr-2 text-blue-400 shrink-0" />}
        {value || <span className="text-gray-300">Add {label}</span>}
      </span>
      <button
        onClick={() => onStartEdit(fieldKey, value)}
        className="text-gray-300 group-hover:text-[#F2B53D] transition-colors shrink-0 ml-2 p-1"
        title={`Edit ${label}`}
      >
        <HiOutlinePencil size={15} />
      </button>
    </div>
  );
};

/* ── main component ── */
const BusinessSettings = () => {
  const [formData, setFormData] = useState({
    business_name:    "Eki Marketplace Ventures",
    business_address: "456 Market Lane, Suite 200",
    city:             "Kampala",
    country:          "Uganda",
    contact_email:    "vendor@ekimarketplace.com",
    contact_phone:    "+256700000000",
    website:          "https://ekimarketplace.com",
    category:         "Products",
    opening_time:     "08:00",
    closing_time:     "18:00",
    logo:             null,
  });

  const [logoPreview,   setLogoPreview]   = useState(null);
  const [editingField,  setEditingField]  = useState(null);
  const [tempValue,     setTempValue]     = useState("");
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [editingHours,  setEditingHours]  = useState(false);
  const [tempHours,     setTempHours]     = useState({ opening_time: "", closing_time: "" });

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(p => ({ ...p, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const startEdit = (key, value) => { setEditingField(key); setTempValue(value); };
  const confirmEdit = key => { setFormData(p => ({ ...p, [key]: tempValue })); setEditingField(null); };

  const startHoursEdit = () => {
    setTempHours({ opening_time: formData.opening_time, closing_time: formData.closing_time });
    setEditingHours(true);
  };
  const confirmHours = () => {
    setFormData(p => ({ ...p, ...tempHours }));
    setEditingHours(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 1000);
  };

  const fmt = t => {
    if (!t) return "--:--";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  return (
    /* Outer shell — same h-screen pattern as other pages */
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans">
      <VendorNavbar />

      {/* Scrollable right column */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">

            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-xl font-black text-gray-900">Business Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your store profile, documents, and operating details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── LEFT / MAIN COLUMN ── */}
              <div className="lg:col-span-2 flex flex-col gap-5">

                {/* Logo card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                        {logoPreview
                          ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                          : <HiOutlinePhotograph size={28} className="text-gray-300" />
                        }
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#235E5D] text-white rounded-lg flex items-center justify-center cursor-pointer shadow-md hover:bg-[#1a4544] transition-colors">
                        <HiOutlinePencil size={13} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </label>
                    </div>
                    <div>
                      <h2 className="text-[15px] font-black text-[#235E5D]">Business Brand</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Upload your business logo for your storefront.</p>
                      <p className="text-[10px] text-gray-300 mt-1">PNG, JPG or WEBP — max 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Business information card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60">
                    <h2 className="text-[15px] font-black text-[#235E5D]">Business Information</h2>
                  </div>

                  {/* Warning notice */}
                  <div className="px-5 pt-4">
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-start gap-2">
                      <HiOutlineExclamationCircle size={14} className="shrink-0 mt-0.5" />
                      Some information like your business name cannot be changed after verification.
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fields.map(({ key, label, locked, span }) => (
                      <div key={key} className={span ? "sm:col-span-2" : ""}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-0.5">{label}</p>
                        <FieldRow
                          fieldKey={key}
                          label={label}
                          locked={locked}
                          value={formData[key]}
                          editing={editingField === key}
                          tempValue={tempValue}
                          onStartEdit={startEdit}
                          onConfirm={() => confirmEdit(key)}
                          onTempChange={setTempValue}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="px-5 pb-5">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`w-full h-11 rounded-xl font-bold text-sm transition-all ${
                        saved    ? "bg-[#F2B53D] text-white" :
                        saving   ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
                                   "bg-[#235E5D] text-white hover:bg-[#1a4544]"
                      }`}
                    >
                      {saved ? "✓ Changes Saved" : saving ? "Saving..." : "Save All Changes"}
                    </button>
                  </div>
                </div>

                {/* Vendor documents card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60">
                    <h2 className="text-[15px] font-black text-[#235E5D]">Vendor Documents</h2>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {docs.map((doc, i) => {
                      const cfg = DOC_STATUS[doc.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <div key={i} className="p-3.5 border border-gray-100 rounded-xl bg-gray-50/60 flex items-center gap-3">
                          <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <StatusIcon size={17} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-700 leading-tight truncate">{doc.label}</p>
                            <p className={`text-[10px] font-bold mt-0.5 ${cfg.color}`}>{doc.status}</p>
                          </div>
                          <button className="text-[10px] font-black text-[#F2B53D] hover:underline shrink-0">
                            {doc.status === "Missing" ? "UPLOAD" : "VIEW"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="flex flex-col gap-5">

                {/* Quick links */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60">
                    <h2 className="text-[14px] font-black text-gray-800">Quick Links</h2>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    {quickLinks.map(link => (
                      <a
                        key={link.title}
                        href={link.path}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-[#F2B53D]/10 group-hover:text-[#F2B53D] transition-colors shrink-0">
                          <link.icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 leading-tight">{link.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug truncate">{link.desc}</p>
                        </div>
                        <HiOutlineChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Operating hours card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60 flex items-center justify-between">
                    <h2 className="text-[14px] font-black text-gray-800">Operating Hours</h2>
                    <button
                      onClick={editingHours ? confirmHours : startHoursEdit}
                      className={`text-xs font-bold transition-colors ${editingHours ? "text-[#235E5D]" : "text-[#F2B53D]"}`}
                    >
                      {editingHours ? "Save" : "Edit"}
                    </button>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {[
                      { label: "Opens", key: "opening_time" },
                      { label: "Closes", key: "closing_time" },
                    ].map(({ label, key }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <HiOutlineClock size={14} className="text-[#F2B53D]" />
                          <span className="text-[11px] font-bold text-gray-400 uppercase">{label}</span>
                        </div>
                        {editingHours ? (
                          <input
                            type="time"
                            value={tempHours[key]}
                            onChange={e => setTempHours(p => ({ ...p, [key]: e.target.value }))}
                            className="text-sm font-bold text-gray-700 bg-transparent outline-none border-b border-[#F2B53D]"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-600">{fmt(formData[key])}</span>
                        )}
                      </div>
                    ))}
                    {editingHours && (
                      <button
                        onClick={() => setEditingHours(false)}
                        className="mt-1 text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Support card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-[14px] font-black text-gray-800 mb-1">Need Assistance?</h3>
                  <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
                    Our support team is here to help with any questions or issues about your vendor account.
                  </p>
                  <button className="w-full h-10 bg-[#F2B53D] text-white font-bold rounded-xl text-sm hover:bg-[#e0a630] transition-colors">
                    Contact Support
                  </button>
                </div>

              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default BusinessSettings;