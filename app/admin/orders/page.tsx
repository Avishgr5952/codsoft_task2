'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge, PaymentMethodBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  MapPin,
  User,
  FileText,
  CreditCard,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (e) {
      console.error('Error loading orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Track, filter, view item tickets, and update real-time fulfillment status.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white font-bold'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {st} {st !== 'ALL' && `(${orders.filter((o) => o.status === st).length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-950 rounded-3xl border border-gray-800/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Delivery / Table</th>
                <th className="px-6 py-4">Items Summary</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white block">{order.customerName}</span>
                    <span className="text-xs text-gray-500">{order.customerEmail}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate">
                    {order.deliveryAddress || 'Dine-in'}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-300">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-white">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    {order.payment ? (
                      <PaymentMethodBadge method={order.payment.method} />
                    ) : (
                      <span className="text-xs text-gray-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-extrabold text-white font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                  <StatusBadge status={selectedOrder.status} type="order" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Change Status Controls */}
            <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-2">
              <span className="text-xs font-bold uppercase text-gray-400 block">
                Update Order Status:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    disabled={updatingStatus || selectedOrder.status === st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.status === st
                        ? 'bg-brand-600 text-white ring-2 ring-brand-400/50'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800 space-y-1">
                <span className="font-bold text-gray-400 uppercase tracking-wider block">
                  Customer
                </span>
                <p className="font-bold text-white text-sm">{selectedOrder.customerName}</p>
                <p className="text-gray-400">{selectedOrder.customerEmail}</p>
                {selectedOrder.customerPhone && (
                  <p className="text-gray-400">{selectedOrder.customerPhone}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800 space-y-1">
                <span className="font-bold text-gray-400 uppercase tracking-wider block">
                  Location / Notes
                </span>
                <p className="font-semibold text-white">
                  📍 {selectedOrder.deliveryAddress || 'Dine-in'}
                </p>
                {selectedOrder.notes && (
                  <p className="text-amber-400 mt-1">Special note: {selectedOrder.notes}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-gray-400 border-b border-gray-800 pb-2">
                Order Items
              </h4>
              <div className="divide-y divide-gray-800">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-gray-900 text-brand-400 font-extrabold flex items-center justify-center text-xs">
                        {item.quantity}x
                      </span>
                      <div>
                        <p className="font-bold text-white">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.itemPrice)} each</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-white">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-3 space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-white">{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="border-t border-gray-800 pt-2 flex justify-between text-base font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-brand-400 text-lg">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
