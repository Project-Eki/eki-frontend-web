import React from 'react';
import { PlusCircle, Settings, AlertCircle, Star, ChevronRight } from 'lucide-react';

export const QuickActions = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <h3 className="font-bold text-gray-800 mb-4 text-sm">Quick Actions</h3>
    <div className="space-y-3">
      <button className="w-full flex items-center justify-between p-3.5 border border-gray-50 rounded-xl hover:bg-gray-50 transition-all group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
            <PlusCircle size={18} className="text-teal-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800">Add New Product</p>
            <p className="text-[10px] text-gray-400">List items to your shop</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-gray-300" />
      </button>
      
      <button className="w-full flex items-center justify-between p-3.5 border border-gray-50 rounded-xl hover:bg-gray-50 transition-all group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
            <Settings size={18} className="text-teal-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-800">Manage Services</p>
            <p className="text-[10px] text-gray-400">Update availability</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-gray-300" />
      </button>
    </div>
  </div>
);

export const PayoutCard = () => (
  <div className="bg-[#234E4D] text-white p-6 rounded-xl shadow-sm relative overflow-hidden">
    <div className="absolute top-4 right-4 bg-white/20 text-[9px] px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider font-bold">
      Verified
    </div>
    <p className="text-[10px] opacity-70 mb-1">Last Payout</p>
    <h3 className="text-2xl font-bold mb-6">$1,850.00</h3>
    <div className="flex justify-between items-center text-[10px] opacity-60 border-t border-white/10 pt-4">
      <span>Paid on Oct 24, 2023</span>
      <button className="font-bold hover:opacity-100 underline decoration-white/30">View History</button>
    </div>
  </div>
);

export const InventoryAlerts = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 mb-5">
      <AlertCircle size={16} className="text-red-500" />
      <h3 className="font-bold text-gray-800 text-sm">Inventory Alerts</h3>
    </div>
    <div className="space-y-4">
      {[
        { name: "Minimalist Wall Clock", sku: "MWC-02-BLK", stock: "3 left" },
        { name: "Soy Wax Scented Candle", sku: "SWC-08-VAN", stock: "1 left" },
        { name: "Cotton Linen Tablecloth", sku: "CLT-X5-GRY", stock: "5 left" }
      ].map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <div>
            <p className="text-[11px] font-bold text-gray-800">{item.name}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-tighter">{item.sku}</p>
          </div>
          <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md font-bold">{item.stock}</span>
        </div>
      ))}
    </div>
    <button className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 transition-colors">
      Restock All Low Items
    </button>
  </div>
);

// Added the missing RecentReviews component
export const RecentReviews = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-5">
      <h3 className="font-bold text-gray-800 text-sm">Recent Reviews</h3>
      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">4.8 Avg</span>
    </div>
    <div className="space-y-5">
      {[
        { name: "Lucas V.", time: "2h ago", text: "The ceramic vase is even more beautiful in person. Exceptional quality!" },
        { name: "Nina K.", time: "Yesterday", text: "Quick shipping and nice packaging." }
      ].map((rev, i) => (
        <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200" />
            <p className="text-[11px] font-bold text-gray-800">{rev.name}</p>
            <span className="text-[9px] text-gray-400 ml-auto">{rev.time}</span>
          </div>
          <p className="text-[10px] text-gray-500 italic leading-relaxed">"{rev.text}"</p>
          <button className="text-[9px] text-teal-600 font-bold mt-2 hover:underline">Reply to customer</button>
        </div>
      ))}
    </div>
  </div>
);