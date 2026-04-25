import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const StockStatusChart = ({ statuses, title = "Stock Status", subtitle = "Global inventory availability overview" }) => {
  // Colors: Active: #EFB034 (Gold), Draft: #235E5D (Teal)
  const COLORS = {
    Active: "#EFB034",
    Draft: "#235E5D",
    Flagged: "#DC2626",
    Archived: "#9CA3AF"
  };

  const data = statuses.map(status => ({
    name: status.label,
    value: status.percentage,
    color: COLORS[status.label] || "#6B7280"
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-xs">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-600">{payload[0].value}% of listings</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if percentage is significant enough
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-[10px] font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-[10px] text-gray-400 mb-4">{subtitle}</p>
      
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            align="center"
            layout="horizontal"
            iconType="circle"
            iconSize={8}
            formatter={(value, entry) => (
              <span className="text-[10px] text-gray-600 ml-1">
                {value}: {data.find(d => d.name === value)?.value}%
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};