
// CHANGED: removed hardcoded activities array (was at the top of the file)
// UNCHANGED: component still accepts activities as a prop

import React from 'react';
import {
  UserPlus,
  CheckCircle,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

// DEFAULT_ACTIVITIES defines the STATIC structure of this panel.
//
// These items are ALWAYS visible, regardless of API data.
// Each entry has:
//   - type:        a unique key used to match API data
//   - icon:        the Lucide icon component to display
//   - iconBg:      Tailwind background class for the icon circle
//   - iconColor:   Tailwind text/color class for the icon
//   - defaultTitle: the label shown permanently in the left column
//
// The description and time columns are filled from API data.
// If API returns nothing for a given type, fallback values are used.
const DEFAULT_ACTIVITIES = [
  {
    type:         'new_user',
    icon:         UserPlus,
    iconBg:       'bg-blue-50',
    iconColor:    'text-blue-500',
    defaultTitle: 'New User Registered',
  },
  {
    type:         'listing_approved',
    icon:         CheckCircle,
    iconBg:       'bg-green-50',
    iconColor:    'text-green-500',
    defaultTitle: 'Listing Approved',
  },
  {
    type:         'verification_submitted',
    icon:         ShieldAlert,
    iconBg:       'bg-orange-50',
    iconColor:    'text-orange-500',
    defaultTitle: 'Verification Submitted',
  },
  {
    type:         'transaction_updated',
    icon:         RefreshCw,
    iconBg:       'bg-indigo-50',
    iconColor:    'text-indigo-500',
    defaultTitle: 'Transaction Updated',
  },
  {
    type:         'content_flagged',
    icon:         AlertTriangle,
    iconBg:       'bg-red-50',
    iconColor:    'text-red-500',
    defaultTitle: 'Content Flagged',
  },
];


// ActivityPanel Component
//
// Props:
//   activities — array from API, each item should have:
//                { type, description, time }
//
//   The `type` field is used to match API items to the static
//   DEFAULT_ACTIVITIES list above.
//
//   If the API returns items WITHOUT a `type` field (e.g. just
//   a flat list), they are mapped positionally — first API item
//   fills the first row, second fills the second row, etc.
// 
const ActivityPanel = ({ activities = [] }) => {

  // Build a lookup map: type → { description, time }
  // This lets us match API data to static rows by type key.
  // If `type` is missing in the API response, we fall back to
  // positional mapping (handled below).
  const apiMap = {};
  activities.forEach((item, index) => {
    const key = item.type || String(index); // fallback: use position as key
    apiMap[key] = {
      description: item.description || item.details || '',
      time:        item.time        || item.time_ago || item.timestamp || '',
    };
  });

  // Merge static structure with API data.
  // Each row always renders — only description + time are dynamic.
  const mergedRows = DEFAULT_ACTIVITIES.map((staticItem, index) => {
    // Try matching by type first; fall back to positional index
    const apiItem = apiMap[staticItem.type] || apiMap[String(index)];

    return {
      ...staticItem,
      // Description from API, or a friendly "no activity" fallback
      description: apiItem?.description || 'No activity yet',
      // Time from API, or a dash
      time:        apiItem?.time        || '—',
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">

      {/* Panel header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-50 shrink-0">
        <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Platform events</p>
      </div>

      {/* Activity rows — ALWAYS rendered, one per DEFAULT_ACTIVITIES entry */}
      <ul className="divide-y divide-gray-50 flex-1 overflow-y-auto">
        {mergedRows.map((row) => {
          const Icon = row.icon;

          return (
            <li key={row.type} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">

              {/* Icon column — static, never changes */}
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${row.iconBg}`}>
                <Icon size={14} className={row.iconColor} />
              </div>

              {/* Middle column: static title + dynamic description */}
              {/*
                min-w-0 is CRITICAL here — without it, the flex child won't
                shrink below its content size, causing overflow on long text.
                truncate on the description prevents it from wrapping and
                pushing the time outside the card boundary.
              */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {row.defaultTitle}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {row.description}
                </p>
              </div>

              {/* Time column — dynamic, always right-aligned and contained
                  shrink-0 prevents this column from shrinking to nothing.
                  whitespace-nowrap ensures "2 min ago" never line-breaks.
                  Together these two fix the "time overflows outside the card" bug. */}
              <span className="shrink-0 whitespace-nowrap text-[10px] font-medium text-gray-400 mt-0.5 ml-2">
                {row.time}
              </span>

            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-50 shrink-0">
        <button className="text-[11px] font-semibold text-[#1D4D4C] hover:underline">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default ActivityPanel;




