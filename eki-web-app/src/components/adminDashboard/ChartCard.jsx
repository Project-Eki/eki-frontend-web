import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', users: 420, listings: 280 },
  { name: 'Feb', users: 380, listings: 320 },
  { name: 'Mar', users: 520, listings: 410 },
  { name: 'Apr', users: 480, listings: 380 },
  { name: 'May', users: 610, listings: 490 },
  { name: 'Jun', users: 550, listings: 440 },
  { name: 'Jul', users: 670, listings: 520 },
];

const ChartCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Platform Activity</h3>
      </div>
      <div className="p-5">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="users" 
                fill="#efb034" 
                radius={[4, 4, 0, 0]} 
                name="Users"
                barSize={20}
              />
              <Bar 
                dataKey="listings" 
                fill="#235E5D" 
                radius={[4, 4, 0, 0]} 
                name="Listings"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#efb034]"></div>
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#235E5D]"></div>
            <span className="text-sm text-gray-600">Listings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
