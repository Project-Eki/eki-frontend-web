import React, { useState, useRef, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar3';
import { validateAccountData } from '../utils/validationUtils';
// ── Primary service imports — all profile reads/writes go through authService ──
import { getVendorProfile, updateVendorProfile, SignoutUser } from '../services/authService';
// ── Kept for admin notification interceptor side-effects only ─────────────────
import api from '../services/api';

function AccountSettingsPage() {
  const [userData, setUserData] = useState({
    firstName:        '',
    lastName:         '',
    email:            '',
    phone:            '',
    profileImage:     null, // preview URL (local blob or confirmed remote URL)
    profileImageFile: null, // ONLY set when user picks a NEW file — null otherwise
  });

  // Stable remote URL passed to Navbar3 — only ever holds a server URL, never a blob
  const [navbarProfileImage, setNavbarProfileImage] = useState(null);

  const [isLoading,      setIsLoading]      = useState(false);
  const [linkedSocials,  setLinkedSocials]  = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors,         setErrors]         = useState({});
  const [saveSuccess,    setSaveSuccess]    = useState(false);
  const fileInputRef = useRef(null);

  const availableSocials = [
    { name: 'WhatsApp',    color: '#25D366' },
    { name: 'Instagram',   color: '#E4405F' },
    { name: 'LinkedIn',    color: '#0A66C2' },
    { name: 'Facebook',    color: '#1877F2' },
    { name: 'Twitter / X', color: '#000000' },
  ];

  // ─── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getVendorProfile();
        const remoteImage = res.profile_picture || null;

        setUserData({
          firstName:        res.first_name   || '',
          lastName:         res.last_name    || '',
          email:            res.email        || '',
          phone:            res.phone_number || '',
          profileImage:     remoteImage,  // remote URL from server
          profileImageFile: null,         // no pending file on load
        });

        // Feed the confirmed server URL to the navbar immediately
        setNavbarProfileImage(remoteImage);
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
      }
    };
    loadProfile();
  }, []);

  const handleLinkSocial = (social) => {
    if (!linkedSocials.find(s => s.name === social.name)) {
      setLinkedSocials([...linkedSocials, social]);
    }
    setIsDropdownOpen(false);
  };

  const handleUnlink = (name) => {
    setLinkedSocials(linkedSocials.filter(s => s.name !== name));
  };

  const handleEditPhotoClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return; // user cancelled — do nothing
    setUserData(prev => ({
      ...prev,
      profileImage:     URL.createObjectURL(file), // local preview while they decide
      profileImageFile: file,                       // real File object ready for upload
    }));
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAccountData(userData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setSaveSuccess(false);

    try {
      // ── Build only the fields that should be sent ─────────────────────────
      // IMPORTANT: Only include profile_picture when profileImageFile is a real
      // File object. Sending null/undefined causes Django's 400 "not a file" error.
      const changedFields = {
        business_phone: userData.phone,
      };

      if (userData.profileImageFile instanceof File) {
        changedFields.profile_picture = userData.profileImageFile;
      }

      // updateVendorProfile (authService) builds FormData + sends multipart PATCH
      await updateVendorProfile(changedFields);

      // ── Get the confirmed remote URL back from the server ─────────────────
      // We always re-fetch after save so the navbar gets the real hosted URL,
      // not a temporary blob:// that disappears on reload.
      let freshRemoteImage = userData.profileImage; // safe fallback

      try {
        const refreshed = await getVendorProfile();
        if (refreshed.profile_picture) {
          freshRemoteImage = refreshed.profile_picture;
        }
      } catch (_) {
        // Non-fatal — current preview still works visually
      }

      // Replace blob preview with the stable server URL in the avatar card
      setUserData(prev => ({
        ...prev,
        profileImage:     freshRemoteImage,
        profileImageFile: null, // clear pending file — upload is done
      }));

      // Push to navbar so the avatar there updates instantly without reload
      setNavbarProfileImage(freshRemoteImage);

      setSaveSuccess(true);
    } catch (err) {
      console.error('Save error:', err.response?.data ?? err.message);
      const backendError =
        err.response?.data?.detail  ||
        err.response?.data?.message ||
        'Failed to save changes';
      alert(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handlePhoneChange = (value) => {
    setUserData(prev => ({ ...prev, phone: value }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* profileImage prop keeps Navbar3 avatar in sync after save */}
        <Navbar3 profileImage={navbarProfileImage} />

        <main className="flex-1 p-5 max-w-[1400px] mx-auto w-full pb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">Account Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">

                {/* Profile Overview Card */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
                  <div className="relative inline-block mb-2">
                    <div className="w-20 h-20 rounded-full mx-auto bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                      {userData.profileImage
                        ? <img src={userData.profileImage} className="w-full h-full object-cover" alt="profile" />
                        : <span className="text-slate-300 text-xs">Photo</span>
                      }
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={handleEditPhotoClick}
                      className="absolute bottom-0 right-0 bg-white border border-slate-200 p-1.5 rounded-full text-slate-400 hover:text-slate-600 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">
                    {userData.firstName || userData.lastName
                      ? `${userData.firstName} ${userData.lastName}`
                      : 'User Name'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">{userData.email || 'email@example.com'}</p>

                  {/* Show a small indicator when a new photo is staged but not yet saved */}
                  {userData.profileImageFile && (
                    <p className="text-[10px] text-amber-500 font-medium mt-1">
                      📷 New photo selected — click Save Changes to upload
                    </p>
                  )}
                </div>

                {/* Form Card */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                  <h3 className="text-base font-bold text-slate-800 mb-5">Account Details</h3>

                  {saveSuccess && (
                    <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-[11px] text-green-700 font-medium">
                      ✓ Changes saved successfully!
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate className="space-y-4">

                    {/* First & Last name — read-only */}
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-500">First Name</label>
                        <input
                          name="firstName"
                          type="text"
                          value={userData.firstName}
                          readOnly
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-500">Last Name</label>
                        <input
                          name="lastName"
                          type="text"
                          value={userData.lastName}
                          readOnly
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Email — read-only */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-500">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={userData.email}
                        readOnly
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Phone — editable */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-500">Phone Number</label>
                      <PhoneInput
                        country={'ug'}
                        value={userData.phone}
                        onChange={handlePhoneChange}
                        inputClass={`!w-full !px-12 !py-5 !text-sm !border !rounded-lg !bg-white !focus:outline-none !transition-all ${errors.phone ? '!border-red-500' : '!border-slate-200'}`}
                        buttonClass={`!bg-white !border !rounded-l-lg ${errors.phone ? '!border-red-500' : '!border-slate-200'}`}
                        containerClass="!w-full"
                      />
                      {errors.phone && <p className="text-[9px] text-red-500 font-medium">{errors.phone}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 text-[11px] font-bold bg-[#F5B841] text-white rounded-lg shadow-sm hover:bg-[#E0A83B] disabled:opacity-50 transition-all"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <h3 className="text-[10px] font-bold text-slate-800 mb-4 uppercase tracking-widest">Your Role</h3>
                  <div className="border border-[#125852] border-opacity-20 rounded-lg p-4 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100">
                        <svg className="w-6 h-6 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Vendor</h4>
                        <p className="text-[9px] text-slate-400 font-medium">List products and process payouts.</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[#125852]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Identity Verification Card */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <h3 className="text-[10px] font-bold text-slate-800 mb-4 uppercase tracking-widest">Identity Verification</h3>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-50 rounded-full">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-800">Identity Status:</h4>
                        <span className="bg-[#125852] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">Verified</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium italic">Your identity has been successfully verified.</p>
                    </div>
                  </div>
                </div>

                {/* Linked Accounts Card */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                  <h3 className="text-[10px] font-bold text-slate-800 mb-4 uppercase tracking-widest">Linked Accounts</h3>
                  <div className="space-y-3 mb-5">
                    {linkedSocials.map((social, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: social.color }}></div>
                          <span className="text-[11px] text-slate-700 font-semibold">{social.name} Connected</span>
                        </div>
                        <button onClick={() => handleUnlink(social.name)} className="text-red-500 text-[9px] font-bold uppercase hover:underline">Unlink</button>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-center gap-2 bg-[#FABB00] text-white py-2.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-[#e0aa00] transition-colors"
                    >
                      {isDropdownOpen ? '× Close Menu' : '+ Link New Account'}
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 w-full bg-white mt-2 border border-slate-200 rounded-lg shadow-xl z-[70] overflow-hidden">
                        {availableSocials.map((social) => (
                          <button
                            type="button"
                            key={social.name}
                            onClick={() => handleLinkSocial(social)}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b last:border-none transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: social.color }}></div>
                            {social.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-[#125852] text-white py-2.5 px-5 flex justify-between items-center text-[8px] rounded-xl mx-5 mb-3">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved.</div>
        </footer>
      </div>
    </div>
  );
}

export default AccountSettingsPage;