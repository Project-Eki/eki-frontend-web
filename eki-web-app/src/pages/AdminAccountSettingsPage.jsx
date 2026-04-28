import React, { useState, useRef, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar4";
import Footer from "../components/Vendormanagement/VendorFooter";
import { getAdminSettings, updateAdminSettings } from "../services/api";

function AdminAccountSettingsPage() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: null,
    profileImageFile: null,
    department: "operations",
  });

  const [permissions, setPermissions] = useState({
    can_verify_vendors: false,
    can_manage_users: false,
    can_view_financials: false,
    can_manage_admins: false,
    access_level: "standard",
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: {},
    in_app_notifications: {},
  });

  const [interfacePrefs, setInterfacePrefs] = useState({
    theme: "light",
    language: "en",
    timezone: "Africa/Kampala",
    items_per_page: 20,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [navbarProfileImage, setNavbarProfileImage] = useState(null);
  const [navbarName, setNavbarName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const photoMenuRef = useRef(null);

  // Function to refresh all settings from API
  const refreshAllSettings = async () => {
    try {
      const res = await getAdminSettings();
      const settings = res.data;

      setUserData({
        firstName: settings.profile.first_name || "",
        lastName: settings.profile.last_name || "",
        email: settings.profile.email || "",
        phone: settings.profile.phone_number || "",
        profileImage: settings.profile.profile_picture_url || null,
        profileImageFile: null,
        department: settings.permissions.department || "operations",
      });

      setPermissions(settings.permissions);
      setNotificationPrefs(settings.notification_preferences);
      setInterfacePrefs(settings.interface_preferences);
      setRecentActivity(settings.recent_activity || []);

      const fullName =
        `${settings.profile.first_name || ""} ${settings.profile.last_name || ""}`.trim();
      setNavbarProfileImage(settings.profile.profile_picture_url);
      setNavbarName(fullName || settings.profile.email);

      return true;
    } catch (err) {
      console.error("Failed to refresh settings:", err);
      return false;
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      setProfileLoading(true);
      try {
        const res = await getAdminSettings();
        const settings = res.data;

        setUserData({
          firstName: settings.profile.first_name || "",
          lastName: settings.profile.last_name || "",
          email: settings.profile.email || "",
          phone: settings.profile.phone_number || "",
          profileImage: settings.profile.profile_picture_url || null,
          profileImageFile: null,
          department: settings.permissions.department || "operations",
        });

        setPermissions(settings.permissions);
        setNotificationPrefs(settings.notification_preferences);
        setInterfacePrefs(settings.interface_preferences);
        setRecentActivity(settings.recent_activity || []);

        const fullName =
          `${settings.profile.first_name || ""} ${settings.profile.last_name || ""}`.trim();
        setNavbarProfileImage(settings.profile.profile_picture_url);
        setNavbarName(fullName || settings.profile.email);
      } catch (err) {
        console.error("Failed to load admin settings:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target)) {
        setPhotoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const openPhotoMenu = () => setPhotoMenuOpen((prev) => !prev);
  const handleChooseFile = () => {
    setPhotoMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setUserData((prev) => ({
      ...prev,
      profileImage: URL.createObjectURL(file),
      profileImageFile: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveSuccess(false);

    try {
      const updateData = {};

      let formattedPhone = userData.phone;
      if (formattedPhone) {
        formattedPhone = formattedPhone.replace(/\s/g, "");
        if (!formattedPhone.startsWith("+")) {
          if (formattedPhone.startsWith("0")) {
            formattedPhone = "+256" + formattedPhone.substring(1);
          } else {
            formattedPhone = "+" + formattedPhone;
          }
        }
      }

      if (
        userData.firstName ||
        userData.lastName ||
        userData.phone ||
        userData.department
      ) {
        updateData.profile = {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_number: formattedPhone,
          department: userData.department,
        };
      }

      if (userData.profileImageFile instanceof File) {
        updateData.profile_picture = userData.profileImageFile;
      }

      const response = await updateAdminSettings(updateData);

      if (response.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await refreshAllSettings();
      }
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await updateAdminSettings({
        password: {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password,
        },
      });

      setSaveSuccess(true);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordError("");
      setTimeout(() => setSaveSuccess(false), 3000);
      await refreshAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (category, key) => {
    // Optimistically update UI
    const newPrefs = { ...notificationPrefs };
    const currentValue = newPrefs[category][key];
    newPrefs[category][key] = !currentValue;
    setNotificationPrefs(newPrefs);

    try {
      await updateAdminSettings({
        notification_preferences: { [category]: { [key]: !currentValue } },
      });
      // Refresh to ensure UI matches server state
      await refreshAllSettings();
    } catch (err) {
      console.error("Failed to update notification preferences:", err);
      // Revert on error
      newPrefs[category][key] = currentValue;
      setNotificationPrefs(newPrefs);
      alert("Failed to update notification preferences");
    }
  };

  const handleInterfaceChange = async (key, value) => {
    // Optimistically update UI
    const oldValue = interfacePrefs[key];
    setInterfacePrefs({ ...interfacePrefs, [key]: value });

    try {
      await updateAdminSettings({
        interface_preferences: { [key]: value },
      });
      // Refresh to ensure UI matches server state
      await refreshAllSettings();
    } catch (err) {
      console.error("Failed to update interface preferences:", err);
      // Revert on error
      setInterfacePrefs({ ...interfacePrefs, [key]: oldValue });
      alert("Failed to update interface preferences");
    }
  };

  const getInitials = () => {
    const f = userData.firstName?.trim()[0] || "";
    const l = userData.lastName?.trim()[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  if (profileLoading) {
    return (
      <div className="flex h-screen bg-[#ecece7]">
        <Sidebar activePage="settings" />
        <div className="flex-1 flex flex-col">
          <Navbar3 profileImage={null} userName="" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">Loading settings...</div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#ecece7]">
      <Sidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar3 profileImage={navbarProfileImage} userName={navbarName} />

        <main className="flex-1 p-5 max-w-[1400px] mx-auto w-full pb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">
              Account Settings
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Manage your profile, security, and preferences
            </p>

            {saveSuccess && (
              <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-[11px] text-green-700 font-semibold flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Settings saved successfully!
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-t-xl border-b border-slate-200">
              <div className="flex gap-1 px-4">
                {[
                  "profile",
                  "security",
                  "notifications",
                  "appearance",
                  "activity",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "text-[#125852] border-b-2 border-[#125852]"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm p-6">
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div>
                  {/* Profile Picture Section */}
                  <div className="flex items-center gap-6 pb-6 mb-6 border-b border-slate-100">
                    <div className="relative" ref={photoMenuRef}>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#125852] to-[#0a3a36] flex items-center justify-center overflow-hidden">
                        {userData.profileImage ? (
                          <img
                            src={userData.profileImage}
                            className="w-full h-full object-cover"
                            alt="profile"
                          />
                        ) : (
                          <span className="text-xl font-medium text-white">
                            {getInitials()}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={openPhotoMenu}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-slate-200 hover:bg-slate-50"
                      >
                        <svg
                          className="w-3 h-3 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </button>
                    </div>
                    {photoMenuOpen && (
                      <div className="absolute mt-20 ml-16 w-44 bg-white rounded-lg shadow-lg border border-slate-100 z-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={handleChooseFile}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                        >
                          Upload new photo
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div>
                      <p className="text-sm text-slate-600">
                        Upload a profile picture
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        JPG, PNG or WebP, max 5MB
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        First name
                      </label>
                      <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Last name
                      </label>
                      <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) =>
                          setUserData({ ...userData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Phone number
                      </label>
                      <PhoneInput
                        country={"ug"}
                        value={userData.phone}
                        onChange={(value) =>
                          setUserData({ ...userData, phone: value })
                        }
                        containerClass="!w-full"
                        inputClass="!w-full !py-2 !text-sm !border-slate-200 focus:!ring-[#125852]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Department
                      </label>
                      <select
                        value={userData.department}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            department: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                      >
                        <option value="operations">Operations</option>
                        <option value="compliance">
                          Compliance & Verification
                        </option>
                        <option value="support">Customer Support</option>
                        <option value="finance">Finance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={
                          permissions.access_level === "superadmin"
                            ? "Super Administrator"
                            : "Administrator"
                        }
                        disabled
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-6 py-2 text-sm font-medium text-white rounded-lg bg-[#EFB034] hover:bg-[#d4992a] disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs text-amber-700">
                        Password must be at least 8 characters and include a mix
                        of letters, numbers, and symbols.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Current password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        New password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                      />
                      {passwordError && (
                        <p className="text-xs text-red-500 mt-1">
                          {passwordError}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-medium text-white rounded-lg bg-[#EFB034] hover:bg-[#d4992a] disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? "Updating..." : "Update password"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">
                      Email notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(
                        notificationPrefs.email_notifications || {},
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-3 border-b border-slate-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-700 capitalize">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-slate-400">
                              Receive email updates for this activity
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleNotificationToggle(
                                "email_notifications",
                                key,
                              )
                            }
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                              value ? "bg-[#125852]" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                value ? "translate-x-5" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">
                      In-app notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(
                        notificationPrefs.in_app_notifications || {},
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-3 border-b border-slate-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-700 capitalize">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-slate-400">
                              Show notifications inside the dashboard
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleNotificationToggle(
                                "in_app_notifications",
                                key,
                              )
                            }
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                              value ? "bg-[#125852]" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                value ? "translate-x-5" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === "appearance" && (
                <div className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Theme preference
                    </label>
                    <select
                      value={interfacePrefs.theme}
                      onChange={(e) =>
                        handleInterfaceChange("theme", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                    >
                      <option value="light">Light mode</option>
                      <option value="dark">Dark mode</option>
                      <option value="system">System default</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Language
                    </label>
                    <select
                      value={interfacePrefs.language}
                      onChange={(e) =>
                        handleInterfaceChange("language", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                    >
                      <option value="en">English (US)</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Timezone
                    </label>
                    <select
                      value={interfacePrefs.timezone}
                      onChange={(e) =>
                        handleInterfaceChange("timezone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                    >
                      <option value="Africa/Kampala">
                        Africa/Kampala (EAT)
                      </option>
                      <option value="Africa/Nairobi">
                        Africa/Nairobi (EAT)
                      </option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Items per page
                    </label>
                    <input
                      type="number"
                      value={interfacePrefs.items_per_page}
                      onChange={(e) =>
                        handleInterfaceChange(
                          "items_per_page",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125852]"
                      min="10"
                      max="100"
                      step="10"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      How many rows to show in tables (10-100)
                    </p>
                  </div>
                </div>
              )}

              {/* ACTIVITY TAB */}
              {activeTab === "activity" && (
                <div>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-500">No recent activity</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Your actions will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentActivity.map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 py-3 border-b border-slate-50"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-slate-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 capitalize">
                              {activity.action?.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Target: {activity.target_name || "—"} • IP:{" "}
                              {activity.ip_address || "—"}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 whitespace-nowrap">
                            {activity.time_ago}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default AdminAccountSettingsPage;
