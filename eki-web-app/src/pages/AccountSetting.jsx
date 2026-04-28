import React, { useState, useRef, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import VendorSidebar from '../components/VendorSidebar';
import { VendorProvider } from '../context/vendorContext';
import Navbar3 from '../components/adminDashboard/Navbar4';
import { validateAccountData } from '../utils/validationUtils';
import { getVendorProfile, updateVendorProfile } from '../services/authService';
import Footer from '../components/Vendormanagement/VendorFooter';

const monthsBetween = (dateA, dateB) => {
  return (
    (dateB.getFullYear() - dateA.getFullYear()) * 12 +
    (dateB.getMonth() - dateA.getMonth())
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

function AccountSettingsPage() {
  const [userData, setUserData] = useState({
    firstName:        '',
    lastName:         '',
    email:            '',
    phone:            '',
    profileImage:     null,
    profileImageFile: null,
    phoneSetDate:     null,
  });

  const [tempPhone,      setTempPhone]      = useState('');
  const [tempPhoneError, setTempPhoneError] = useState('');

  const [navbarProfileImage, setNavbarProfileImage] = useState(null);
  const [navbarName,         setNavbarName]         = useState('');

  const [isLoading,      setIsLoading]      = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors,         setErrors]         = useState({});
  const [saveSuccess,    setSaveSuccess]    = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [showCamera,    setShowCamera]    = useState(false);
  const [cameraStream,  setCameraStream]  = useState(null);
  const [cameraError,   setCameraError]   = useState('');

  const fileInputRef  = useRef(null);
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const photoMenuRef  = useRef(null);

  const isPrimaryPhoneLocked = () => {
    if (!userData.phoneSetDate) return false;
    const setDate = new Date(userData.phoneSetDate);
    const now     = new Date();
    return monthsBetween(setDate, now) < 6;
  };

  const primaryPhoneUnlockDate = () => {
    if (!userData.phoneSetDate) return '';
    const d = new Date(userData.phoneSetDate);
    d.setMonth(d.getMonth() + 6);
    return formatDate(d.toISOString());
  };

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        // Check if user is actually a vendor
        const role =
          localStorage.getItem("userRole") ||
          localStorage.getItem("user_role") ||
          "";

        if (role.toLowerCase() !== "vendor") {
          // Not a vendor - redirect or show error
          console.log("Not a vendor user, redirecting...");
          // Optionally redirect to admin settings
          // window.location.href = "/admin-account-settings";
          setProfileLoading(false);
          return;
        }
        const res = await getVendorProfile();
        const remoteImage = res.profile_picture || null;
        const fullName = [res.first_name, res.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();

        const storedPhoneSetDate =
          localStorage.getItem("vendor_phone_set_date") ||
          (res.business_phone || res.phone_number
            ? new Date().toISOString()
            : null);

        setUserData({
          firstName: res.first_name || "",
          lastName: res.last_name || "",
          email: res.email || "",
          phone: res.business_phone || res.phone_number || "",
          profileImage: remoteImage,
          profileImageFile: null,
          phoneSetDate: storedPhoneSetDate,
        });

        const savedTempPhone = localStorage.getItem("vendor_temp_phone") || "";
        setTempPhone(savedTempPhone);
        setNavbarProfileImage(remoteImage);
        setNavbarName(fullName);
      } catch (err) {
        console.error('Failed to load profile:', err);
        if (err.response?.status === 403) {
          window.location.href = "/admin-account-settings";
        }
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target)) {
        setPhotoMenuOpen(false);
        setCameraError('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (!cameraError) return;
    const timer = setTimeout(() => setCameraError(''), 5000);
    return () => clearTimeout(timer);
  }, [cameraError]);

  useEffect(() => {
    if (!showCamera && cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  }, [showCamera]);

  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  useEffect(() => {
    const id = 'poppins-font-link';
    if (!document.getElementById(id)) {
      const link  = document.createElement('link');
      link.id     = id;
      link.rel    = 'stylesheet';
      link.href   = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const openPhotoMenu = () => {
    setPhotoMenuOpen(prev => {
      if (prev) setCameraError('');
      return !prev;
    });
  };

  const handleChooseFile = () => {
    setPhotoMenuOpen(false);
    setCameraError('');
    fileInputRef.current?.click();
  };

  const handleOpenCamera = async () => {
    setPhotoMenuOpen(false);
    setCameraError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera not supported. Please use "Choose from gallery" instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please use "Choose from gallery" instead.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is in use by another app. Close other apps and try again.');
      } else if (err.name === 'OverconstrainedError') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraStream(stream);
          setShowCamera(true);
        } catch {
          setCameraError('Could not access camera. Please use "Choose from gallery" instead.');
        }
      } else {
        setCameraError('Could not access camera. Please use "Choose from gallery" instead.');
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tempPhone && tempPhone.replace(/\D/g, '').length < 7) {
      setTempPhoneError('Please enter a valid temporary phone number.');
      return;
    }

    const validationErrors = validateAccountData(userData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setSaveSuccess(false);

    try {
      const changedFields = {};

      if (!isPrimaryPhoneLocked() && userData.phone) {
        let phone = String(userData.phone).replace(/\s/g, '');
        if (!phone.startsWith('+')) phone = `+${phone}`;
        changedFields.business_phone = phone;

        const now = new Date().toISOString();
        localStorage.setItem('vendor_phone_set_date', now);
        setUserData(prev => ({ ...prev, phoneSetDate: now }));
      }

      if (userData.profileImageFile instanceof File) {
        changedFields.profile_picture = userData.profileImageFile;
      }

      if (tempPhone) {
        localStorage.setItem('vendor_temp_phone', tempPhone);
      } else {
        localStorage.removeItem('vendor_temp_phone');
      }

      await updateVendorProfile(changedFields);

      const refreshed = await getVendorProfile();
      const fullName   = [refreshed.first_name, refreshed.last_name].filter(Boolean).join(' ').trim();

      setUserData(prev => ({
        ...prev,
        firstName:        refreshed.first_name     || prev.firstName,
        lastName:         refreshed.last_name      || prev.lastName,
        email:            refreshed.email          || prev.email,
        phone:            refreshed.business_phone || refreshed.phone_number || prev.phone,
        profileImage:     refreshed.profile_picture || prev.profileImage,
        profileImageFile: null,
      }));

      setNavbarProfileImage(refreshed.profile_picture || null);
      setNavbarName(fullName);

      setSaveSuccess(true);
      setTempPhoneError('');
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err) {
      console.error('Save error:', err.response?.data ?? err.message);
      const backendError =
        err.response?.data?.detail  ||
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Failed to save changes. Please try again.';

      alert(`Error: ${backendError}\n\nCheck console for details`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value) => {
    if (isPrimaryPhoneLocked()) return;
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
    setTempPhoneError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getInitials = () => {
    const f = userData.firstName?.trim()[0] || '';
    const l = userData.lastName?.trim()[0]  || '';
    return (f + l).toUpperCase() || '?';
  };

  return (
    <VendorProvider>
      <div
        style={{ fontFamily: "'Poppins', sans-serif" }}
        className="flex min-h-screen bg-[#ecece7] text-slate-800 p-3 gap-3"
      >
        <VendorSidebar activePage="settings" />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar3 profileImage={navbarProfileImage} userName={navbarName} />

          <main className="flex-1 p-5 max-w-[1400px] mx-auto w-full pb-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-xl font-bold text-[#1A1A1A] mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Account Settings
              </h1>

              {/* ── Camera Modal ─────────────────────────────────────────── */}
              {showCamera && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Take a Photo
                      </p>
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
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors"
                        style={{ backgroundColor: '#EFB034' }}
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

              {/* ── Loading Skeleton ──────────────────────────────────────── */}
              {profileLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
                        <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-3" />
                        <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto mb-2" />
                        <div className="h-2 bg-slate-100 rounded w-1/3 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                  {/* ── LEFT COLUMN ──────────────────────────────────────── */}
                  <div className="space-y-6">

                    {/* Profile Overview Card */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
                      <div className="relative inline-block mb-3" ref={photoMenuRef}>
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

                        {/* Photo menu dropdown */}
                        {photoMenuOpen && (
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                            <button
                              type="button"
                              onClick={handleChooseFile}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
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
                              style={{ fontFamily: "'Poppins', sans-serif" }}
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

                      {/* Camera Error */}
                      {cameraError && (
                        <div className="flex items-start gap-2 mt-2 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg max-w-xs mx-auto text-left">
                          <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                          <p className="text-[10px] text-red-500 font-medium flex-1 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {cameraError}
                          </p>
                          <button
                            type="button"
                            onClick={() => setCameraError('')}
                            className="font-bold text-xs leading-none shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Dismiss"
                          >×</button>
                        </div>
                      )}

                      <h2 className="text-lg font-bold text-slate-800 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {userData.firstName || userData.lastName
                          ? `${userData.firstName} ${userData.lastName}`.trim()
                          : 'Your Name'}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {userData.email || 'email@example.com'}
                      </p>
                    </div>

                    {/* Account Details Form */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                      <h3 className="text-base font-bold text-slate-800 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Account Details
                      </h3>

                      {saveSuccess && (
                        <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-[11px] text-green-700 font-semibold flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          Changes saved successfully!
                        </div>
                      )}

                      <form onSubmit={handleSubmit} noValidate className="space-y-4">

                        {/* First / Last Name (read-only) */}
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-1">
                            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              First Name
                              <span className="text-[9px] text-slate-300 normal-case font-normal">(read‑only)</span>
                            </label>
                            <input
                              type="text"
                              value={userData.firstName}
                              readOnly
                              tabIndex={-1}
                              className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed select-none"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Last Name
                              <span className="text-[9px] text-slate-300 normal-case font-normal">(read‑only)</span>
                            </label>
                            <input
                              type="text"
                              value={userData.lastName}
                              readOnly
                              tabIndex={-1}
                              className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed select-none"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            />
                          </div>
                        </div>

                        {/* Email (read-only) */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Email Address
                            <span className="text-[9px] text-slate-300 normal-case font-normal">(read‑only)</span>
                          </label>
                          <input
                            type="email"
                            value={userData.email}
                            readOnly
                            tabIndex={-1}
                            className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed select-none"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          />
                        </div>

                        {/* ── Primary Phone Number ──────────────────────────── */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Phone Number
                            {isPrimaryPhoneLocked() && (
                              <span className="text-[9px] text-slate-800 normal-case font-semibold flex items-center gap-0.5 ml-1">
                                {/* Padlock icon — BLACK */}
                                <svg className="w-2.5 h-2.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                </svg>
                                locked until {primaryPhoneUnlockDate()}
                              </span>
                            )}
                          </label>

                          {isPrimaryPhoneLocked() ? (
                            <div className="relative">
                              <input
                                type="text"
                                value={userData.phone ? `+${userData.phone}` : ''}
                                readOnly
                                tabIndex={-1}
                                className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed select-none"
                                style={{ fontFamily: "'Poppins', sans-serif" }}
                              />
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                {/* Lock icon in field — BLACK */}
                                <svg className="w-3.5 h-3.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                </svg>
                              </div>
                            </div>
                          ) : (
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
                          )}

                          {errors.phone && (
                            <p className="text-[9px] text-red-500 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {errors.phone}
                            </p>
                          )}

                          {/* Compact locked notice */}
                          {isPrimaryPhoneLocked() && (
                            <p className="text-[10px] text-slate-400 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Locked for 6 months. Add a temporary contact below to receive communications.
                            </p>
                          )}
                        </div>

                        {/* ── Temporary / Backup Contact ──────────────────── */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <label className="text-[11px] font-bold uppercase text-slate-500" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Temporary Contact
                            </label>
                            <span className="bg-amber-50 border border-amber-200 text-amber-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Optional
                            </span>
                          </div>
                          {/* Removed long description — kept minimal */}
                          <PhoneInput
                            country={'ug'}
                            value={tempPhone}
                            onChange={(value) => {
                              setTempPhone(value);
                              setTempPhoneError('');
                            }}
                            inputClass={`!w-full !px-12 !py-5 !text-sm !border !rounded-lg !bg-white !focus:outline-none !transition-all ${
                              tempPhoneError ? '!border-red-500' : '!border-slate-200'
                            }`}
                            buttonClass={`!bg-white !border !rounded-l-lg ${
                              tempPhoneError ? '!border-red-500' : '!border-slate-200'
                            }`}
                            containerClass="!w-full"
                            placeholder="Add backup number"
                          />
                          {tempPhoneError && (
                            <p className="text-[9px] text-red-500 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {tempPhoneError}
                            </p>
                          )}
                          {/* ✅ REMOVED: green success text when filling temp phone */}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="px-6 py-2 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 text-[11px] font-bold text-white rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                            style={{ backgroundColor: '#EFB034', fontFamily: "'Poppins', sans-serif" }}
                            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#d4992a'; }}
                            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#EFB034'; }}
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

                  {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
                  <div className="space-y-6">

                    {/* Role Card */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                      <h3 className="text-[10px] font-bold text-slate-800 mb-4 uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Your Role
                      </h3>
                      <div className="border border-[#125852] border-opacity-20 rounded-lg p-4 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100">
                            <svg className="w-6 h-6 text-[#125852]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Vendor</h4>
                            <p className="text-[9px] text-slate-400 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              List products and process payouts.
                            </p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-[#125852]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>

                    {/* Identity Verification Card */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                      <h3 className="text-[10px] font-bold text-slate-800 mb-4 uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Identity Verification
                      </h3>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-50 rounded-full">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>Identity Status:</h4>
                            <span className="bg-[#125852] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Verified
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-medium italic" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Your identity has been successfully verified.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Business Settings Card ── */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                      <h3 className="text-[10px] font-bold text-slate-800 mb-1 uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Business
                      </h3>
                      <p className="text-[10px] text-slate-400 mb-4 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Manage your store, payout methods, and linked accounts.
                      </p>
                      {/* Business Settings button — GOLD */}
                      <a
                        href="/business-settings"
                        className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg text-[11px] font-bold shadow-sm transition-colors cursor-pointer no-underline"
                        style={{ backgroundColor: '#EFB034', fontFamily: "'Poppins', sans-serif", display: 'flex' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4992a'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EFB034'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Business Settings
                        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </a>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </VendorProvider>
  );
}

export default AccountSettingsPage;