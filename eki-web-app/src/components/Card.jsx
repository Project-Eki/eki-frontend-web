import React from 'react';
import { Store, Clock, TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, change, trend, type }) => {
  const getIcon = () => {
    if (type === 'vendors') return <Store className="text-[#234E4D]" size={20} />;
    if (type === 'pending') return <Clock className="text-[#234E4D]" size={20} />;
    return <TrendingUp className="text-[#234E4D]" size={20} />;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div className="bg-gray-50 p-2 rounded-lg">{getIcon()}</div>
        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        }`}>
          {change}
        </span >
      </div>
      <div>
        <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;