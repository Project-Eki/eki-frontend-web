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
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">Recent Orders</h3>
        <button className="text-xs font-semibold text-teal-600 hover:underline">View All Orders</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-50">
            <th className="pb-3 font-medium">ORDER ID</th>
            <th className="pb-3 font-medium">CUSTOMER</th>
            <th className="pb-3 font-medium">ITEMS</th>
            <th className="pb-3 font-medium">TOTAL</th>
            <th className="pb-3 font-medium">STATUS</th>
            <th className="pb-3 font-medium text-right">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-4 font-semibold text-teal-600">{order.id}</td>
              <td className="py-4 text-gray-700">{order.customer}</td>
              <td className="py-4 text-gray-600">{order.item}</td>
              <td className="py-4 font-bold text-gray-800">{order.total}</td>
              <td className="py-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                  {order.status}
                </span>
              </td>
              <td className="py-4 text-right"><MoreVertical size={16} className="inline text-gray-400 cursor-pointer" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;