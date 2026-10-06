'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime, formatTime, formatDate } from '@/lib/utils';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  BellRing,
  CheckCheck,
  RefreshCw,
  UtensilsCrossed,
  CalendarDays,
  Users,
  AlertCircle,
  ArrowRight,
  LogOut,
  Flame,
  LayoutDashboard,
} from 'lucide-react';

export default function KitchenDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'RESERVATIONS'>('ORDERS');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'PENDING' | 'PREPARING' | 'READY' | 'ALL'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Authorization check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'KITCHEN' && user.role !== 'ADMIN') {
        router.push('/menu');
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      const [orderRes, resRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/reservations'),
      ]);

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
      if (resRes.ok) {
        const resData = await resRes.json();
        setReservations(resData);
      }
    } catch (e) {
      console.error('Kitchen dashboard fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'KITCHEN' || user.role === 'ADMIN')) {
      loadData();
      const interval = setInterval(loadData, 5000); // 5-second live polling for kitchen
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { next: 'CONFIRMED', label: 'Confirm Order', bg: 'bg-blue-600 hover:bg-blue-700 text-white' };
      case 'CONFIRMED':
        return { next: 'PREPARING', label: 'Start Cooking', bg: 'bg-orange-600 hover:bg-orange-700 text-white' };
      case 'PREPARING':
        return { next: 'READY', label: 'Mark Ready to Serve', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white' };
      case 'READY':
        return { next: 'COMPLETED', label: 'Complete Order', bg: 'bg-gray-800 hover:bg-gray-900 text-white' };
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status);
    }
    return o.status === statusFilter;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <ChefHat className="w-10 h-10 animate-bounce text-orange-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-gray-100 flex flex-col font-sans">
      {/* KITCHEN TOP BAR */}
      <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                DineDesk <span className="text-orange-500">Kitchen Display System</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                LIVE KDS
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Logged in as {user?.name} ({user?.role})
            </p>
          </div>
        </div>

        {/* Right Actions & Stats Counter */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {pendingCount} Pending
            </span>
            <span className="px-3 py-1 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              {preparingCount} Cooking
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5" />
              {readyCount} Ready
            </span>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              Admin
            </Link>
          )}

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-gray-800 hover:bg-rose-950/60 text-gray-400 hover:text-rose-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TABS & FILTERS */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'ORDERS'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Live Order Queue ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('RESERVATIONS')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'RESERVATIONS'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Dining Reservations ({reservations.length})
            </button>
          </div>

          {activeTab === 'ORDERS' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['ACTIVE', 'PENDING', 'PREPARING', 'READY', 'ALL'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === filter
                      ? 'bg-gray-800 text-white font-bold ring-1 ring-orange-500'
                      : 'bg-gray-900/60 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ORDER QUEUE CARDS */}
        {activeTab === 'ORDERS' ? (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-900 rounded-3xl border border-gray-800" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-24 bg-gray-900/50 rounded-3xl border border-gray-800 max-w-lg mx-auto">
                <ChefHat className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-300">No active kitchen orders</h3>
                <p className="text-xs text-gray-500 mt-1">
                  All orders in this view are completed or none have been placed yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => {
                  const action = getNextAction(order.status);
                  const isPending = order.status === 'PENDING';
                  const isPreparing = order.status === 'PREPARING';
                  const isReady = order.status === 'READY';
                  const isCompleted = order.status === 'COMPLETED';

                  return (
                    <div
                      key={order.id}
                      className={`rounded-3xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                        isPending
                          ? 'bg-amber-950/20 border-amber-600/50 shadow-amber-900/10'
                          : isPreparing
                          ? 'bg-orange-950/20 border-orange-500 shadow-orange-950/20'
                          : isReady
                          ? 'bg-emerald-950/20 border-emerald-500/60 shadow-emerald-950/20'
                          : 'bg-gray-900 border-gray-800'
                      }`}
                    >
                      {/* Order Card Header */}
                      <div className="p-5 border-b border-gray-800/80 bg-gray-900/40">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-lg font-black tracking-tight text-white">
                            {order.orderNumber}
                          </span>
                          <StatusBadge status={order.status} type="order" />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                          <span className="font-semibold text-gray-200">
                            {order.customerName}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px] text-orange-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(order.createdAt?.split('T')[1]?.substring(0, 5) || '')}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-brand-400 font-medium">
                          📍 {order.deliveryAddress || 'Dine-in'}
                        </div>

                        {order.notes && (
                          <div className="mt-2 p-2 rounded-xl bg-orange-950/40 border border-orange-800/40 text-orange-200 text-xs font-medium">
                            Chef Note: {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="p-5 flex-1 space-y-2.5">
                        <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-gray-400">
                          Dishes to prepare:
                        </h4>
                        <div className="space-y-2 divide-y divide-gray-800/60">
                          {order.items?.map((item: any) => (
                            <div
                              key={item.id}
                              className="pt-2 first:pt-0 flex items-start justify-between text-sm"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-black">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-gray-200">
                                  {item.itemName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="p-4 bg-gray-900/80 border-t border-gray-800/80 flex items-center justify-between gap-3">
                        <div className="text-left">
                          <span className="text-[10px] text-gray-500 block">Total</span>
                          <span className="text-sm font-extrabold text-white">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>

                        {action ? (
                          <button
                            onClick={() => handleUpdateStatus(order.id, action.next)}
                            disabled={updatingId === order.id}
                            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 ${action.bg}`}
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* RESERVATIONS SECTION FOR KITCHEN */
          <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-orange-500" />
                Restaurant Table Reservations
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Monitor incoming guest bookings for today and prepare table service.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-950/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Booking Ref</th>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">Table</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Guests</th>
                    <th className="px-6 py-4">Special Requests</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {res.reservationNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white block">{res.customerName}</span>
                        <span className="text-xs text-gray-500">{res.customerPhone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-orange-400">
                          Table {res.table?.tableNumber}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {res.table?.location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white block">
                          {formatDate(res.reservationDate)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(res.reservationTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {res.guestsCount}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate">
                        {res.specialRequests || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={res.status} type="reservation" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
