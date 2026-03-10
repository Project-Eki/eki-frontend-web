const StatCards = ({ data }) => {
  const cards = [
    { title: "Gross Sales (30d)", value: `$${data?.grossSales || '0.00'}`, growth: "+12.8%", icon: "" },
    { title: "Open Orders", value: data?.openOrders || '0', sub: "5 Urgent", icon: "" },
    { title: "Pending Payouts", value: `$${data?.pending || '0.00'}`, sub: "Next: Nov 08", icon: "💳" },
    { title: "Active Listings", value: data?.active || '0', growth: "+3 New", icon: "" },
  ];

  return (
    <div className="grid grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
            <h2 className="text-2xl font-bold mt-1">{card.value}</h2>
            {card.growth && <span className="text-emerald-500 text-xs font-bold">{card.growth}</span>}
            {card.sub && <span className="text-gray-400 text-xs">{card.sub}</span>}
          </div>
          <span className="bg-gray-50 p-2 rounded-lg text-xl">{card.icon}</span>
        </div>
      ))}
    </div>
  );
};
export default StatCards;