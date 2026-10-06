'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatDateTime, formatTime } from '@/lib/utils';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  Loader2,
} from 'lucide-react';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

export default function ReservationsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'BOOK' | 'MY'>('BOOK');

  // Booking Form State
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Data State
  const [tables, setTables] = useState<any[]>([]);
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Load Tables
  useEffect(() => {
    async function loadTables() {
      try {
        setLoadingTables(true);
        const res = await fetch('/api/tables');
        if (res.ok) {
          const data = await res.json();
          setTables(data);
          if (data.length > 0 && !selectedTableId) {
            // Pick first table that can fit the guests
            const match = data.find((t: any) => t.capacity >= guests && t.status !== 'MAINTENANCE');
            if (match) setSelectedTableId(match.id);
          }
        }
      } catch (err) {
        console.error('Failed to load tables', err);
      } finally {
        setLoadingTables(false);
      }
    }
    loadTables();
  }, [guests]);

  // Load My Reservations
  const loadMyReservations = async () => {
    if (!user) return;
    try {
      setLoadingReservations(true);
      const res = await fetch('/api/reservations?my=true');
      if (res.ok) {
        const data = await res.json();
        setMyReservations(data);
      }
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'MY') {
      loadMyReservations();
    }
  }, [activeTab, user]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedTableId) {
      setErrorMessage('Please select an available dining table.');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId,
          reservationDate: date,
          reservationTime: time,
          guestsCount: guests,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          specialRequests: specialRequests.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to confirm reservation.');
        setSubmitting(false);
        return;
      }

      setSuccessMessage(
        `Reservation ${data.reservationNumber} confirmed for Table ${data.table?.tableNumber} on ${formatDate(data.reservationDate)} at ${formatTime(data.reservationTime)}!`
      );
      setSpecialRequests('');
      if (user) {
        loadMyReservations();
      }
    } catch (err) {
      setErrorMessage('Network error while processing reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        loadMyReservations();
      }
    } catch (err) {
      console.error('Cancel error', err);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-widest bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200">
            Table Reservations
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
            Reserve Your Dining Experience
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Select your preferred dining space, choose the date & time, and receive instant confirmation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setActiveTab('BOOK')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'BOOK'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Book a New Table
            </button>
            <button
              onClick={() => setActiveTab('MY')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'MY'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Reservations {user ? `(${myReservations.length})` : ''}
            </button>
          </div>
        </div>

        {activeTab === 'BOOK' ? (
          <div>
            {successMessage && (
              <div className="mb-8 p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3.5 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-base">Booking Confirmed!</h4>
                  <p className="text-sm mt-0.5">{successMessage}</p>
                  <button
                    onClick={() => setActiveTab('MY')}
                    className="mt-3 text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
                  >
                    View in My Reservations →
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-8 p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Unable to complete reservation</h4>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Date, Time & Guest Selector */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Date, Time & Guests */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-brand-600" />
                    1. When would you like to dine?
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Reservation Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Number of Guests *
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Time Slot *
                      </label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {formatTime(slot)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Table Selector */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-brand-600" />
                      2. Select Your Table
                    </h2>
                    <span className="text-xs text-gray-500">
                      Filtered for minimum capacity of {guests} {guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>

                  {loadingTables ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {tables.map((tbl) => {
                        const canFit = tbl.capacity >= guests;
                        const isUnderMaintenance = tbl.status === 'MAINTENANCE';
                        const isSelected = selectedTableId === tbl.id;

                        return (
                          <button
                            key={tbl.id}
                            type="button"
                            disabled={!canFit || isUnderMaintenance}
                            onClick={() => setSelectedTableId(tbl.id)}
                            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500 shadow-md scale-102'
                                : canFit && !isUnderMaintenance
                                ? 'border-gray-200 bg-white hover:border-brand-300 hover:bg-gray-50'
                                : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-base text-gray-900">
                                {tbl.tableNumber}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-gray-100 text-gray-700">
                                {tbl.capacity} Seats
                              </span>
                            </div>

                            <div className="mt-3">
                              <span className="text-[11px] text-gray-500 line-clamp-1 block">
                                {tbl.location}
                              </span>
                              <span
                                className={`text-[10px] font-bold mt-1 inline-block ${
                                  isSelected
                                    ? 'text-brand-700'
                                    : !canFit
                                    ? 'text-rose-500'
                                    : 'text-emerald-600'
                                }`}
                              >
                                {isSelected
                                  ? '✓ Selected Table'
                                  : isUnderMaintenance
                                  ? 'Maintenance'
                                  : canFit
                                  ? 'Available'
                                  : 'Too small'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Contact Information */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    3. Guest Details & Special Requests
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Johnson"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 012-3456"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Special Dietary / Seating Requests
                    </label>
                    <input
                      type="text"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Anniversary dinner setup, high chair needed, quiet corner"
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Reservation Summary Card */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm sticky top-24 space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                    Reservation Summary
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-brand-600" /> Date:
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatDate(date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-brand-600" /> Time:
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatTime(time)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-brand-600" /> Guests:
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {guests} {guests === 1 ? 'person' : 'people'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-600" /> Table:
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {tables.find((t) => t.id === selectedTableId)?.tableNumber || 'Not Selected'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !selectedTableId}
                      className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Checking Table Conflict...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Confirm Table Reservation</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                    Zero reservation fees. Free cancellation anytime before the dining slot.
                  </p>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* "MY RESERVATIONS" TAB */
          <div>
            {!user ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-sm max-w-md mx-auto">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">Sign in to view your bookings</h3>
                <p className="text-gray-500 text-xs mt-1">
                  Please log in to track and manage your dining reservations.
                </p>
                <button
                  onClick={() => setActiveTab('BOOK')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
                >
                  Book a Table as Guest
                </button>
              </div>
            ) : loadingReservations ? (
              <div className="space-y-4 max-w-3xl mx-auto">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : myReservations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-sm max-w-md mx-auto">
                <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">No Reservations Yet</h3>
                <p className="text-gray-500 text-xs mt-1">
                  You don't have any table reservations booked under this account.
                </p>
                <button
                  onClick={() => setActiveTab('BOOK')}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
                >
                  Book a Table Now
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {myReservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-extrabold text-gray-900">
                          {res.reservationNumber}
                        </span>
                        <StatusBadge status={res.status} type="reservation" />
                      </div>

                      <h4 className="text-base font-bold text-gray-900">
                        Table {res.table?.tableNumber} ({res.table?.location})
                      </h4>

                      <p className="text-xs text-gray-500">
                        Date: {formatDate(res.reservationDate)} at {formatTime(res.reservationTime)} • {res.guestsCount} {res.guestsCount === 1 ? 'Guest' : 'Guests'}
                      </p>

                      {res.specialRequests && (
                        <p className="text-xs text-brand-700 bg-brand-50/50 p-2 rounded-xl mt-1">
                          Note: {res.specialRequests}
                        </p>
                      )}
                    </div>

                    {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
