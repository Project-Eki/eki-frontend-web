import React from 'react';

const StatCard = ({ title, number, icon: Icon, iconBgColor = 'bg-blue-50', iconColor = 'text-blue-600', trend }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        {/* Left Side: Icon */}
        <div className={`p-2.5 rounded-lg ${iconBgColor} ${iconColor} flex items-center justify-center`}>
          {/* Using strokeWidth={1.5} gives it that thinner, modern look */}
          <Icon size={22} strokeWidth={1.5} />
        </div>
        
        {/* Right Side: Optional Trend Badge (e.g., +12%) */}
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{number}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;