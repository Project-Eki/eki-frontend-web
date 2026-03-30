/**
 * ChartCard.jsx
 *
 * Changes:
 *  - Title changed to "Monthly Platform Activity"
 *  - X-axis dataKey changed from "name" to "month" (matches backend monthly_activity shape)
 *  - Bar dataKeys changed from "users"/"listings" to "new_users"/"listings"
 *    (matches backend field names: { month, new_users, listings })
 *  - Compact size: chart height reduced from 280 → 220 so it fits at 100% zoom
 *  - Legend updated to match new field names
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ChartCard = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        {/* CHANGED: Weekly → Monthly */}
        <h3 className="text-sm font-semibold text-gray-900">Monthly Platform Activity</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">New users & listings per month</p>
      </div>

      <div className="p-4">
        {/* CHANGED: height 280 → 220 for compact layout */}
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 6, right: 6, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

              {/* CHANGED: dataKey "name" → "month" to match backend */}
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />

              {/* CHANGED: dataKey "users" → "new_users" to match backend field */}
              <Bar
                dataKey="new_users"
                fill="#efb034"
                radius={[3, 3, 0, 0]}
                name="New Users"
                barSize={16}
              />
              {/* listings key is the same in backend */}
              <Bar
                dataKey="listings"
                fill="#235E5D"
                radius={[3, 3, 0, 0]}
                name="Listings"
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#efb034]" />
            <span className="text-xs text-gray-500">New Users</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#235E5D]" />
            <span className="text-xs text-gray-500">Listings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;