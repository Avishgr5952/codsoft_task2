'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatTime } from '@/lib/utils';
import {
  CalendarDays,
  Clock,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  CheckCheck,
  RefreshCw,
  Filter,
} from 'lucide-react';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReservations = async () => {
    try {
      let url = '/api/reservations';
      const params = new URLSearchParams();
      if (dateFilter) params.append('date', dateFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        setReservations(await res.json());
      }
    } catch (e) {
      console.error('Error loading reservations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [dateFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
    } catch (e) {
      console.error('Update reservation error', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.reservationNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.table?.tableNumber.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dining Reservations Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Review guest bookings, confirm tables, and manage dining seatings.
          </p>
        </div>

        <button
          onClick={loadReservations}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Bookings</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white font-bold'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-brand-400 hover:underline"
            >
              Clear Date
            </button>
          )}

          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest or table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-gray-950 rounded-3xl border border-gray-800/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">Guest Contact</th>
                <th className="px-6 py-4">Table</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Party Size</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    {res.reservationNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white block">{res.customerName}</span>
                    <span className="text-xs text-gray-500 block">{res.customerEmail}</span>
                    {res.customerPhone && (
                      <span className="text-xs text-gray-500">{res.customerPhone}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-brand-400">
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
                  <td className="px-6 py-4 font-extrabold text-white">
                    {res.guestsCount} guests
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate">
                    {res.specialRequests || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={res.status} type="reservation" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {res.status === 'PENDING' && (
                        <button
                          disabled={updatingId === res.id}
                          onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                          title="Confirm Reservation"
                        >
                          Confirm
                        </button>
                      )}

                      {res.status === 'CONFIRMED' && (
                        <button
                          disabled={updatingId === res.id}
                          onClick={() => handleUpdateStatus(res.id, 'COMPLETED')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                          title="Mark Seated / Completed"
                        >
                          Seated
                        </button>
                      )}

                      {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                        <button
                          disabled={updatingId === res.id}
                          onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                          className="p-1.5 rounded-lg bg-gray-900 hover:bg-rose-950/60 text-gray-400 hover:text-rose-400 transition-colors"
                          title="Cancel Reservation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
