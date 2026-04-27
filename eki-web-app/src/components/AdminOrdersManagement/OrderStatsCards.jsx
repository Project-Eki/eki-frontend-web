import React from "react";
import { TrendingUp, TrendingDown, Package, Clock, CircleDollarSign, CheckCircle } from "lucide-react";

export const OrderStatsCards = ({ stats }) => {
  const cards = [
    {
      label: "Total Orders",
      value: stats.total,
      change: "+12%",
      icon: Package,
      bgColor: "bg-[#235E5D]",
    },
    {
      label: "Pending/Processing",
      value: stats.pending + stats.processing,
      change: "-5%",
      icon: Clock,
      bgColor: "bg-[#EFB034]",
    },
    {
      label: "Completed",
      value: stats.completed,
      change: "+18%",
      icon: CheckCircle,
      bgColor: "bg-[#235E5D]",
    },
    {
      label: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      change: "+8%",
      icon: CircleDollarSign,
      bgColor: "bg-[#EFB034]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const isPositive = card.change?.startsWith("+");
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                {card.label}
              </p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-900 leading-none">
                  {card.value}
                </h3>
                {card.change && (
                  <span
                    className={`text-[10px] font-semibold flex items-center gap-0.5 mb-0.5 ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {card.change}
                  </span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor} flex-shrink-0`}>
              <card.icon size={22} className="text-white" />
            </div>
          </div>
        );
      })}
    </div>
  );
};