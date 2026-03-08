import React from 'react';
import { FaUserPlus, FaCheckCircle, FaExclamationTriangle, FaUserCheck } from 'react-icons/fa';

const activities = [
  { 
    icon: FaUserPlus, 
    iconBg: 'bg-green-100', 
    iconColor: 'text-green-600',
    title: 'New User Registered', 
    description: 'John Doe from New York joined the platform',
    time: '5 min ago' 
  },
  { 
    icon: FaCheckCircle, 
    iconBg: 'bg-blue-100', 
    iconColor: 'text-blue-600',
    title: 'Listing Approved', 
    description: 'Listing "Vintage Camera" by Jane Smith approved',
    time: '1 hour ago' 
  },
  { 
    icon: FaExclamationTriangle, 
    iconBg: 'bg-red-100', 
    iconColor: 'text-red-600',
    title: 'Dispute Filed', 
    description: 'Transaction #EK12345 buyer reported issue with "Antique Vase"',
    time: '3 hours ago' 
  },
  { 
    icon: FaUserCheck, 
    iconBg: 'bg-purple-100', 
    iconColor: 'text-purple-600',
    title: 'Seller Verification', 
    description: 'New seller "Global Tech" submitted documents',
    time: 'Yesterday' 
  },
];

const ActivityPanel = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-5">
        <ul className="space-y-3">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-start justify-between border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg} ${activity.iconColor}`}>
                  <activity.icon size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.description}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {activity.time}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityPanel;
