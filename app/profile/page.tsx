'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  CalendarDays,
  Receipt,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  ChefHat,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState({ ordersCount: 0, reservationsCount: 0, totalSpent: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        const [ordersRes, resRes] = await Promise.all([
          fetch('/api/orders?my=true'),
          fetch('/api/reservations?my=true'),
        ]);

        if (ordersRes.ok && resRes.ok) {
          const orders = await ordersRes.json();
          const reservations = await resRes.json();
          const spent = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

          setStats({
            ordersCount: orders.length,
            reservationsCount: reservations.length,
            totalSpent: spent,
          });
        }
      } catch (e) {
        console.error('Error loading profile stats', e);
      }
    }
    loadStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen py-20 max-w-4xl mx-auto px-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-3xl mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-brand-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
              {user.phone && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center sm:justify-start gap-2">
                  <Phone className="w-3.5 h-3.5" /> {user.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 rounded-xl bg-gray-900 text-amber-400 font-bold text-xs flex items-center gap-1.5 hover:bg-black"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            {user.role === 'KITCHEN' && (
              <Link
                href="/kitchen/dashboard"
                className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-orange-700"
              >
                <ChefHat className="w-4 h-4" />
                Kitchen Display
              </Link>
            )}

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Orders Placed</span>
              <span className="text-2xl font-extrabold text-gray-900">{stats.ordersCount}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Table Bookings</span>
              <span className="text-2xl font-extrabold text-gray-900">{stats.reservationsCount}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Total Spend</span>
              <span className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/orders"
              className="p-4 rounded-2xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">View Order History</p>
                  <p className="text-xs text-gray-500">Track and view receipts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
            </Link>

            <Link
              href="/reservations"
              className="p-4 rounded-2xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50/40 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Manage Reservations</p>
                  <p className="text-xs text-gray-500">View or book dining tables</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
