'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { StatusBadge, PaymentMethodBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  RefreshCw,
  Search,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders?my=true');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status);
    }
    if (filter === 'COMPLETED') return o.status === 'COMPLETED';
    if (filter === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Orders & Live Tracking
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              View your culinary orders and track preparation in the kitchen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>

            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 shadow-sm transition-all"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>New Order</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'ACTIVE'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Active Orders ({orders.filter((o) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'COMPLETED'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Completed ({orders.filter((o) => o.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'CANCELLED'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Cancelled ({orders.filter((o) => o.status === 'CANCELLED').length})
          </button>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse h-36"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-sm max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No orders found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {filter === 'ALL'
                ? "You haven't placed any orders yet. Discover our culinary creations today!"
                : `No orders in "${filter.toLowerCase()}" status.`}
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              Browse Menu <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Order Meta */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-base font-extrabold text-gray-900">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} type="order" />
                    {order.payment && (
                      <PaymentMethodBadge method={order.payment.method} />
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Ordered on {formatDateTime(order.createdAt)} • {order.deliveryAddress || 'Dine-in'}
                  </p>

                  {/* Summary of items */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {order.items?.map((item: any) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-medium"
                      >
                        <span className="font-bold text-gray-900">{item.quantity}x</span>
                        <span>{item.itemName}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amount and Tracking CTA */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-500 block">Total Amount</span>
                    <span className="text-xl font-extrabold text-brand-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white text-xs font-bold transition-all shadow-sm group"
                  >
                    <span>Track Order</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
