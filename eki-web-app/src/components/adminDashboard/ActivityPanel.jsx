// CHANGED: removed hardcoded activities array (was at the top of the file)
// UNCHANGED: component still accepts activities as a prop

const ActivityPanel = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-5">
        {/* ADDED: empty state when no activities yet */}
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No recent activity.</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity, index) => (
              <li key={index} className="flex items-start justify-between border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                <div className="flex items-start gap-3">
                  {/* CHANGED: icon is optional — logs from API don't carry icons */}
                  {activity.icon && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg || 'bg-gray-100'} ${activity.iconColor || 'text-gray-500'}`}>
                      <activity.icon size={14} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap ml-3">{activity.time}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;



// import React from 'react';
// import { FaUserPlus, FaCheckCircle, FaExclamationTriangle, FaUserCheck } from 'react-icons/fa';



// const ActivityPanel = ({ activities = []}) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
//       <div className="p-5 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
//       </div>
//       <div className="p-5">

//         <ul className="space-y-3">
//           {activities.map((activity, index) => (
//             <li key={index} className="flex items-start justify-between border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
//               <div className="flex items-start gap-3">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg} ${activity.iconColor}`}>
//                   <activity.icon size={14} />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-semibold text-gray-900 truncate">
//                     {activity.title}
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {activity.description}
//                   </p>
//                 </div>
//               </div>
//               <div className="text-xs text-gray-400 whitespace-nowrap">
//                 {activity.time}
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ActivityPanel;
