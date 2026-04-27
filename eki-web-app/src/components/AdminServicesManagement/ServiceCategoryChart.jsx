import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const TEAL = "#235E5D";
const GOLD = "#EFB034";

export const ServiceCategoryChart = ({ categories, title, subtitle }) => {
  const data = categories.map((cat) => ({
    name: cat.name,
    total: cat.total,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 text-xs">
          <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-gray-500">{payload[0].value} services</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-[10px] text-gray-400 mb-4">{subtitle}</p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 5 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? TEAL : GOLD} />
            ))}
            <LabelList
              dataKey="total"
              position="top"
              style={{ fontSize: 10, fill: "#6B7280", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};