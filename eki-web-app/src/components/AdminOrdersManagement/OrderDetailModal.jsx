import React, { useState } from 'react';
import { X, Hash, User, Calendar, MapPin, ShoppingBag, Tag, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const GOLD = "#EFB034";

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const formatOrderId = (raw) => {
  if (!raw) return '—';
  return String(raw).toUpperCase();
};

export const OrderDetailModal = ({ order, onClose, onOrderUpdated }) => {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      // Replace with actual API call: await updateOrderStatus(order.id, newStatus);
      console.log(`Updating order ${order.id} to ${newStatus}`);
      onOrderUpdated?.();
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-[#EFB034]" />
                <h2 className="text-sm font-bold text-gray-900">Order {formatOrderId(order.orderNumber || order.id)}</h2>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Vendor & Buyer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] font-bold uppercase text-gray-400 mb-1">Vendor</p>
              <p className="text-sm font-semibold text-gray-800">{order.vendor?.name || '—'}</p>
              <p className="text-[10px] text-gray-500">{order.vendor?.email || ''}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[9px] font-bold uppercase text-gray-400 mb-1">Buyer</p>
              <p className="text-sm font-semibold text-gray-800">{order.buyer?.name || '—'}</p>
              <p className="text-[10px] text-gray-500">{order.buyer?.email || ''}</p>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
              <Calendar size={13} className="text-[#EFB034] mt-0.5" />
              <div>
                <p className="text-[9px] font-bold uppercase text-gray-400">Date</p>
                <p className="text-[11px] font-medium text-gray-700">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
              <ShoppingBag size={13} className="text-[#EFB034] mt-0.5" />
              <div>
                <p className="text-[9px] font-bold uppercase text-gray-400">Payment Method</p>
                <p className="text-[11px] font-medium text-gray-700 capitalize">{order.paymentMethod || '—'}</p>
              </div>
            </div>
            {order.shippingAddress && (
              <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
                <MapPin size={13} className="text-[#EFB034] mt-0.5" />
                <div>
                  <p className="text-[9px] font-bold uppercase text-gray-400">Shipping Address</p>
                  <p className="text-[11px] font-medium text-gray-700">{order.shippingAddress}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <p className="text-[9px] font-bold uppercase text-gray-400 mb-2">Order Items</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[9px] uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="text-[11px]">
                      <td className="px-3 py-2 font-medium text-gray-800">{item.name}</td>
                      <td className="px-3 py-2 text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-gray-600">${item.price?.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-100">
                  <tr>
                    <td colSpan="3" className="px-3 py-2 text-right text-[10px] font-bold uppercase text-gray-500">Subtotal</td>
                    <td className="px-3 py-2 text-right text-[11px] font-bold text-gray-800">${(order.subtotal || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-3 py-2 text-right text-[10px] font-bold uppercase text-gray-500">Total</td>
                    <td className="px-3 py-2 text-right text-sm font-black text-[#125852]">${(order.total || 0).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-[9px] font-bold uppercase text-amber-600 mb-1">Notes</p>
              <p className="text-[11px] text-amber-800">{order.notes}</p>
            </div>
          )}

          {/* Admin Actions */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[9px] font-bold uppercase text-gray-400 mb-3">Admin Actions</p>
            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={updating}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Mark as Confirmed
                </button>
              )}
              {order.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('processing')}
                  disabled={updating}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Mark as Processing
                </button>
              )}
              {order.status === 'processing' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updating}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  Mark as Completed
                </button>
              )}
              {!['cancelled', 'completed'].includes(order.status) && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updating}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};