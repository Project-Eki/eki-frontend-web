/**
 * ActivityPanel.jsx
 *
 * Changes:
 *  - "Listing Approved" → "Vendor Approved"
 *  - Removed "View all activity" footer link
 *  - Compact sizing so it looks good at 100%+ zoom
 */

import React from "react";
import {
  UserPlus,
  CheckCircle,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const DEFAULT_ACTIVITIES = [
  {
    type:         "new_user",
    icon:         UserPlus,
    iconBg:       "bg-blue-50",
    iconColor:    "text-blue-500",
    defaultTitle: "New User Registered",
  },
  {
    type:         "vendor_approved",   // changed from listing_approved
    icon:         CheckCircle,
    iconBg:       "bg-green-50",
    iconColor:    "text-green-500",
    defaultTitle: "Vendor Approved",   // changed from "Listing Approved"
  },
  {
    type:         "verification_submitted",
    icon:         ShieldAlert,
    iconBg:       "bg-orange-50",
    iconColor:    "text-orange-500",
    defaultTitle: "Verification Submitted",
  },
  {
    type:         "transaction_updated",
    icon:         RefreshCw,
    iconBg:       "bg-indigo-50",
    iconColor:    "text-indigo-500",
    defaultTitle: "Transaction Updated",
  },
  {
    type:         "content_flagged",
    icon:         AlertTriangle,
    iconBg:       "bg-red-50",
    iconColor:    "text-red-500",
    defaultTitle: "Content Flagged",
  },
];

const ActivityPanel = ({ activities = [] }) => {
  // Build lookup by type, fall back to positional index
  const apiMap = {};
  activities.forEach((item, index) => {
    const key = item.type || String(index);
    apiMap[key] = {
      description: item.description || item.details || "",
      time:        item.time        || item.time_ago || item.timestamp || "",
    };
  });

  const mergedRows = DEFAULT_ACTIVITIES.map((staticItem, index) => {
    const apiItem = apiMap[staticItem.type] || apiMap[String(index)];
    return {
      ...staticItem,
      description: apiItem?.description || "No activity yet",
      time:        apiItem?.time        || "—",
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2.5 border-b border-gray-50 shrink-0">
        <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Platform events</p>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-gray-50 flex-1 overflow-y-auto">
        {mergedRows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.type}
              className="flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${row.iconBg}`}>
                <Icon size={13} className={row.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {row.defaultTitle}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {row.description}
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-[10px] font-medium text-gray-400 mt-0.5 ml-1">
                {row.time}
              </span>
            </li>
          );
        })}
      </ul>
      {/* "View all activity" REMOVED per requirements */}
    </div>
  );
};

export default ActivityPanel;