'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge, PaymentMethodBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  ShoppingBag,
  Clock,
  CalendarDays,
  Users,
  Grid,
  DollarSign,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  UtensilsCrossed,
  ChefHat,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  const summary = report?.summary || {};
  const popular = report?.popularItems || [];
  const recentOrders = report?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Restaurant Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time analytics for orders, revenue, customer reservations, and kitchen performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Stats</span>
          </button>

          <Link
            href="/kitchen/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white shadow-md transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Open Kitchen KDS</span>
          </Link>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {formatCurrency(summary.totalRevenue || 0)}
          </span>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Paid & Completed
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-blue-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.totalOrders || 0}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">
            {summary.completedOrders || 0} completed orders
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-amber-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Orders</span>
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.pendingOrders || 0}
          </span>
          <p className="text-[11px] text-amber-400 mt-1">
            Awaiting kitchen confirmation
          </p>
        </div>

        {/* Preparing & Ready */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-orange-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active in Kitchen</span>
            <div className="p-2 rounded-xl bg-orange-500/10">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {(summary.preparingOrders || 0) + (summary.readyOrders || 0)}
          </span>
          <p className="text-[11px] text-orange-400 mt-1">
            {summary.preparingOrders || 0} cooking, {summary.readyOrders || 0} ready
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-indigo-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Diners</span>
            <div className="p-2 rounded-xl bg-indigo-500/10">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.totalCustomers || 0}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Active customer profiles</p>
        </div>

        {/* Reservations */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-purple-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Table Bookings</span>
            <div className="p-2 rounded-xl bg-purple-500/10">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.totalReservations || 0}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Lifetime reservations</p>
        </div>

        {/* Available Tables */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Available Tables</span>
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.availableTables || 0}
          </span>
          <p className="text-[11px] text-emerald-400 mt-1">Ready for seating</p>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <div className="flex items-center justify-between text-rose-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Cancelled</span>
            <div className="p-2 rounded-xl bg-rose-500/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {summary.cancelledOrders || 0}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Cancelled by guest/staff</p>
        </div>
      </div>

      {/* POPULAR DISHES & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Dishes */}
        <div className="lg:col-span-2 bg-gray-950 rounded-3xl border border-gray-800/80 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-brand-500" />
                Top Performing Culinary Dishes
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Most ordered dishes based on verified tickets</p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              Full Report →
            </Link>
          </div>

          <div className="space-y-3">
            {popular.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No order history available yet.</p>
            ) : (
              popular.slice(0, 5).map((dish: any, idx: number) => (
                <div
                  key={dish.name}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-900/60 border border-gray-800/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-800 text-gray-300 font-extrabold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{dish.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-gray-400 block">{dish.totalQuantity} sold</span>
                    </div>
                    <span className="font-extrabold text-brand-400 text-sm">
                      {formatCurrency(dish.totalSales)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Navigation */}
        <div className="lg:col-span-1 bg-gray-950 rounded-3xl border border-gray-800/80 p-6 shadow-md space-y-3">
          <h2 className="text-base font-bold text-white border-b border-gray-800 pb-3">
            Quick Actions
          </h2>

          <div className="space-y-2">
            <Link
              href="/admin/menu"
              className="p-3 rounded-2xl bg-gray-900 hover:bg-gray-800/80 border border-gray-800 flex items-center justify-between text-xs text-gray-300 transition-colors"
            >
              <span>+ Add / Modify Food Menu</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </Link>

            <Link
              href="/admin/tables"
              className="p-3 rounded-2xl bg-gray-900 hover:bg-gray-800/80 border border-gray-800 flex items-center justify-between text-xs text-gray-300 transition-colors"
            >
              <span>Manage Dining Tables Layout</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </Link>

            <Link
              href="/admin/reservations"
              className="p-3 rounded-2xl bg-gray-900 hover:bg-gray-800/80 border border-gray-800 flex items-center justify-between text-xs text-gray-300 transition-colors"
            >
              <span>Inspect Table Bookings</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </Link>

            <Link
              href="/admin/payments"
              className="p-3 rounded-2xl bg-gray-900 hover:bg-gray-800/80 border border-gray-800 flex items-center justify-between text-xs text-gray-300 transition-colors"
            >
              <span>Audit Customer Payments</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
            </Link>

            <Link
              href="/admin/reports"
              className="p-3 rounded-2xl bg-brand-950/40 hover:bg-brand-950/60 border border-brand-900/60 flex items-center justify-between text-xs text-brand-300 font-bold transition-colors"
            >
              <span>Generate & Export CSV Reports</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS FEED */}
      <div className="bg-gray-950 rounded-3xl border border-gray-800/80 shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Orders Stream</h2>
            <p className="text-xs text-gray-400 mt-0.5">Live incoming customer orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items Count</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white block">{order.customerName}</span>
                    <span className="text-xs text-gray-500">{order.customerEmail}</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
