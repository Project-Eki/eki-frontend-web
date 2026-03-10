const InventoryAlerts = ({ alerts }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-orange-500">
        <span className="text-lg"></span>
        <h3 className="font-bold text-gray-800">Inventory Alerts</h3>
      </div>
      <div className="space-y-4">
        {alerts?.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-bold text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-400 uppercase">{item.sku}</p>
            </div>
            <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">{item.count} left</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-100 transition">Restock All Low Items</button>
    </div>
  );
};
export default InventoryAlerts;