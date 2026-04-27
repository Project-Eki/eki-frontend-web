import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Menu, CheckCheck, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  getVendorProfile,
  getOrderNotifications,
  markOrderNotificationRead,
} from "../../services/authService";
import {
  getAdminNotifications,
  markNotificationRead,
} from "../../services/api";

// Admin notification styles
const ADMIN_NOTIF_TYPE_STYLE = {
  new_vendor: { dot: "bg-blue-500" },
  vendor_approved: { dot: "bg-green-500" },
  vendor_rejected: { dot: "bg-red-500" },
  vendor_suspended: { dot: "bg-orange-500" },
  flagged_content: { dot: "bg-yellow-500" },
  disputed_transaction: { dot: "bg-red-500" },
  high_value_transaction: { dot: "bg-purple-500" },
  system_alert: { dot: "bg-red-500" },
};

// Vendor notification styles
const VENDOR_NOTIF_TYPE_STYLE = {
  new_order: { label: "New order received", dot: "bg-teal-500" },
  order_cancelled: { label: "Order cancelled", dot: "bg-red-500" },
  order_completed: { label: "Order completed", dot: "bg-green-500" },
  payment_received: { label: "Payment received", dot: "bg-green-500" },
  payment_failed: { label: "Payment failed", dot: "bg-red-500" },
  payment_reversed: { label: "Payment reversed", dot: "bg-orange-500" },
  flagged_content: { label: "Content flagged", dot: "bg-yellow-500" },
  dispute_opened: { label: "Dispute opened", dot: "bg-red-500" },
  dispute_resolved: { label: "Dispute resolved", dot: "bg-blue-500" },
  low_stock: { label: "Low stock alert", dot: "bg-orange-500" },
  profile_approved: { label: "Profile approved", dot: "bg-green-500" },
  profile_suspended: { label: "Account suspended", dot: "bg-red-500" },
};

const Navbar4 = ({ userName = "", onMenuClick, profileImage = null }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [profileName, setProfileName] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState(profileImage);
  const [avatarError, setAvatarError] = useState(false);
  const [userRole, setUserRole] = useState("");

  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Get user role on mount
  useEffect(() => {
    const role =
      localStorage.getItem("userRole") ||
      localStorage.getItem("user_role") ||
      "";
    setUserRole(role.toLowerCase());
  }, []);

  useEffect(() => {
    if (profileImage !== null && profileImage !== undefined) {
      setAvatarUrl(profileImage);
      setAvatarError(false);
    }
  }, [profileImage]);

  useEffect(() => {
    if (userName) setProfileName(userName);
  }, [userName]);

  // ─── Fetch profile based on user role ───────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const role =
          localStorage.getItem("userRole") ||
          localStorage.getItem("user_role") ||
          "";
        const isAdmin = role.toLowerCase() === "admin";

        if (isAdmin) {
          // Admin profile
          const res = await api.get("/accounts/admin/settings/");
          const data = res.data?.data ?? res.data;
          const name = [data?.profile?.first_name, data?.profile?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
          if (name) setProfileName(name);
          if (data?.profile?.profile_picture_url && !profileImage) {
            setAvatarUrl(data.profile.profile_picture_url);
            setAvatarError(false);
          }
        } else if (role.toLowerCase() === "vendor") {
          // Vendor profile
          const data = await getVendorProfile();
          const name = [data?.first_name, data?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
          if (name && !userName) setProfileName(name);
          if (data?.profile_picture && !profileImage) {
            setAvatarUrl(data.profile_picture);
            setAvatarError(false);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, [userName, profileImage]);

  // ─── Load notifications based on user role ───────────────────────────────────
  const loadNotifications = async () => {
    try {
      const role =
        localStorage.getItem("userRole") ||
        localStorage.getItem("user_role") ||
        "";
      const isAdmin = role.toLowerCase() === "admin";

      if (isAdmin) {
        // Load admin notifications
        const response = await getAdminNotifications({ limit: 15 });
        const payload = response.data || response;
        const items =
          payload.data?.notifications || payload.notifications || [];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.is_read).length);
      } else if (role.toLowerCase() === "vendor") {
        // Load vendor notifications
        const country = localStorage.getItem("vendor_country") || "";
        const branch_location =
          localStorage.getItem("vendor_branch_location") || "";
        const data = await getOrderNotifications({
          limit: 15,
          country,
          branch_location,
        });
        const items = data?.notifications ?? [];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (userRole) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setShowNotifPanel(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read (handles both admin and vendor)
  const handleMarkRead = async (notifId) => {
    try {
      const role =
        localStorage.getItem("userRole") ||
        localStorage.getItem("user_role") ||
        "";
      const isAdmin = role.toLowerCase() === "admin";

      if (isAdmin) {
        await markNotificationRead(notifId);
      } else {
        await markOrderNotificationRead(notifId);
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const role =
        localStorage.getItem("userRole") ||
        localStorage.getItem("user_role") ||
        "";
      const isAdmin = role.toLowerCase() === "admin";
      const unread = notifications.filter((n) => !n.is_read);

      if (isAdmin) {
        await api.post("/accounts/admin/notifications/mark-read/", {
          mark_all: true,
        });
      } else {
        await Promise.all(unread.map((n) => markOrderNotificationRead(n.id)));
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const renderAvatar = () => {
    if (avatarUrl && !avatarError) {
      return (
        <img
          src={avatarUrl}
          alt={profileName}
          className="w-full h-full object-cover"
          onError={() => setAvatarError(true)}
        />
      );
    }

    const initials = profileName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

    if (initials) {
      return (
        <span className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold bg-slate-500">
          {initials}
        </span>
      );
    }

    return <UserCircle className="w-full h-full text-slate-400" />;
  };

  // Get appropriate notification style based on role and type
  const getNotifStyle = (notif) => {
    const isAdmin = userRole === "admin";
    if (isAdmin) {
      return (
        ADMIN_NOTIF_TYPE_STYLE[notif.notification_type] || {
          dot: "bg-slate-400",
        }
      );
    }
    return (
      VENDOR_NOTIF_TYPE_STYLE[notif.notification_type] || {
        dot: "bg-slate-400",
      }
    );
  };

  // Navigate to correct settings page based on role
  const handleAvatarClick = () => {
    const role =
      localStorage.getItem("userRole") ||
      localStorage.getItem("user_role") ||
      "";
    if (role.toLowerCase() === "admin") {
      navigate("/admin-account-settings");
    } else {
      navigate("/account-settings");
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200 rounded-b-2xl sticky top-0 z-50 h-14 shrink-0 shadow-sm">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors mr-1.5"
        >
          <Menu size={18} />
        </button>

        <div className="w-6 md:w-0" />

        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-[#EFB034] focus:border-[#EFB034] text-xs transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Bell - Notifications */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowNotifPanel((prev) => !prev)}
              className="relative text-slate-500 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-[#125852] bg-[#E0F2F1] px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-400">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const typeInfo = getNotifStyle(notif);
                      return (
                        <div
                          key={notif.id}
                          onClick={() =>
                            !notif.is_read && handleMarkRead(notif.id)
                          }
                          className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors ${
                            !notif.is_read
                              ? "bg-[#E0F2F1]/30 hover:bg-[#E0F2F1]/50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-1 shrink-0 ${typeInfo.dot}`}
                            />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-800">
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {notif.time_ago}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className="w-1.5 h-1.5 bg-[#125852] rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && unreadCount > 0 && (
                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/30 flex justify-center">
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-medium text-[#125852] hover:text-[#0e4440] flex items-center gap-1"
                    >
                      <CheckCheck size={10} /> Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
            <div
              onClick={handleAvatarClick}
              title="Account Settings"
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-300 cursor-pointer shrink-0 bg-slate-100 hover:opacity-80 transition-opacity"
            >
              {renderAvatar()}
            </div>
            {profileName && (
              <span className="hidden md:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                {profileName.split(" ")[0]}
              </span>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar4;
