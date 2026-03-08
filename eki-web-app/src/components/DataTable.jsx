import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const statusStyles = {
  // User statuses
  Active: 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Suspended: 'bg-red-100 text-red-700',
  // Content moderation statuses
  Reviewing: 'bg-purple-100 text-purple-700',
  Resolved: 'bg-green-100 text-green-700',
  // Transaction statuses
  Completed: 'bg-green-100 text-green-700',
  Disputed: 'bg-red-100 text-red-700',
  // Verification statuses
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

// props received
const DataTable = ({ title, columns, data, onView, onEdit, onDelete }) => {
  return (
    // Table container
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Table title */}
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-5 py-4">
                    {col.render ? (
                      col.render(row[col.key], row)
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[row[col.key]] || 'text-gray-700'}`}>
                        {row[col.key]}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(row)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <FaEye size={14} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
