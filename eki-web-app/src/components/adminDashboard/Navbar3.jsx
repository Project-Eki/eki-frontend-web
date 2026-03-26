import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, ChevronDown, CheckCheck } from 'lucide-react';
import adaefe from "../../assets/adaefe.jpg";
import { getAdminNotifications, markNotificationRead } from '../../services/api';
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

const Navbar3 = ({ userName = "Keilar Kirabira", userRole = "Admin", onMenuClick }) => {
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const panelRef = useRef(null);

  
  // FIX: Correct API response unwrapping
  //
  // BUG WAS: data came back as { success, data: { notifications: [...] }, message }
  // The old code did: Array.isArray(data) ? data : data.results || []
  // which missed data.data.notifications entirely → empty bell.
  //
  // getAdminNotifications() returns axios response.data which is the
  // backend's success envelope: { success, data: {...}, message }
  // The actual notifications live at response.data.data.notifications
  
  const loadNotifications = async () => {
    try {
      const response = await getAdminNotifications({ limit: 15 });

      // response here is axios response, so response.data = the JSON body
      // JSON body = { success: true, data: { notifications: [...], total, ... }, message }
      const payload = response.data || response;

      // Try multiple paths in case the API shape evolves
      const items =
        payload.data?.notifications    // standard path
        || payload.notifications       // flat path fallback
        || (Array.isArray(payload.data) ? payload.data : [])  // if data is the array
        || [];

      setNotifications(items);
      setUnreadCount(items.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close panel when clicking outside
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

  // Mark all as read — calls the bulk endpoint
  const handleMarkAllRead = async () => {
    try {
      await api.post('/accounts/admin/notifications/mark-read/', { mark_all: true });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b border-gray-100 sticky top-0 z-50 h-16 shrink-0">

      <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-2">
        <Menu size={22}/>
      </button>

      <div className="flex items-center shrink-0">
        <img src="/ekilogo.png" alt="Eki Logo" className="h-10 w-auto object-contain"/>
      </div>

      <div className="flex items-center space-x-6 flex-1 justify-center px-4 sm:px-8">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
          <input type="text" placeholder="Search"
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 lg:w-64 transition-all text-sm"/>
        </div>
        <div className="hidden md:flex items-center space-x-6 font-medium text-gray-600 text-sm">
          <a href="/product-dashboard" className="hover:text-black transition-colors">Products</a>
          <a href="/servicemanagement" className="hover:text-black transition-colors">Services</a>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">

        {/* Notification Bell */}
        <div className="relative" ref={panelRef}>
          <button onClick={() => setShowNotifPanel(prev => !prev)}
            className="relative text-gray-500 hover:text-black transition-colors">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6"/>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifPanel && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">Notifications</p>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-300 mt-1">New vendor registrations will appear here</p>
                  </div>
                ) : (
                  notifications.map(notif => {
                    const typeInfo = NOTIF_TYPE_STYLE[notif.notification_type] || { label: notif.type_display, dot: "bg-gray-400" };
                    return (
                      <div key={notif.id}
                        onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? "bg-blue-50/40" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeInfo.dot}`}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 leading-tight">{notif.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{notif.time_ago}</p>
                        </div>
                        {!notif.is_read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-2"/>}
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 flex justify-center">
                  <button onClick={handleMarkAllRead}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <CheckCheck size={12}/> Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center space-x-2 sm:space-x-3 border-l pl-3 sm:pl-6 border-gray-100">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer shrink-0">
            <img src={adaefe} alt="User Avatar" className="w-full h-full object-cover"/>
          </div>
          <div className="hidden sm:flex flex-col text-left cursor-pointer group">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-semibold text-gray-800">{userName}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors"/>
            </div>
            <span className="text-xs text-gray-500">{userRole}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar3;