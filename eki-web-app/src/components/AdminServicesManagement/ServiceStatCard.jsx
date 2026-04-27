import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const ServiceStatCard = ({ label, value, change, icon: Icon, bgColor }) => {
  const isPositive = change?.startsWith("+");

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <h3 className="text-3xl font-bold text-gray-900 leading-none">{value}</h3>
          {change && (
            <span
              className={`text-[10px] font-semibold flex items-center gap-0.5 mb-0.5 ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {change}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${bgColor} flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  );
};