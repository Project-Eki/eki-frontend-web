import React from "react";

export const BulkActionBar = ({ selectedCount, onActivate, onArchive, onExport }) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1D4D4C] text-white rounded-xl shadow-lg px-5 py-3 flex items-center gap-4 z-40">
      <span className="text-xs font-medium">{selectedCount} Item{selectedCount !== 1 ? "s" : ""} Selected</span>
      <div className="w-px h-4 bg-white/30"></div>
      <button onClick={onActivate} className="text-xs font-medium hover:text-amber-300 transition-colors">Activate</button>
      <button onClick={onArchive} className="text-xs font-medium hover:text-amber-300 transition-colors">Archive</button>
      <button onClick={onExport} className="text-xs font-medium hover:text-amber-300 transition-colors">Bulk Export</button>
    </div>
  );
};