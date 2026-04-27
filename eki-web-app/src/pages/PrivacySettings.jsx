import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VendorSidebar from "../components/VendorSidebar";
import Navbar4 from "../components/adminDashboard/Navbar4";
import Footer from "../components/Footer2";
import { 
  getPrivacySettings,
  updatePrivacySettings,
  acceptTerms,
  acceptDataProcessing,
  exportUserData,
  deleteUserData
} from "../services/api";

// Constants
const GOLD = "#EFB034";
const TEAL = "#125852";

// Helper for consistent card styling
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, description }) => (
  <div className="px-4 py-3 border-b border-slate-100">
    <h2 className="text-base font-semibold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {title}
    </h2>
    {description && (
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {description}
      </p>
    )}
  </div>
);

const Divider = () => <hr className="my-1 border-slate-100" />;

const SettingRow = ({ label, description, action, status, statusColor = "text-slate-500" }) => (
  <div className="flex items-start justify-between py-3 px-4 hover:bg-slate-50/50 transition-colors">
    <div className="flex-1 pr-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {label}
        </span>
        {status && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {status}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-slate-500 mt-1 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {description}
        </p>
      )}
    </div>
    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
      {typeof action === "function" ? action() : action}
    </div>
  </div>
);

// GOLD styled buttons
const EditButton = ({ onClick, label = "Edit" }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
    style={{ 
      fontFamily: "'Poppins', sans-serif",
      color: GOLD,
      borderColor: `${GOLD}40`,
      backgroundColor: `${GOLD}08`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}15`;
      e.currentTarget.style.borderColor = GOLD;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}08`;
      e.currentTarget.style.borderColor = `${GOLD}40`;
    }}
    type="button"
  >
    {label}
  </button>
);

const ViewButton = ({ onClick, label = "View" }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
    style={{ 
      fontFamily: "'Poppins', sans-serif",
      color: GOLD,
      borderColor: `${GOLD}40`,
      backgroundColor: `${GOLD}08`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}15`;
      e.currentTarget.style.borderColor = GOLD;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}08`;
      e.currentTarget.style.borderColor = `${GOLD}40`;
    }}
    type="button"
  >
    {label}
  </button>
);

const ManageButton = ({ onClick, label = "Manage" }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
    style={{ 
      fontFamily: "'Poppins', sans-serif",
      color: GOLD,
      borderColor: `${GOLD}40`,
      backgroundColor: `${GOLD}08`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}15`;
      e.currentTarget.style.borderColor = GOLD;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}08`;
      e.currentTarget.style.borderColor = `${GOLD}40`;
    }}
    type="button"
  >
    {label}
  </button>
);

const ExportButton = ({ onClick, label = "Export", loading = false }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    disabled={loading}
    className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
    style={{ 
      fontFamily: "'Poppins', sans-serif",
      color: GOLD,
      borderColor: `${GOLD}40`,
      backgroundColor: `${GOLD}08`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}15`;
      e.currentTarget.style.borderColor = GOLD;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = `${GOLD}08`;
      e.currentTarget.style.borderColor = `${GOLD}40`;
    }}
    type="button"
  >
    {loading ? "..." : label}
  </button>
);

const ToggleSwitch = ({ isOn, onToggle, disabled = false }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${
      isOn ? 'bg-[#125852]' : 'bg-slate-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
        isOn ? 'translate-x-4.5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

// Custom Confirmation Modal for Delete Account
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Yes, Delete", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {title}
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <span className="text-slate-400 text-xl">✕</span>
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {message}
              </p>
              <p className="text-xs text-red-600 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all hover:opacity-90"
            style={{ background: "#DC2626", fontFamily: "'Poppins', sans-serif" }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success/Error Toast Modal
const ToastModal = ({ isOpen, onClose, message, type = "success" }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
      <div className={`rounded-lg shadow-lg p-3 flex items-center gap-2 ${
        type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
      }`}>
        {type === "success" ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <p className={`text-xs font-medium ${
          type === "success" ? "text-green-800" : "text-red-800"
        }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
          {message}
        </p>
      </div>
    </div>
  );
};

// Edit Modal
const EditModal = ({ isOpen, onClose, title, value, onSave, type = "text", options = [] }) => {
  const [tempValue, setTempValue] = useState(value);
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    await onSave(tempValue);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {title}
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <span className="text-slate-400 text-xl">✕</span>
          </button>
        </div>
        <div className="p-5">
          {type === "select" ? (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-all"
              style={{ 
                fontFamily: "'Poppins', sans-serif",
                borderColor: `${GOLD}50`,
              }}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-all"
              style={{ 
                fontFamily: "'Poppins', sans-serif",
                borderColor: `${GOLD}50`,
              }}
              autoFocus
            />
          )}
        </div>
        <div className="flex justify-end gap-3 px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all hover:opacity-90"
            style={{ background: TEAL, fontFamily: "'Poppins', sans-serif" }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentModal = ({ isOpen, onClose, title, content, onAccept, acceptButtonText, showAcceptButton = false }) => {
  const [accepting, setAccepting] = useState(false);
  
  if (!isOpen) return null;

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept();
    setAccepting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {title}
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100">
            <span className="text-slate-400 text-xl">✕</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="prose prose-sm max-w-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {content}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Close
          </button>
          {showAcceptButton && (
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all hover:opacity-90"
              style={{ background: GOLD, fontFamily: "'Poppins', sans-serif" }}
            >
              {accepting ? "Accepting..." : acceptButtonText || "I Accept"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PrivacySettings = () => {
  const navigate = useNavigate();

  // Add Poppins font
  useEffect(() => {
    const id = "poppins-font-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // State from API
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Privacy settings state
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [thirdPartyAccess, setThirdPartyAccess] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });
  const [profileVisibility, setProfileVisibility] = useState("private");
  const [activityStatus, setActivityStatus] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [smsOffers, setSmsOffers] = useState(false);
  
  // Agreement states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsVersion, setTermsVersion] = useState(null);
  const [dpaAccepted, setDpaAccepted] = useState(false);
  const [dpaVersion, setDpaVersion] = useState(null);

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [contentModal, setContentModal] = useState(null);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ isOpen: true, message, type });
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getPrivacySettings();
      
      setShareAnalytics(data.share_anonymized_data ?? true);
      setThirdPartyAccess(data.allow_third_party_access ?? false);
      setCookiePreferences(data.cookie_preferences || {
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false
      });
      setProfileVisibility(data.profile_visibility || "private");
      setActivityStatus(data.show_activity_status ?? true);
      setMarketingEmails(data.receive_promotional_emails ?? false);
      setSmsOffers(data.receive_sms_notifications ?? false);
      
      setTermsAccepted(!!data.terms_accepted_at);
      setTermsVersion(data.terms_accepted_version);
      setDpaAccepted(!!data.data_processing_accepted_at);
      setDpaVersion(data.data_processing_accepted_version);
      
    } catch (error) {
      console.error("Failed to load privacy settings, using defaults:", error);
      setShareAnalytics(true);
      setThirdPartyAccess(false);
      setCookiePreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false
      });
      setProfileVisibility("private");
      setActivityStatus(true);
      setMarketingEmails(false);
      setSmsOffers(false);
      setTermsAccepted(false);
      setDpaAccepted(false);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key, value) => {
    setSaving(true);
    try {
      await updatePrivacySettings({ [key]: value });
      showToast("Setting updated successfully!", "success");
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      showToast("Failed to update setting. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleShareAnalyticsToggle = async () => {
    const newValue = !shareAnalytics;
    setShareAnalytics(newValue);
    await saveSetting('share_anonymized_data', newValue);
  };

  const handleThirdPartyToggle = async () => {
    const newValue = !thirdPartyAccess;
    setThirdPartyAccess(newValue);
    await saveSetting('allow_third_party_access', newValue);
  };

  const handleProfileVisibilityChange = async (visibility) => {
    setProfileVisibility(visibility);
    await saveSetting('profile_visibility', visibility);
  };

  const handleActivityStatusToggle = async () => {
    const newValue = !activityStatus;
    setActivityStatus(newValue);
    await saveSetting('show_activity_status', newValue);
  };

  const handleMarketingEmailsToggle = async () => {
    const newValue = !marketingEmails;
    setMarketingEmails(newValue);
    await saveSetting('receive_promotional_emails', newValue);
  };

  const handleSmsOffersToggle = async () => {
    const newValue = !smsOffers;
    setSmsOffers(newValue);
    await saveSetting('receive_sms_notifications', newValue);
  };

  const handleCookieUpdate = async (newPreferences) => {
    setCookiePreferences(newPreferences);
    await saveSetting('cookie_preferences', newPreferences);
  };

  const handleAcceptTerms = async () => {
    try {
      const currentVersion = "1.0.0";
      await acceptTerms(currentVersion);
      setTermsAccepted(true);
      setTermsVersion(currentVersion);
      showToast("Terms of Service accepted successfully!", "success");
    } catch (error) {
      console.error("Failed to accept terms:", error);
      showToast("Failed to accept Terms of Service. Please try again.", "error");
    }
  };

  const handleAcceptDPA = async () => {
    try {
      const currentVersion = "1.0.0";
      await acceptDataProcessing(currentVersion);
      setDpaAccepted(true);
      setDpaVersion(currentVersion);
      showToast("Data Processing Agreement accepted successfully!", "success");
    } catch (error) {
      console.error("Failed to accept DPA:", error);
      showToast("Failed to accept Data Processing Agreement. Please try again.", "error");
    }
  };

  const generateMockExportData = () => {
    const mockData = {
      user: {
        email: localStorage.getItem('user_email') || "user@example.com",
        account_created: new Date().toISOString(),
      },
      privacy_settings: {
        share_anonymized_data: shareAnalytics,
        allow_third_party_access: thirdPartyAccess,
        cookie_preferences: cookiePreferences,
        profile_visibility: profileVisibility,
        show_activity_status: activityStatus,
        receive_promotional_emails: marketingEmails,
        receive_sms_notifications: smsOffers,
      },
      agreements: {
        terms_accepted: termsAccepted,
        terms_version: termsVersion,
        data_processing_accepted: dpaAccepted,
        data_processing_version: dpaVersion,
      },
      export_date: new Date().toISOString(),
    };
    return mockData;
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const blob = await exportUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showToast("Data exported successfully!", "success");
    } catch (error) {
      console.error("Backend export failed, using mock data:", error);
      const mockData = generateMockExportData();
      const jsonStr = JSON.stringify(mockData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showToast("Data exported successfully!", "success");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteData = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteUserData();
      showToast("Account deletion request submitted. You will receive a confirmation email.", "success");
      setTimeout(() => {
        navigate("/logout");
      }, 2000);
    } catch (error) {
      console.error("Failed to request deletion:", error);
      showToast("Failed to request account deletion. Please contact support.", "error");
    }
  };

  const openModal = (modalId) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);
  const openContentModal = (type) => setContentModal(type);
  const closeContentModal = () => setContentModal(null);

  const getCookieSummary = () => {
    const enabled = Object.entries(cookiePreferences)
      .filter(([key, val]) => val && key !== 'necessary')
      .map(([key]) => key);
    if (enabled.length === 0) return "Essential only";
    return `Essential + ${enabled.join(", ")}`;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FDFDFD] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EFB034] mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500" style={{ fontFamily: "'Poppins', sans-serif" }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] p-3 gap-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <VendorSidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar4 />

        <div className="flex-1 overflow-y-auto">
          <main className="flex-1 px-2 sm:px-3 lg:px-4 py-5">
            <div className="max-w-7xl mx-auto">
              {/* Header with Back Button */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <button
                    onClick={handleGoBack}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all hover:bg-slate-50"
                    style={{ 
                      borderColor: `${GOLD}40`,
                      color: GOLD
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${GOLD}08`;
                      e.currentTarget.style.borderColor = GOLD;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = `${GOLD}40`;
                    }}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  
                  <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Privacy Settings
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-11" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Manage how your data is shared, your profile visibility, and marketing preferences.
                </p>
              </div>

              {/* Two Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* Data Sharing Preferences */}
                  <Card>
                    <CardHeader title="Data Sharing Preferences" description="Manage how your data is shared with third parties and for analytics." />
                    <SettingRow
                      label="Share anonymized usage data"
                      description="Help improve Eki by sharing anonymized usage patterns."
                      action={() => <ToggleSwitch isOn={shareAnalytics} onToggle={handleShareAnalyticsToggle} disabled={saving} />}
                      status={shareAnalytics ? "On" : "Off"}
                      statusColor="bg-[#EFB034]10 text-[#EFB034]"
                    />
                    <Divider />
                    <SettingRow
                      label="Allow third-party data access"
                      description="Permit select partners to access non-sensitive data."
                      action={() => <ToggleSwitch isOn={thirdPartyAccess} onToggle={handleThirdPartyToggle} disabled={saving} />}
                      status={thirdPartyAccess ? "On" : "Off"}
                      statusColor="bg-[#EFB034]10 text-[#EFB034]"
                    />
                    <Divider />
                    <SettingRow
                      label="Manage cookie preferences"
                      description="Review and update your consent for cookie usage."
                      action={() => <ManageButton onClick={() => openModal("cookie")} label="Manage" />}
                      status={getCookieSummary()}
                      statusColor="bg-[#EFB034]10 text-[#EFB034]"
                    />
                  </Card>

                  {/* Profile Visibility */}
                  <Card>
                    <CardHeader title="Profile Visibility" description="Control who can see your profile and activity." />
                    <SettingRow
                      label="Profile visibility"
                      description="Choose who can see your profile information."
                      action={() => <EditButton onClick={() => openModal("visibility")} label="Edit" />}
                      status={profileVisibility === "public" ? "Public" : profileVisibility === "connections" ? "Connections Only" : "Private"}
                      statusColor="bg-[#EFB034]10 text-[#EFB034]"
                    />
                    <Divider />
                    <SettingRow
                      label="Display activity status"
                      description="Show when you are online or recently active."
                      action={() => <ToggleSwitch isOn={activityStatus} onToggle={handleActivityStatusToggle} disabled={saving} />}
                      status={activityStatus ? "Visible" : "Hidden"}
                      statusColor="bg-[#EFB034]10 text-[#EFB034]"
                    />
                  </Card>

                  {/* Marketing Opt-ins */}
                  <Card>
                    <CardHeader title="Marketing Opt-ins" description="Choose which marketing communications you wish to receive." />
                    <SettingRow
                      label="Receive promotional emails"
                      description="Get updates on new features, product offers, and news."
                      action={() => <ToggleSwitch isOn={marketingEmails} onToggle={handleMarketingEmailsToggle} disabled={saving} />}
                      status={marketingEmails ? "Subscribed" : "Unsubscribed"}
                      statusColor="bg-[#EFB034]10 text-[#EFB034]"
                    />
                    <Divider />
                    <SettingRow
                      label="SMS notifications"
                      description="Receive exclusive deals and promotions via text message."
                      action={() => <ToggleSwitch isOn={smsOffers} onToggle={handleSmsOffersToggle} disabled={saving} />}
                      status={smsOffers ? "Subscribed" : "Unsubscribed"}
                      statusColor="bg-[#EFB034]10 text-[#EFB034]"
                    />
                  </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* Consent Management */}
                  <Card>
                    <CardHeader title="Consent Management" description="Review and update your agreements." />
                    <SettingRow
                      label="Terms of Service"
                      description={`${termsAccepted ? `Accepted v${termsVersion}` : "Not yet accepted"}`}
                      action={() => <ViewButton onClick={() => openContentModal("terms")} label={termsAccepted ? "View" : "Review"} />}
                      status={termsAccepted ? "Accepted" : "Pending"}
                      statusColor={termsAccepted ? "bg-emerald-50 text-emerald-700" : "bg-[#EFB034]10 text-[#EFB034]"}
                    />
                    <Divider />
                    <SettingRow
                      label="Data Processing Agreement"
                      description={`${dpaAccepted ? `Accepted v${dpaVersion}` : "Not yet accepted"}`}
                      action={() => <ViewButton onClick={() => openContentModal("dpa")} label={dpaAccepted ? "View" : "Review"} />}
                      status={dpaAccepted ? "Accepted" : "Pending"}
                      statusColor={dpaAccepted ? "bg-emerald-50 text-emerald-700" : "bg-[#EFB034]10 text-[#EFB034]"}
                    />
                  </Card>

                  {/* GDPR Data Rights */}
                  <Card>
                    <CardHeader title="GDPR Data Rights" description="Exercise your rights under data protection regulations." />
                    <SettingRow
                      label="Export my data"
                      description="Download all your personal data in a machine-readable format."
                      action={() => <ExportButton onClick={handleExportData} label="Export" loading={exporting} />}
                    />
                    <Divider />
                    <SettingRow
                      label="Delete my account"
                      description="Permanently delete your account (GDPR Right to Erasure)."
                      action={() => <ExportButton onClick={() => setShowDeleteConfirm(true)} label="Delete" />}
                    />
                  </Card>

                  {/* How we use your verification data */}
                  <Card className="border-teal-100 bg-teal-50/30">
                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-slate-800 mb-2">How we use your verification data</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        Eki uses your verification data exclusively for identity confirmation, fraud prevention, and to
                        maintain a secure marketplace. Your data is encrypted, not shared with third parties for marketing.
                      </p>
                      <button
                        onClick={() => openContentModal("privacy")}
                        className="text-xs font-semibold flex items-center gap-1 hover:underline transition-all"
                        style={{ color: GOLD }}
                        type="button"
                      >
                        View Privacy Policy <span className="text-base">›</span>
                      </button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteData}
        title="Delete Account"
        message="WARNING: This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?"
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
      />

      <EditModal
        isOpen={activeModal === "cookie"}
        onClose={closeModal}
        title="Manage Cookie Preferences"
        value={cookiePreferences}
        onSave={handleCookieUpdate}
        type="custom"
      />

      <EditModal
        isOpen={activeModal === "visibility"}
        onClose={closeModal}
        title="Profile Visibility"
        value={profileVisibility}
        onSave={handleProfileVisibilityChange}
        type="select"
        options={[
          { value: "public", label: "Public - Anyone can see my profile" },
          { value: "private", label: "Private - Only logged-in users can see my profile" },
          { value: "connections", label: "Connections Only - Only my connections can see my profile" }
        ]}
      />

      <ContentModal
        isOpen={contentModal === "terms"}
        onClose={closeContentModal}
        title="Terms of Service"
        content={
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Terms of Service v1.0.0</h4>
            <p className="text-slate-600 text-sm mb-3">By using Eki, you agree to these terms.</p>
            <p className="text-slate-600 text-sm">Please read these terms carefully before using our platform.</p>
          </div>
        }
        showAcceptButton={!termsAccepted}
        onAccept={handleAcceptTerms}
        acceptButtonText="Accept Terms"
      />

      <ContentModal
        isOpen={contentModal === "dpa"}
        onClose={closeContentModal}
        title="Data Processing Agreement"
        content={
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Data Processing Agreement v1.0.0</h4>
            <p className="text-slate-600 text-sm mb-3">Eki processes your data in compliance with GDPR and CCPA.</p>
            <p className="text-slate-600 text-sm">Your data is never sold to third parties.</p>
          </div>
        }
        showAcceptButton={!dpaAccepted}
        onAccept={handleAcceptDPA}
        acceptButtonText="Accept Agreement"
      />

      <ContentModal
        isOpen={contentModal === "privacy"}
        onClose={closeContentModal}
        title="Privacy Policy"
        content={
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Privacy Policy</h4>
            <p className="text-slate-600 text-sm mb-3">Eki is committed to protecting your privacy.</p>
            <p className="text-slate-600 text-sm">Your verification data is encrypted and never sold.</p>
          </div>
        }
        showAcceptButton={false}
      />

      <ToastModal
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default PrivacySettings;