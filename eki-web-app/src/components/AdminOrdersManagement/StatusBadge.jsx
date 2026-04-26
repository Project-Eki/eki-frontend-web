import React from 'react';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  fulfilled: 'bg-teal-50 text-teal-700 border-teal-200',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  fulfilled: 'Fulfilled',
};

export const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending;
  const label = STATUS_LABELS[normalizedStatus] || status || 'Pending';
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${style}`}>
      {label}
    </span>
  );
};