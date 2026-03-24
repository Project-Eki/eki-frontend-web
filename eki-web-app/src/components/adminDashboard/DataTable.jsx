import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import ViewDetailsModal from './ViewDetailsModal';

const statusStyles = {
  Active: 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Suspended: 'bg-red-100 text-red-700',
  Reviewing: 'bg-purple-100 text-purple-700',
  Resolved: 'bg-green-100 text-green-700',
  Completed: 'bg-green-100 text-green-700',
  Disputed: 'bg-red-100 text-red-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const DataTable = ({ title, columns, data = [], onView, onEdit, onDelete, tableType = 'default' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleView = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
    if (onView) onView(row);
  };

  const handleEdit = (row) => {
    setIsModalOpen(false);
    if (onEdit) onEdit(row);
  };

  const handleDelete = (row) => {
    setIsModalOpen(false);
    if (onDelete) onDelete(row);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const getModalTitle = () => {
    const typeTitles = {
      userManagement: 'User Details',
      contentModeration: 'Content Details',
      transaction: 'Transaction Details',
      verificationWorkflows: 'Verification Details',
      default: 'Details',
    };
    return typeTitles[tableType] || typeTitles.default;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
                                                        
<tbody className="divide-y divide-gray-100">
  {data.length === 0 ? (
    // ADDED: show this when no data is available yet
    <tr>
      <td
        colSpan={columns.length + 1}
        className="px-5 py-12 text-center text-sm text-gray-400"
      >
        No records to display.
      </td>
    </tr>
  ) : (
    // UNCHANGED: existing row render logic
    data.map((row, rowIndex) => (
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
          <button
            onClick={() => handleView(row)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <FaEye size={14} />
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>
      </div>

      <ViewDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={selectedRow}
        title={getModalTitle()}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
};

export default DataTable; 

// import React, { useState } from 'react';
// import { FaEye } from 'react-icons/fa';
// import ViewDetailsModal from './ViewDetailsModal';

// const statusStyles = {
 
//   Active: 'bg-blue-100 text-blue-700',
//   Pending: 'bg-yellow-100 text-yellow-700',
//   Suspended: 'bg-red-100 text-red-700',
 
//   Reviewing: 'bg-purple-100 text-purple-700',
//   Resolved: 'bg-green-100 text-green-700',
 
//   Completed: 'bg-green-100 text-green-700',
//   Disputed: 'bg-red-100 text-red-700',
 
//   Approved: 'bg-green-100 text-green-700',
//   Rejected: 'bg-red-100 text-red-700',
// };


// const DataTable = ({ title, columns, data, onView, onEdit, onDelete, tableType = 'default' }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);

//   const handleView = (row) => {
//     setSelectedRow(row);
//     setIsModalOpen(true);
//     if (onView) {
//       onView(row);
//     }
//   };

//   const handleEdit = (row) => {
//     setIsModalOpen(false);
//     if (onEdit) {
//       onEdit(row);
//     }
//   };

//   const handleDelete = (row) => {
//     setIsModalOpen(false);
//     if (onDelete) {
//       onDelete(row);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedRow(null);
//   };


//   const getModalTitle = () => {
//     const typeTitles = {
//       userManagement: 'User Details',
//       contentModeration: 'Content Details',
//       transaction: 'Transaction Details',
//       verificationWorkflows: 'Verification Details',
//       default: 'Details',
//     };
//     return typeTitles[tableType] || typeTitles.default;
//   };

//   return (
//     <>
     
//       <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
       
//         <div className="p-5 border-b border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 {columns.map((col, index) => (
//                   <th
//                     key={index}
//                     className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
//                   >
//                     {col.header}
//                   </th>
//                 ))}
//                 <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {data.map((row, rowIndex) => (
//                 <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
//                   {columns.map((col, colIndex) => (
//                     <td key={colIndex} className="px-5 py-4">
//                       {col.render ? (
//                         col.render(row[col.key], row)
//                       ) : (
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[row[col.key]] || 'text-gray-700'}`}>
//                           {row[col.key]}
//                         </span>
//                       )}
//                     </td>
//                   ))}
//                   <td className="px-5 py-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handleView(row)}
//                         className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                         title="View"
//                       >
//                         <FaEye size={14} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

    
//       <ViewDetailsModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         data={selectedRow}
//         title={getModalTitle()}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//       />
//     </>
//   );
// };

// export default DataTable;
