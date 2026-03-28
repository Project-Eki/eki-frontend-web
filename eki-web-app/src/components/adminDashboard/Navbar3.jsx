import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, CheckCheck, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminNotifications, markNotificationRead, getVendorProfile } from '../../services/api';
import api from '../../services/api';

const NOTIF_TYPE_STYLE = {
  new_vendor:          { label: "New vendor registered",   dot: "bg-blue-500"   },
  vendor_approved:     { label: "Vendor approved",         dot: "bg-green-500"  },
  vendor_rejected:     { label: "Vendor rejected",         dot: "bg-red-500"    },
  vendor_suspended:    { label: "Vendor suspended",        dot: "bg-orange-500" },
  new_dispute:         { label: "Dispute filed",           dot: "bg-red-500"    },
  flagged_content:     { label: "Content flagged",         dot: "bg-yellow-500" },
  new_transaction:     { label: "New transaction",         dot: "bg-teal-500"   },
  new_buyer:           { label: "New buyer registered",    dot: "bg-purple-500" },
  document_submitted:  { label: "Documents submitted",     dot: "bg-indigo-500" },
  disputed_transaction:{ label: "Transaction disputed",    dot: "bg-red-500"    },
};



const Navbar3 = ({ userName = "Admin", userRole = "Admin", onMenuClick }) => {
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Live profile state
  const [profileName,   setProfileName]   = useState(userName);
  const [avatarUrl,     setAvatarUrl]     = useState(null);
  const [avatarError,   setAvatarError]   = useState(false);

  const panelRef = useRef(null);
  const navigate = useNavigate();

  // ─── Fetch logged-in user profile ───────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Uses the existing getVendorProfile helper from api.js
        // which calls GET /api/v1/accounts/vendor/profile/
        // and unwraps res.data?.data ?? res.data for us
        const data = await getVendorProfile();

        // Backend returns: first_name, last_name, phone_number, profile_picture
        const name = (data?.first_name || data?.last_name)
          ? `${data?.first_name ?? ''} ${data?.last_name ?? ''}`.trim()
          : null;

        if (name)                  setProfileName(name);
        if (data?.profile_picture) { setAvatarUrl(data.profile_picture); setAvatarError(false); }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // ─── Notifications ───────────────────────────────────────────────────────────
  const loadNotifications = async () => {
    try {
      const response = await getAdminNotifications({ limit: 15 });
      const payload = response.data || response;
      const items =
        payload.data?.notifications
        || payload.notifications
        || (Array.isArray(payload.data) ? payload.data : [])
        || [];

      setNotifications(items);
      setUnreadCount(items.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/v1/accounts/admin/notifications/mark-read/', { mark_all: true });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleProfileClick = () => {
    navigate('/account-settings');
  };

  // ─── Avatar rendering helper ─────────────────────────────────────────────────
  const renderAvatar = () => {
    // Show live image if URL loaded without error
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

    // Fallback: initials from the resolved name
    const initials = profileName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    if (initials) {
      return (
        <span className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold bg-[#125852]">
          {initials}
        </span>
      );
    }

    // Last resort: generic icon
    return <UserCircle className="w-full h-full text-slate-400" />;
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <nav className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200 rounded-b-2xl sticky top-0 z-50 h-14 shrink-0 shadow-sm">

        {/* Menu button for mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors mr-1.5"
        >
          <Menu size={18}/>
        </button>

        {/* Empty div to maintain spacing - logo removed */}
        <div className="w-6 md:w-0"></div>

        {/* Search Bar - centered */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5"/>
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-1 focus:ring-[#EFB034FF] focus:border-[#EFB034FF] text-xs transition-all"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3 shrink-0">

          {/* Notification Bell */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowNotifPanel(prev => !prev)}
              className="relative text-slate-500 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <Bell className="w-4 h-4"/>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-white">
                  <p className="text-xs font-bold text-slate-800">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold text-[#125852] bg-[#E0F2F1] px-1.5 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-xs text-slate-400">No notifications yet</p>
                      <p className="text-[9px] text-slate-300 mt-0.5">New vendor registrations will appear here</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const typeInfo = NOTIF_TYPE_STYLE[notif.notification_type] || { label: notif.type_display, dot: "bg-slate-400" };
                      return (
                        <div key={notif.id}
                          onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                          className={`flex items-start gap-2.5 px-3 py-2.5 border-b border-slate-50 cursor-pointer transition-colors ${
                            !notif.is_read ? "bg-[#E0F2F1]/30 hover:bg-[#E0F2F1]/50" : "hover:bg-slate-50"
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${typeInfo.dot}`}/>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">{notif.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{notif.time_ago}</p>
                          </div>
                          {!notif.is_read && <div className="w-1 h-1 bg-[#125852] rounded-full shrink-0 mt-1"/>}
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
                      <CheckCheck size={10}/> Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center pl-2.5 border-l border-slate-200">
            <div
              onClick={handleProfileClick}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#125852] cursor-pointer shrink-0 bg-slate-100 hover:opacity-80 transition-opacity"
            >
              {renderAvatar()}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer element to create visual separation when scrolling */}
      <div className="h-0.5 bg-gradient-to-b from-slate-100 to-transparent sticky top-14 z-40 pointer-events-none"></div>
    </>
  );
};

export default Navbar3;