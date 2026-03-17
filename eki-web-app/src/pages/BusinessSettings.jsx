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
} from "react-icons/hi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import VendorNavbar from "../components/VendorNavbar";
import Footer from "../components/Footer";

const BusinessSettings = () => {
  const [formData, setFormData] = useState({
    business_name: "Eki Marketplace Ventures",
    business_address: "456 Market Lane, Suite 200",
    city: "Kampala",
    country: "Uganda",
    contact_email: "vendor@ekimarketplace.com",
    contact_phone: "+256700000000",
    website: "https://ekimarketplace.com",
    category: "products",
    opening_time: "08:00",
    closing_time: "18:00",
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingHours, setEditingHours] = useState(false);

  const fields = [
    { key: "business_name", label: "Business Name" },
    { key: "category", label: "Business Category" },
    { key: "business_address", label: "Street Address" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "contact_email", label: "Contact Email" },
    { key: "contact_phone", label: "Contact Phone" },
    { key: "website", label: "Website Link" },
  ];

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const startEdit = (field, value) => {
    setEditingField(field);
    setTempValue(value);
  };

  const confirmEdit = (field) => {
    setFormData((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1000);
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:${m} ${ampm}`;
  };

  const quickLinks = [
    {
      title: "Listings Management",
      desc: "Manage your products, inventory, and offers",
      icon: HiOutlineClipboardList,
    },
    {
      title: "Payout Settings",
      desc: "Configure bank accounts and payment schedules",
      icon: HiOutlineCreditCard,
    },
    {
      title: "Dashboard Access",
      desc: "View analytics and performance metrics",
      icon: HiOutlineChartBar,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans pb-12">
      <VendorNavbar />

      <div className=" flex-1 max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE: MAIN SETTINGS */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Logo Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HiOutlinePhotograph
                        size={32}
                        className="text-gray-300"
                      />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1C2B2B] text-white rounded-lg flex items-center justify-center cursor-pointer shadow-lg">
                    <HiOutlinePencil size={14} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#235E5D]">
                    Business Brand
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload your business logo for your storefront.
                  </p>
                </div>
              </div>
            </div>

            {/* General Info Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-[16px] font-black text-[#235E5D]">
                  Business Information
                </h2>
              </div>

              {/* Info Message */}
              <div className="px-6 pt-4">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-xs font-semibold">
                  Some information like your business name and documents cannot be changed after verification.
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map(({ key, label }) => {
                  const isLocked = key === "business_name";

                  return (
                    <div
                      key={key}
                      className={
                        key === "business_address" || key === "website"
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">
                        {label}
                      </p>

                      {isLocked ? (
                        <div className="flex items-center justify-between h-11 px-4 bg-gray-100 rounded-xl ">
                          <span className="text-sm text-gray-700 font-semibold">
                            {formData[key]}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            LOCKED
                          </span>
                        </div>
                      ) : editingField === key ? (
                        <div className="flex gap-2">
                          {key === "contact_phone" ? (
                            <div className="flex-1 bg-white border-2 border-[#F2B53D] rounded-xl px-3 h-11 flex items-center">
                              <PhoneInput
                                international
                                defaultCountry="UG"
                                value={tempValue}
                                onChange={setTempValue}
                                className="eki-phone-input w-full"
                              />
                            </div>
                          ) : (
                            <input
                              autoFocus
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              className="flex-1 h-11 px-4 border-2 border-[#F2B53D] rounded-xl text-sm outline-none"
                            />
                          )}
                          <button
                            onClick={() => confirmEdit(key)}
                            className="h-11 px-4 bg-[#1C2B2B] text-white text-xs font-bold rounded-xl"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between h-11 px-4 bg-gray-50 rounded-xl  group transition-all">
                          <span className="text-sm text-gray-700 font-semibold truncate">
                            {key === "website" && (
                              <HiOutlineGlobeAlt className="inline mr-2 text-blue-400" />
                            )}
                            {formData[key] || `Add ${label}`}
                          </span>

                          {!isLocked && (
                            <button
                              onClick={() => startEdit(key, formData[key])}
                              className="text-gray-300 group-hover:text-[#F2B53D]"
                            >
                              <HiOutlinePencil size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`w-full h-12 rounded-xl font-black text-sm transition-all shadow-sm ${
                    saved
                      ? "bg-[#efb034]  text-white"
                      : saving
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-400 text-white hover:bg-gray-500"
                  }`}
                >
                  {saved
                    ? "Changes Saved"
                    : saving
                    ? "Updating..."
                    : "Save All Changes"}
                </button>
              </div>
            </div>

            {/* Vendor Documents Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-[16px] font-black text-[#235E5D]">
                  Vendor Documents
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Government Issued ID",
                    status: "Verified",
                    color: "text-green-600",
                  },
                  {
                    label: "Country Issued ID",
                    status: "Missing",
                    color: "text-red-500",
                  },
                  { label: "Business License", status: "Pending", color: "text-yellow-500" },
                  { label: "Tax Certificate", status: "Verified", color: "text-green-600" },
                  { label: "Incorporation Certificate", status: "Missing", color: "text-red-500" },
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                      <HiOutlineDocumentText size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">
                        {doc.label}
                      </p>
                      <p className={`text-xs font-bold ${doc.color}`}>
                        {doc.status}
                      </p>
                    </div>
                    {doc.status === "Missing" ? (
                      <button className="text-[10px] font-black text-[#F2B53D] hover:underline">
                        UPLOAD
                      </button>
                    ) : (
                      <button className="text-[10px] font-black text-[#F2B53D] hover:underline">
                        VIEW
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-6">
            {/* Quick Links Section */}
            <div className="flex flex-col gap-4">
              {quickLinks.map((link) => (
                <div
                  key={link.title}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#F2B53D] transition-all group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 group-hover:bg-[#F2B53D]/10 transition-colors">
                    <link.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-black text-gray-900 leading-tight">
                      {link.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {link.desc}
                    </p>
                  </div>
                  <HiOutlineChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-gray-900"
                  />
                </div>
              ))}
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[16px] font-black text-gray-900">Hours</h2>
                <button
                  onClick={() => setEditingHours(!editingHours)}
                  className="text-[#F2B53D] text-xs font-bold"
                >
                  {editingHours ? "Cancel" : "Edit"}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-gray-50 rounded-xl  flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HiOutlineClock size={14} className="text-[#F2B53D]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">
                      Opens
                    </span>
                  </div>
                  <p className="font-black text-gray-500">
                    {formatTime(formData.opening_time)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl  flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HiOutlineClock size={14} className="text-[#F2B53D]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">
                      Closes
                    </span>
                  </div>
                  <p className="font-black text-gray-500">
                    {formatTime(formData.closing_time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm pt-6">
              <h3 className="text-[15px] font-black text-gray-600 mb-2">
                Need Assistance?
              </h3>
              <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
                Our support team is here to help with any questions or issues.
              </p>
              <button className="w-full h-11 bg-[#efb034]  text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer className="fixed bottom-0 left-0 w-full"/>
    </div>
  );
};

export default BusinessSettings;



// import React, { useState } from "react";
// import {
//   HiOutlinePencil,
//   HiOutlineClock,
//   HiOutlineClipboardList,
//   HiOutlineCreditCard,
//   HiOutlineChartBar,
//   HiArrowRight,
//   HiOutlinePhotograph,
//   HiOutlineDocumentText,
//   HiOutlineGlobeAlt,
//   HiOutlineChevronRight,
// } from "react-icons/hi";
// import PhoneInput from "react-phone-number-input";
// import "react-phone-number-input/style.css";
// import VendorNavbar from "../components/VendorNavbar";
// import Footer from "../components/Footer";

// const BusinessSettings = () => {
//   const [formData, setFormData] = useState({
//     business_name: "Eki Marketplace Ventures",
//     business_address: "456 Market Lane, Suite 200",
//     city: "Kampala",
//     country: "Uganda",
//     contact_email: "vendor@ekimarketplace.com",
//     contact_phone: "+256700000000",
//     website: "https://ekimarketplace.com",
//     category: "products",
//     opening_time: "08:00",
//     closing_time: "18:00",
//     logo: null,
//   });

//   const [logoPreview, setLogoPreview] = useState(null);
//   const [editingField, setEditingField] = useState(null);
//   const [tempValue, setTempValue] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [editingHours, setEditingHours] = useState(false);

//   const fields = [
//     { key: "business_name", label: "Business Name" },
//     { key: "category", label: "Business Category" },
//     { key: "business_address", label: "Street Address" },
//     { key: "city", label: "City" },
//     { key: "country", label: "Country" },
//     { key: "contact_email", label: "Contact Email" },
//     { key: "contact_phone", label: "Contact Phone" },
//     { key: "website", label: "Website Link" },
//   ];

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({ ...formData, logo: file });
//       setLogoPreview(URL.createObjectURL(file));
//     }
//   };

//   const startEdit = (field, value) => {
//     setEditingField(field);
//     setTempValue(value);
//   };

//   const confirmEdit = (field) => {
//     setFormData((prev) => ({ ...prev, [field]: tempValue }));
//     setEditingField(null);
//   };

//   const handleSave = () => {
//     setSaving(true);
//     setTimeout(() => {
//       setSaving(false);
//       setSaved(true);
//       setTimeout(() => setSaved(false), 2500);
//     }, 1000);
//   };

//   const formatTime = (time) => {
//     if (!time) return "--:--";
//     const [h, m] = time.split(":");
//     const hour = parseInt(h);
//     const ampm = hour >= 12 ? "PM" : "AM";
//     const display = hour % 12 === 0 ? 12 : hour % 12;
//     return `${display}:${m} ${ampm}`;
//   };

//   const quickLinks = [
//     {
//       title: "Listings Management",
//       desc: "Manage your products, inventory, and offers",
//       icon: HiOutlineClipboardList,
//     },
//     {
//       title: "Payout Settings",
//       desc: "Configure bank accounts and payment schedules",
//       icon: HiOutlineCreditCard,
//     },
//     {
//       title: "Dashboard Access",
//       desc: "View analytics and performance metrics",
//       icon: HiOutlineChartBar,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans pb-12">
//       <VendorNavbar />

//       <div className="max-w-5xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* LEFT SIDE: MAIN SETTINGS */}
//           <div className="lg:col-span-2 flex flex-col gap-6">
//             {/* Logo Section */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <div className="flex items-center gap-6">
//                 <div className="relative group">
//                   <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
//                     {logoPreview ? (
//                       <img
//                         src={logoPreview}
//                         alt="logo"
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <HiOutlinePhotograph
//                         size={32}
//                         className="text-gray-300"
//                       />
//                     )}
//                   </div>
//                   <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1C2B2B] text-white rounded-lg flex items-center justify-center cursor-pointer shadow-lg">
//                     <HiOutlinePencil size={14} />
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={handleLogoChange}
//                     />
//                   </label>
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-black text-[#235E5D]">
//                     Business Brand
//                   </h2>
//                   <p className="text-xs text-gray-400 mt-1">
//                     Upload your business logo for your storefront.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* General Info Section */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//               <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
//                 <h2 className="text-[16px] font-black text-[#235E5D]">
//                   Business Information
//                 </h2>
//               </div>

//               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
//                 {fields.map(({ key, label }) => (
//                   <div
//                     key={key}
//                     className={
//                       key === "business_address" || key === "website"
//                         ? "md:col-span-2"
//                         : ""
//                     }
//                   >
//                     <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">
//                       {label}
//                     </p>

//                     {editingField === key ? (
//                       <div className="flex gap-2">
//                         {key === "contact_phone" ? (
//                           <div className="flex-1 bg-white border-2 border-[#F2B53D] rounded-xl px-3 h-11 flex items-center">
//                             <PhoneInput
//                               international
//                               defaultCountry="UG"
//                               value={tempValue}
//                               onChange={setTempValue}
//                               className="eki-phone-input w-full"
//                             />
//                           </div>
//                         ) : (
//                           <input
//                             autoFocus
//                             value={tempValue}
//                             onChange={(e) => setTempValue(e.target.value)}
//                             className="flex-1 h-11 px-4 border-2 border-[#F2B53D] rounded-xl text-sm outline-none"
//                           />
//                         )}
//                         <button
//                           onClick={() => confirmEdit(key)}
//                           className="h-11 px-4 bg-[#1C2B2B] text-white text-xs font-bold rounded-xl"
//                         >
//                           Save
//                         </button>
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-between h-11 px-4 bg-gray-50 rounded-xl border group hover:border-gray-200 transition-all">
//                         <span className="text-sm text-gray-700 font-semibold truncate">
//                           {key === "website" && (
//                             <HiOutlineGlobeAlt className="inline mr-2 text-blue-400" />
//                           )}
//                           {formData[key] || `Add ${label}`}
//                         </span>
//                         <button
//                           onClick={() => startEdit(key, formData[key])}
//                           className="text-gray-300 group-hover:text-[#F2B53D]"
//                         >
//                           <HiOutlinePencil size={16} />
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="px-6 pb-6">
//                 <button
//                   onClick={handleSave}
//                   disabled={saving}
//                   className={`w-full h-12 rounded-xl font-black text-sm transition-all shadow-sm ${
//                     saved
//                       ? "bg-[#efb034]  text-white"
//                       : saving
//                         ? "bg-gray-200 text-gray-400"
//                         : "bg-gray-400 text-white hover:bg-gray-500"
//                   }`}
//                 >
//                   {saved
//                     ? "Changes Saved"
//                     : saving
//                       ? "Updating..."
//                       : "Save All Changes"}
//                 </button>
//               </div>
//             </div>

//             {/* Vendor Documents Card */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//               <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
//                 <h2 className="text-[16px] font-black text-[#235E5D]">
//                   Vendor Documents
//                 </h2>
//               </div>
//               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {[
//                   {
//                     label: "Government Issued ID",
//                     // status: "Uploaded",
//                     // color: "text-green-600",
//                   },
//                   {
//                     label: "Country Issued ID",
//                     // status: "Missing",
//                     // color: "text-red-500",
//                   },
//                   { label: "Business License" },
//                   { label: "Tax Certificate" },
//                   { label: "Incorporation Certificate" },
//                 ].map((doc, i) => (
//                   <div
//                     key={i}
//                     className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex items-center gap-4"
//                   >
//                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
//                       <HiOutlineDocumentText size={20} />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">
//                         {doc.label}
//                       </p>
//                       <p className={`text-xs font-bold ${doc.color}`}>
//                         {doc.status}
//                       </p>
//                     </div>
//                     <button className="text-[10px] font-black text-[#F2B53D] hover:underline">
//                       UPLOAD
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SIDE: MATCHING YOUR PNG */}
//           <div className="flex flex-col gap-6">
//             {/* Quick Links Section */}
//             <div className="flex flex-col gap-4">
//               {quickLinks.map((link) => (
//                 <div
//                   key={link.title}
//                   className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#F2B53D] transition-all group"
//                 >
//                   <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 group-hover:bg-[#F2B53D]/10 transition-colors">
//                     <link.icon size={24} />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-[14px] font-black text-gray-900 leading-tight">
//                       {link.title}
//                     </h3>
//                     <p className="text-[11px] text-gray-500 mt-1 leading-snug">
//                       {link.desc}
//                     </p>
//                   </div>
//                   <HiOutlineChevronRight
//                     size={18}
//                     className="text-gray-300 group-hover:text-gray-900"
//                   />
//                 </div>
//               ))}
//             </div>

//             {/* Operating Hours Card (Moved below or can be removed if not in PNG) */}
//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-[16px] font-black text-gray-900">Hours</h2>
//                 <button
//                   onClick={() => setEditingHours(!editingHours)}
//                   className="text-[#F2B53D] text-xs font-bold"
//                 >
//                   {editingHours ? "Cancel" : "Edit"}
//                 </button>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <div className="p-3 bg-gray-50 rounded-xl border flex justify-between items-center">
//                   <div className="flex items-center gap-2">
//                     <HiOutlineClock size={14} className="text-[#F2B53D]" />
//                     <span className="text-[10px] font-black text-gray-400 uppercase">
//                       Opens
//                     </span>
//                   </div>
//                   <p className="font-black text-gray-800">
//                     {formatTime(formData.opening_time)}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-gray-50 rounded-xl border flex justify-between items-center">
//                   <div className="flex items-center gap-2">
//                     <HiOutlineClock size={14} className="text-[#F2B53D]" />
//                     <span className="text-[10px] font-black text-gray-400 uppercase">
//                       Closes
//                     </span>
//                   </div>
//                   <p className="font-black text-gray-800">
//                     {formatTime(formData.closing_time)}
//                   </p>
//                 </div>
//               </div>
//             </div>

//              {/* Assistance Card */}
//             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm pt-6">
//               <h3 className="text-[15px] font-black text-gray-600 mb-2">
//                 Need Assistance?
//               </h3>
//               <p className="text-[12px] text-gray-500 mb-6 leading-relaxed">
//                 Our support team is here to help with any questions or issues.
//               </p>
//               <button className="w-full h-11 bg-[#efb034]  text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity">
//                 Contact Support
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default BusinessSettings;

