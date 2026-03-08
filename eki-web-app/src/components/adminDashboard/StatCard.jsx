import React from 'react';

const StatCard = ({ title, number, icon: Icon, iconBgColor = 'bg-blue-50', iconColor = 'text-blue-600', trend }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
      {/* Left Side: Text Content */}
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{number}</h3>
      </div>

      {/* Right Side: Icon */}
      <div className={`p-3 rounded-lg ${iconBgColor} ${iconColor} flex items-center justify-center`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default StatCard;