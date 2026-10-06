'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge, PaymentMethodBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  CreditCard,
  DollarSign,
  Search,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadPayments = async () => {
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        setPayments(await res.json());
      }
    } catch (e) {
      console.error('Error loading payments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCash = payments
    .filter((p) => p.status === 'PENDING' && p.method === 'CASH')
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter((p) => {
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      p.order?.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.order?.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(search.toLowerCase()));
    return matchesMethod && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Payments & Transactions Audit
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time ledger of card, UPI, and cash payments linked with customer order receipts.
          </p>
        </div>

        <button
          onClick={loadPayments}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Transactions</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <span className="text-xs font-bold uppercase text-gray-400 block">Total Volume Collected</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2 block">
            {formatCurrency(totalCollected)}
          </span>
          <p className="text-[11px] text-gray-500 mt-1">Settled & verified payments</p>
        </div>

        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <span className="text-xs font-bold uppercase text-gray-400 block">Pending Cash on Counter</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2 block">
            {formatCurrency(pendingCash)}
          </span>
          <p className="text-[11px] text-gray-500 mt-1">Due for collection at desk</p>
        </div>

        <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800/80 shadow-md">
          <span className="text-xs font-bold uppercase text-gray-400 block">Total Transactions</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-2 block">
            {payments.length}
          </span>
          <p className="text-[11px] text-gray-500 mt-1">All processed invoices</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Method Filters */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-2xl border border-gray-800">
            {['ALL', 'CARD', 'UPI', 'CASH'].map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  methodFilter === m
                    ? 'bg-brand-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-2xl border border-gray-800">
            {['ALL', 'PAID', 'PENDING', 'REFUNDED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-brand-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ref #, order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gray-950 rounded-3xl border border-gray-800/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Transaction Ref</th>
                <th className="px-6 py-4">Order Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white text-xs">
                    {p.transactionRef || 'CASH-COUNTER'}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-brand-400">
                    {p.order?.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white block">{p.order?.customerName}</span>
                    <span className="text-xs text-gray-500">{p.order?.customerEmail}</span>
                  </td>
                  <td className="px-6 py-4">
                    <PaymentMethodBadge method={p.method} />
                  </td>
                  <td className="px-6 py-4 font-extrabold text-white text-base">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {formatDateTime(p.paidAt || p.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={p.status} type="payment" />
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
