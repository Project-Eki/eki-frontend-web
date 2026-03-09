import React from 'react';
import { TrendingUp, ShoppingBag, Clock, Package } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-[10px] text-green-600 font-bold mt-1 bg-green-50 inline-block px-1.5 py-0.5 rounded">
        {subtext}
      </p>
    </div>
    <div className={`p-2.5 rounded-lg ${colorClass}`}>
      <Icon size={20} className="text-gray-700" />
    </div>
  </div>
);

const StatsGrid = () => {
  const stats = [
    { title: "Gross Sales (30d)", value: "$42,390.00", subtext: "+12.5%", icon: TrendingUp, colorClass: "bg-green-50" },
    { title: "Open Orders", value: "18", subtext: "5 Urgent", icon: ShoppingBag, colorClass: "bg-orange-50" },
    { title: "Pending Payouts", value: "$3,150.25", subtext: "Nov 05", icon: Clock, colorClass: "bg-cyan-50" },
    { title: "Active Listings", value: "142", subtext: "+3 New", icon: Package, colorClass: "bg-yellow-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
    </div>
  );
};

export default StatsGrid;