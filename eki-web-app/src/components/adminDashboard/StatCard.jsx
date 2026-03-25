import React from 'react';

// number prop now shows "—" while loading, real value when data arrives
const StatCard = ({ title, number, icon: Icon, iconBgColor = 'bg-blue-50', iconColor = 'text-blue-600' }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between border border-gray-100">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {/* Shows "—" while loading, then snaps to real number — no layout shift */}
        <h3 className={`text-3xl font-bold mt-1 ${number === "—" ? "text-gray-300" : "text-gray-900"}`}>
          {number}
        </h3>
      </div>
      {/* Colored icon background — passed from AdminDashboard */}
      <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center`}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
    </div>
  );
};

export default StatCard;