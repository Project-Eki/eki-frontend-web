import React from "react";
import { HiTrash } from "react-icons/hi2";

const BranchCard = ({ branch, index, onEdit, onRemove }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 relative group">
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(index)}
          className="text-blue-400 hover:text-blue-600 p-0.5"
          title="Edit branch"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
        <button
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-600 p-0.5"
          title="Remove branch"
        >
          <HiTrash size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] pr-12">
        <div className="col-span-2">
          <span className="font-semibold">Address:</span> {branch.address}
        </div>
        {/* Country field - displayed first */}
        {branch.country && (
          <div>
            <span className="font-semibold">Country:</span> {branch.country}
          </div>
        )}
        <div>
          <span className="font-semibold">City:</span> {branch.city}
        </div>
        {branch.landmark && (
          <div>
            <span className="font-semibold">Landmark:</span> {branch.landmark}
          </div>
        )}
        {branch.phone && (
          <div>
            <span className="font-semibold">Phone:</span> {branch.phone}
          </div>
        )}
        {branch.hours && (
          <div className="col-span-2">
            <span className="font-semibold">Hours:</span> {branch.hours}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchCard;