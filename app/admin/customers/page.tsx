'use client';

import React, { useState, useEffect } from 'react';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Users,
  Search,
  Eye,
  X,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Receipt,
  CalendarDays,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (e) {
      console.error('Error loading customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCustomerModal = async (id: string) => {
    setSelectedCustomerId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        setCustomerDetails(await res.json());
      }
    } catch (e) {
      console.error('Error loading customer details', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Registered Customers
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Directory of registered diners, their order volumes, and reservation histories.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gray-950 rounded-3xl border border-gray-800/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Orders Placed</th>
                <th className="px-6 py-4">Table Bookings</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.email}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {c.phone || '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {c.ordersCount} orders
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-300">
                    {c.reservationsCount} bookings
                  </td>
                  <td className="px-6 py-4 font-extrabold text-brand-400">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openCustomerModal(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER HISTORY MODAL */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                Customer Profile & Order History
              </h3>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails || !customerDetails ? (
              <div className="py-12 text-center text-gray-400 animate-pulse">
                Loading customer activity...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Summary */}
                <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">Name & Email</span>
                    <span className="font-bold text-white text-sm">{customerDetails.name}</span>
                    <span className="text-gray-400 block">{customerDetails.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Registered Since</span>
                    <span className="font-semibold text-white">{formatDate(customerDetails.createdAt)}</span>
                    <span className="text-gray-400 block mt-1">Phone: {customerDetails.phone || 'None provided'}</span>
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-brand-400" />
                    Completed & Active Orders ({customerDetails.orders?.length || 0})
                  </h4>

                  {customerDetails.orders?.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No orders recorded yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {customerDetails.orders?.map((ord: any) => (
                        <div
                          key={ord.id}
                          className="p-3.5 rounded-xl bg-gray-900 border border-gray-800/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                              <StatusBadge status={ord.status} type="order" />
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-1">
                              {formatDateTime(ord.createdAt)} • {ord.items?.length} items
                            </span>
                          </div>
                          <span className="font-extrabold text-white text-sm">
                            {formatCurrency(ord.totalAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reservations List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-400" />
                    Table Reservations ({customerDetails.reservations?.length || 0})
                  </h4>

                  {customerDetails.reservations?.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">No reservations found.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {customerDetails.reservations?.map((res: any) => (
                        <div
                          key={res.id}
                          className="p-3.5 rounded-xl bg-gray-900 border border-gray-800/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">{res.reservationNumber}</span>
                              <StatusBadge status={res.status} type="reservation" />
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-1">
                              Table {res.table?.tableNumber} • {formatDate(res.reservationDate)} at {res.reservationTime}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-300">
                            {res.guestsCount} guests
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
