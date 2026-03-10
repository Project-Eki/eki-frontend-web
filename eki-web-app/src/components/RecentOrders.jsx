import React from 'react';
import { MoreVertical } from 'lucide-react';

const RecentOrders = () => {
  const orders = [
    { id: "#ORD-8921", customer: "Sarah Jenkins", item: "Handmade Ceramic Vase", total: "$85.00", status: "Processing" },
    { id: "#ORD-8922", customer: "Michael Chen", item: "Organic Coffee Beans (x2)", total: "$44.50", status: "Completed" },
    { id: "#ORD-8923", customer: "Elena Rodriguez", item: "Leather Laptop Sleeve", total: "$120.00", status: "Processing" },
    { id: "#ORD-8924", customer: "David Wilson", item: "Wireless Headphones", total: "$189.99", status: "Processing" },
    { id: "#ORD-8925", customer: "Emma Thompson", item: "Handcrafted Jewelry Set", total: "$210.00", status: "Processing" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-800">Recent Orders</h3>
          <p className="text-[10px] text-gray-400">Showing last 5 customer transactions</p>
        </div>
        <button className="text-[11px] font-bold text-teal-600 hover:underline">View All Orders</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-50 text-[10px] uppercase tracking-widest font-bold">
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Items</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-4 text-[11px] font-bold text-teal-700">{order.id}</td>
                <td className="py-4 text-[11px] text-gray-700">{order.customer}</td>
                <td className="py-4 text-[11px] text-gray-500">{order.item}</td>
                <td className="py-4 text-[11px] font-bold text-gray-800">{order.total}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    order.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="p-1 hover:bg-gray-100 rounded-md">
                    <MoreVertical size={14} className="text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;