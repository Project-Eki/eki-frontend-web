import React from 'react';
import { FaUserPlus, FaCheckCircle, FaExclamationTriangle, FaUserCheck } from 'react-icons/fa';

const activities = [
  { 
    icon: FaUserPlus, 
    iconBg: 'bg-green-100', 
    iconColor: 'text-green-600',
    description: 'New User Registered', 
    time: '5 min ago' 
  },
  { 
    icon: FaCheckCircle, 
    iconBg: 'bg-blue-100', 
    iconColor: 'text-blue-600',
    description: 'Listing Approved', 
    time: '1 hour ago' 
  },
  { 
    icon: FaExclamationTriangle, 
    iconBg: 'bg-red-100', 
    iconColor: 'text-red-600',
    description: 'Dispute Filed', 
    time: '3 hours ago' 
  },
  { 
    icon: FaUserCheck, 
    iconBg: 'bg-purple-100', 
    iconColor: 'text-purple-600',
    description: 'Seller Verification', 
    time: 'Yesterday' 
  },
];

const ActivityPanel = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-5">
        <ul className="space-y-4">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${activity.iconBg} ${activity.iconColor} shrink-0`}>
                <activity.icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activity.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityPanel;
