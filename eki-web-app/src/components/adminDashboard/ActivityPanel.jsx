import React from 'react';
import {
  UserPlus, CheckCircle, AlertTriangle, UserCheck,
  ShieldCheck, XCircle, ArrowLeftRight, Package
} from 'lucide-react';

// Maps notification_type or action string → icon + colors
// This drives the colored icon circles you see in the screenshot
const getActivityStyle = (activity) => {
  const type = activity.notification_type || activity.type || "";
  const title = (activity.title || "").toLowerCase();

  if (type === "new_vendor" || title.includes("registered") || title.includes("joined")) {
    return { Icon: UserPlus,       iconBg: "bg-green-100",  iconColor: "text-green-600"  };
  }
  if (type === "vendor_approved"  || title.includes("approved")) {
    return { Icon: CheckCircle,    iconBg: "bg-blue-100",   iconColor: "text-blue-600"   };
  }
  if (type === "new_dispute"      || title.includes("dispute")) {
    return { Icon: AlertTriangle,  iconBg: "bg-red-100",    iconColor: "text-red-600"    };
  }
  if (type === "vendor_suspended" || title.includes("suspended")) {
    return { Icon: XCircle,        iconBg: "bg-orange-100", iconColor: "text-orange-600" };
  }
  if (type === "new_buyer"        || title.includes("buyer")) {
    return { Icon: UserCheck,      iconBg: "bg-purple-100", iconColor: "text-purple-600" };
  }
  if (type === "flagged_content"  || title.includes("flagged")) {
    return { Icon: AlertTriangle,  iconBg: "bg-yellow-100", iconColor: "text-yellow-600" };
  }
  if (type === "new_transaction"  || title.includes("transaction")) {
    return { Icon: ArrowLeftRight, iconBg: "bg-teal-100",   iconColor: "text-teal-600"   };
  }
  if (title.includes("listing")   || title.includes("product")) {
    return { Icon: Package,        iconBg: "bg-indigo-100", iconColor: "text-indigo-600" };
  }
  // Default fallback
  return { Icon: ShieldCheck, iconBg: "bg-gray-100", iconColor: "text-gray-500" };
};

const ActivityPanel = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-5">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck size={18} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-400">No recent activity</p>
            <p className="text-xs text-gray-300 mt-1">Activity will appear here as events occur</p>
          </div>
        ) : (
          <ul className="space-y-0">
            {activities.map((activity, index) => {
              const { Icon, iconBg, iconColor } = getActivityStyle(activity);
              return (
                <li
                  key={index}
                  className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Colored icon circle — matches the screenshot */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-3 mt-0.5">
                    {activity.time}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;



// CHANGED: removed hardcoded activities array (was at the top of the file)
// UNCHANGED: component still accepts activities as a prop

// const ActivityPanel = ({ activities = [] }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
//       <div className="p-5 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
//       </div>
//       <div className="p-5">
//         {/* ADDED: empty state when no activities yet */}
//         {activities.length === 0 ? (
//           <p className="text-sm text-gray-400 text-center py-6">No recent activity.</p>
//         ) : (
//           <ul className="space-y-3">
//             {activities.map((activity, index) => (
//               <li key={index} className="flex items-start justify-between border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
//                 <div className="flex items-start gap-3">
//                   {/* CHANGED: icon is optional — logs from API don't carry icons */}
//                   {activity.icon && (
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg || 'bg-gray-100'} ${activity.iconColor || 'text-gray-500'}`}>
//                       <activity.icon size={14} />
//                     </div>
//                   )}
//                   <div className="flex-1">
//                     <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
//                     <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
//                   </div>
//                 </div>
//                 <div className="text-xs text-gray-400 whitespace-nowrap ml-3">{activity.time}</div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ActivityPanel;



