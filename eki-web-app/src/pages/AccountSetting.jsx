import React, { useState, useRef, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar4';
import { validateAccountData } from '../utils/validationUtils';
import { getVendorProfile, updateVendorProfile } from '../services/authService';

function AccountSettingsPage() {
  const [userData, setUserData] = useState({
    firstName:        '',
    lastName:         '',
    email:            '',
    phone:            '',  // This will map to business_phone
    profileImage:     null,
    profileImageFile: null,
  });

  // Stable server URL fed to Navbar3 — never a blob://
  const [navbarProfileImage, setNavbarProfileImage] = useState(null);
  const [navbarName,         setNavbarName]         = useState('');

  const [isLoading,      setIsLoading]      = useState(false);
  const [linkedSocials,  setLinkedSocials]  = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors,         setErrors]         = useState({});
  const [saveSuccess,    setSaveSuccess]    = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Photo source selector: 'menu' | 'upload' | 'camera' | null
  const [photoMenuOpen,   setPhotoMenuOpen]   = useState(false);
  const [showCamera,      setShowCamera]      = useState(false);
  const [cameraStream,    setCameraStream]    = useState(null);
  const [cameraError,     setCameraError]     = useState('');

  const fileInputRef  = useRef(null);
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const photoMenuRef  = useRef(null);

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
      setProfileLoading(true);
      try {
        const res = await getVendorProfile();
        // Backend returns: first_name, last_name, email, business_phone, profile_picture (from User)
        const remoteImage = res.profile_picture || null;
        const fullName = [res.first_name, res.last_name].filter(Boolean).join(' ').trim();

        setUserData({
          firstName:        res.first_name   || '',
          lastName:         res.last_name    || '',
          email:            res.email        || '',
          phone:            res.business_phone || res.phone_number || '', // Try business_phone first
          profileImage:     remoteImage,
          profileImageFile: null,
        });

        setNavbarProfileImage(remoteImage);
        setNavbarName(fullName);
        
        console.log('Loaded profile:', {
          name: fullName,
          email: res.email,
          phone: res.business_phone,
          profileImage: remoteImage
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  // ─── Close photo menu on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target)) {
        setPhotoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ─── Cleanup camera stream when camera closes ───────────────────────────────
  useEffect(() => {
    if (!showCamera && cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  }, [showCamera]);

  // ─── Attach stream to video element once both are ready ────────────────────
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  const handleLinkSocial = (social) => {
    if (!linkedSocials.find(s => s.name === social.name)) {
      setLinkedSocials([...linkedSocials, social]);
    }
    setIsDropdownOpen(false);
  };

  const handleUnlink = (name) => {
    setLinkedSocials(linkedSocials.filter(s => s.name !== name));
  };

  // ─── Photo menu actions ─────────────────────────────────────────────────────
  const openPhotoMenu = () => setPhotoMenuOpen(prev => !prev);

  const handleChooseFile = () => {
    setPhotoMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleOpenCamera = async () => {
    setPhotoMenuOpen(false);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions in your browser.');
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      setUserData(prev => ({
        ...prev,
        profileImage:     URL.createObjectURL(blob),
        profileImageFile: file,
      }));
      setShowCamera(false);
    }, 'image/jpeg', 0.92);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }

    setUserData(prev => ({
      ...prev,
      profileImage:     URL.createObjectURL(file),
      profileImageFile: file,
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
      const changedFields = {};

      // Send phone number as business_phone (matches backend field)
      if (userData.phone) {
        let phone = String(userData.phone).replace(/\s/g, '');
        if (!phone.startsWith('+')) phone = `+${phone}`;
        changedFields.business_phone = phone; // Backend expects business_phone
      }

      // Handle profile picture - this goes to User model's profile_picture
      if (userData.profileImageFile instanceof File) {
        changedFields.profile_picture = userData.profileImageFile;
      }

      console.log('[AccountSettings] Updating with:', changedFields);
      
      await updateVendorProfile(changedFields);

      // Re-fetch to get the confirmed data from server
      const refreshed = await getVendorProfile();
      
      // Update local state with fresh data
      const fullName = [refreshed.first_name, refreshed.last_name].filter(Boolean).join(' ').trim();
      
      setUserData(prev => ({
        ...prev,
        firstName: refreshed.first_name || prev.firstName,
        lastName: refreshed.last_name || prev.lastName,
        email: refreshed.email || prev.email,
        phone: refreshed.business_phone || refreshed.phone_number || prev.phone,
        profileImage: refreshed.profile_picture || prev.profileImage,
        profileImageFile: null,
      }));

      // Update navbar
      setNavbarProfileImage(refreshed.profile_picture || null);
      setNavbarName(fullName);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err) {
      console.error('Save error:', err.response?.data ?? err.message);
      const backendError =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save changes. Please try again.';
      
      // Show detailed error for debugging
      alert(`Error: ${backendError}\n\nCheck console for details`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value) => {
    setUserData(prev => ({ ...prev, phone: value }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
  };

  const handleCancel = () => {
    setUserData(prev => ({
      ...prev,
      profileImage:     navbarProfileImage,
      profileImageFile: null,
    }));
    setSaveSuccess(false);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getInitials = () => {
    const f = userData.firstName?.trim()[0] || '';
    const l = userData.lastName?.trim()[0]  || '';
    return (f + l).toUpperCase() || '?';
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar receives live avatar + name — updates immediately after save */}
        <Navbar3
          profileImage={navbarProfileImage}
          userName={navbarName}
        />

        <main className="flex-1 p-5 max-w-[1400px] mx-auto w-full pb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-6">Account Settings</h1>

            {/* Camera modal */}
            {showCamera && (
              <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">Take a Photo</p>
                    <button
                      onClick={() => setShowCamera(false)}
                      className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none"
                    >×</button>
                  </div>
                  <div className="relative bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="p-4 flex justify-center">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="w-14 h-14 bg-[#125852] hover:bg-[#0e4440] rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {profileLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
                      <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-3"/>
                      <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto mb-2"/>
                      <div className="h-2 bg-slate-100 rounded w-1/3 mx-auto"/>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">

                  {/* ── Profile Overview Card ───────────────────────────────── */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
                    <div className="relative inline-block mb-3" ref={photoMenuRef}>
                      {/* Avatar */}
                      <div className="w-20 h-20 rounded-full mx-auto bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                        {userData.profileImage ? (
                          <img
                            src={userData.profileImage}
                            className="w-full h-full object-cover"
                            alt="profile"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-slate-500 text-lg font-bold">{getInitials()}</span>
                        )}
                      </div>

                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileChange}
                      />

                      {/* Edit pencil button */}
                      <button
                        type="button"
                        onClick={openPhotoMenu}
                        title="Change profile photo"
                        className="absolute bottom-0 right-0 bg-white border border-slate-200 p-1.5 rounded-full text-slate-400 hover:text-[#125852] shadow-sm transition-colors z-10"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                      </button>

                      {/* Photo source dropdown */}
                      {photoMenuOpen && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={handleChooseFile}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                          >
                            <svg className="w-4 h-4 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Choose from gallery
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenCamera}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <svg className="w-4 h-4 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Take a photo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Camera permission error */}
                    {cameraError && (
                      <p className="text-[10px] text-red-500 font-medium mt-1 mb-2">{cameraError}</p>
                    )}

                    <h2 className="text-lg font-bold text-slate-800 leading-tight">
                      {userData.firstName || userData.lastName
                        ? `${userData.firstName} ${userData.lastName}`.trim()
                        : 'Your Name'}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {userData.email || 'email@example.com'}
                    </p>

                    {userData.profileImageFile && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
                        📷 New photo selected — click <strong>Save Changes</strong> to upload
                      </p>
                    )}
                  </div>

                  {/* ── Account Details Form ────────────────────────────────── */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-800 mb-5">Account Details</h3>

                    {saveSuccess && (
                      <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-[11px] text-green-700 font-semibold flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Changes saved successfully!
                      </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">

                      {/* First & Last name — READ ONLY */}
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                            First Name
                            <span className="text-[9px] text-slate-300 normal-case font-normal">(read‑only)</span>
                          </label>
                          <input
                            type="text"
                            value={userData.firstName}
                            readOnly
                            tabIndex={-1}
                            className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed select-none"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                            Last Name
                            <span className="text-[9px] text-slate-300 normal-case font-normal">(read‑only)</span>
                          </label>
                          <input
                            type="text"
                            value={userData.lastName}
                            readOnly
                            tabIndex={-1}
                            className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed select-none"
                          />
                        </div>
                      </div>

                      {/* Email — READ ONLY */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                          Email Address
                          <span className="text-[9px] text-slate-300 normal-case font-normal">(read‑only)</span>
                        </label>
                        <input
                          type="email"
                          value={userData.email}
                          readOnly
                          tabIndex={-1}
                          className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed select-none"
                        />
                      </div>

                      {/* Phone — EDITABLE */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase text-slate-500">
                          Phone Number
                        </label>
                        <PhoneInput
                          country={'ug'}
                          value={userData.phone}
                          onChange={handlePhoneChange}
                          inputClass={`!w-full !px-12 !py-5 !text-sm !border !rounded-lg !bg-white !focus:outline-none !transition-all ${
                            errors.phone ? '!border-red-500' : '!border-slate-200'
                          }`}
                          buttonClass={`!bg-white !border !rounded-l-lg ${
                            errors.phone ? '!border-red-500' : '!border-slate-200'
                          }`}
                          containerClass="!w-full"
                        />
                        {errors.phone && (
                          <p className="text-[9px] text-red-500 font-medium">{errors.phone}</p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={isLoading}
                          className="px-6 py-2 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-2 text-[11px] font-bold bg-[#F5B841] text-white rounded-lg shadow-sm hover:bg-[#E0A83B] disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                              Saving...
                            </span>
                          ) : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* ── Right Column Cards ────────────────────────────────────── */}
                <div className="space-y-6">

                  {/* Role Card */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <h3 className="text-[10px] font-bold text-slate-800 mb-4 uppercase tracking-widest">Your Role</h3>
                    <div className="border border-[#125852] border-opacity-20 rounded-lg p-4 flex items-center justify-between bg-slate-50/30">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100">
                          <svg className="w-6 h-6 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Vendor</h4>
                          <p className="text-[9px] text-slate-400 font-medium">List products and process payouts.</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-[#125852]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>

                  {/* Identity Verification Card */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <h3 className="text-[10px] font-bold text-slate-800 mb-4 uppercase tracking-widest">Identity Verification</h3>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-50 rounded-full">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
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
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: social.color }}/>
                            <span className="text-[11px] text-slate-700 font-semibold">{social.name} Connected</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnlink(social.name)}
                            className="text-red-500 text-[9px] font-bold uppercase hover:underline cursor-pointer"
                          >
                            Unlink
                          </button>
                        </div>
                      ))}
                      {linkedSocials.length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center py-2">No accounts linked yet.</p>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-center gap-2 bg-[#FABB00] text-white py-2.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-[#e0aa00] transition-colors cursor-pointer"
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
                              className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b last:border-none transition-colors cursor-pointer"
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: social.color }}/>
                              {social.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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