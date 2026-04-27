/**
 * Navbar3.jsx
 *
 * Changes:
 *  - onSearch prop added: fires on every keystroke, parent uses it to
 *    set globalSearch which is passed as externalSearch to all DataTables
 *  - Placeholder updated to "Search tables…" to reflect global scope
 *  - Notifications, avatar, mark-as-read logic unchanged
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Menu, CheckCheck, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, {
  getAdminNotifications,
  markNotificationRead,
} from "../../services/api";

const NOTIF_TYPE_STYLE = {
  new_vendor:           { dot: "bg-blue-500"   },
  vendor_approved:      { dot: "bg-green-500"  },
  vendor_rejected:      { dot: "bg-red-500"    },
  vendor_suspended:     { dot: "bg-orange-500" },
  new_dispute:          { dot: "bg-red-500"    },
  flagged_content:      { dot: "bg-yellow-500" },
  new_transaction:      { dot: "bg-teal-500"   },
  new_buyer:            { dot: "bg-purple-500" },
  document_submitted:   { dot: "bg-indigo-500" },
  disputed_transaction: { dot: "bg-red-500"    },
};

const isAdminUser = () => {
  const role =
    localStorage.getItem("userRole") || localStorage.getItem("user_role") || "";
  console.log("Checking admin status - role:", role); // Debug log
  return role.toLowerCase() === "admin";
};

const Navbar3 = ({ userName = "User", onMenuClick, profileImage = null }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [profileName, setProfileName] = useState(userName);

  // avatarUrl: starts from prop, updated by API, then kept in sync via prop changes
  const [avatarUrl, setAvatarUrl] = useState(profileImage);
  const [avatarError, setAvatarError] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const panelRef = useRef(null);
  const navigate = useNavigate();

  // ─── Keep avatar in sync when parent passes a fresh URL (after save) ─────────
  useEffect(() => {
    if (profileImage) {
      setAvatarUrl(profileImage);
      setAvatarError(false); // reset error so the new image tries to load
    }
  }, [profileImage]);

  // ─── Fetch vendor profile for name + avatar on mount ─────────────────────────
  // IMPORTANT: api baseURL = 'http://134.122.22.45' (no /api/v1 suffix)
  // So we use the FULL path here: /api/v1/accounts/vendor/profile/
  // ─── Fetch profile based on user role ─────────────────────────────────────────
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
          // ONLY fetch vendor profile if actually a vendor
          const res = await api.get("/accounts/vendor/profile/");
          const data = res.data?.data ?? res.data;
          const name = [data?.first_name, data?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
          if (name) setProfileName(name);
          if (data?.profile_picture && !profileImage) {
            setAvatarUrl(data.profile_picture);
            setAvatarError(false);
          }
        }
      } catch (err) {
        console.error("Navbar3: failed to load profile", err.message);
      }
    };

    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Notifications — admin only ───────────────────────────────────────────────
  const loadNotifications = async () => {
    console.log("loadNotifications called, isAdminUser:", isAdminUser());

    if (!isAdminUser()) {
      console.log("Not admin user, skipping notifications load");
      return;
    }

    try {
      console.log("Fetching notifications...");
      const response = await getAdminNotifications({ limit: 15 });
      console.log("Notifications response:", response);

      const payload = response.data || response;
      const items = payload.data?.notifications || payload.notifications || [];

      console.log("Notifications count:", items.length);
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };
  //   try {
  //     const response = await getAdminNotifications({ limit: 15 });
  //     const payload  = response.data || response;
  //     const items    =
  //       payload.data?.notifications
  //       || payload.notifications
  //       || (Array.isArray(payload.data) ? payload.data : [])
  //       || [];
  //     setNotifications(items);
  //     setUnreadCount(items.filter(n => !n.is_read).length);
  //   } catch (err) {
  //     console.error("Failed to load notifications:", err);
  //   }
  // };

  useEffect(() => {
    console.log("Navbar3 mounted, isAdminUser:", isAdminUser());
    loadNotifications();
    const interval = setInterval(loadNotifications, 60_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Close notif panel on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Mark single notification as read
  const handleMarkRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Navbar3: failed to mark notification read", err.message);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await api.post("/accounts/admin/notifications/mark-read/", {
        mark_all: true,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Navbar3: failed to mark all notifications read",
        err.message,
      );
    }
  };

  // ─── Avatar: photo → initials → icon ─────────────────────────────────────────
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

        {/* Search — fires onSearch for global table filtering */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search tables…"
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-[#EFB034] focus:border-[#EFB034] text-xs transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Bell — only shows panel content for admins */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowNotifPanel((p) => !p)}
              className="relative text-slate-500 hover:text-slate-700 p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold text-[#125852] bg-[#E0F2F1] px-1.5 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-xs text-slate-400">
                        No notifications yet
                      </p>
                      <p className="text-[9px] text-slate-300 mt-0.5">
                        {isAdminUser()
                          ? "New vendor registrations will appear here"
                          : "You have no notifications"}
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const typeInfo = NOTIF_TYPE_STYLE[
                        notif.notification_type
                      ] || {
                        label: notif.type_display,
                        dot: "bg-slate-400",
                      };
                      return (
                        <div
                          key={notif.id}
                          onClick={() =>
                            !notif.is_read && handleMarkRead(notif.id)
                          }
                          className={`flex items-start gap-2.5 px-3 py-2.5 border-b border-slate-50 cursor-pointer transition-colors ${
                            !notif.is_read
                              ? "bg-[#E0F2F1]/30 hover:bg-[#E0F2F1]/50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${typeInfo.dot}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {notif.time_ago}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <div className="w-1 h-1 bg-[#125852] rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/30 flex justify-center">
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-[#125852] hover:text-[#0e4440] flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck size={10} /> Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar — navigates to account settings on click */}
          <div className="flex items-center pl-2.5 border-l border-slate-200">
            <div
              onClick={() => navigate("/account-settings")}
              title="Account Settings"
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-300 cursor-pointer shrink-0 bg-slate-100 hover:opacity-80 transition-opacity"
            >
              {renderAvatar()}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-0.5 bg-gradient-to-b from-slate-100 to-transparent sticky top-14 z-40 pointer-events-none" />
    </>
  );
};;

export default Navbar3;