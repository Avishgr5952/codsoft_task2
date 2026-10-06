'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        setReport(await res.json());
      }
    } catch (e) {
      console.error('Error loading reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    if (!report) return;

    const summary = report.summary || {};
    const popular = report.popularItems || [];

    // Construct CSV String
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Summary Section
    csvContent += 'DINEDESK RESTAURANT OPERATIONS REPORT\n';
    csvContent += `Generated On,${new Date().toISOString()}\n`;
    csvContent += `Date Range,${startDate || 'All Time'} to ${endDate || 'Present'}\n\n`;

    csvContent += 'KEY PERFORMANCE METRICS\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Revenue,$${summary.totalRevenue || 0}\n`;
    csvContent += `Total Orders,${summary.totalOrders || 0}\n`;
    csvContent += `Completed Orders,${summary.completedOrders || 0}\n`;
    csvContent += `Cancelled Orders,${summary.cancelledOrders || 0}\n`;
    csvContent += `Total Customers,${summary.totalCustomers || 0}\n`;
    csvContent += `Total Reservations,${summary.totalReservations || 0}\n\n`;

    // Popular Items Section
    csvContent += 'POPULAR MENU ITEMS\n';
    csvContent += 'Dish Name,Quantity Sold,Total Sales ($)\n';
    popular.forEach((item: any) => {
      csvContent += `"${item.name}",${item.totalQuantity},${item.totalSales}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `dinedesk-report-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = report?.summary || {};
  const popular = report?.popularItems || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Executive Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Revenue trends, fulfillment rates, and dish popularity with date range filters.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={loading || !report}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Summary CSV</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-brand-400 hover:underline ml-2"
            >
              Reset Range
            </button>
          )}
        </div>

        <span className="text-xs text-gray-500">
          Showing data: {startDate || 'Start'} to {endDate || 'Present'}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800/80 shadow-md">
          <span className="text-xs font-bold uppercase text-gray-400 block">Gross Revenue</span>
          <span className="text-3xl font-extrabold text-brand-400 mt-2 block">
            {formatCurrency(summary.totalRevenue || 0)}
          </span>
          <p className="text-[11px] text-emerald-400 mt-1">Paid and completed orders</p>
        </div>

        <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800/80 shadow-md">
          <span className="text-xs font-bold uppercase text-gray-400 block">Total Orders</span>
          <span className="text-3xl font-extrabold text-white mt-2 block">
            {summary.totalOrders || 0}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">
            {summary.completedOrders || 0} successfully delivered
          </p>
        </div>

        <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800/80 shadow-md">
          <span className="text-xs font-bold uppercase text-gray-400 block">Cancelled Orders</span>
          <span className="text-3xl font-extrabold text-rose-400 mt-2 block">
            {summary.cancelledOrders || 0}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">
            {summary.totalOrders
              ? `${Math.round(((summary.cancelledOrders || 0) / summary.totalOrders) * 100)}% cancellation rate`
              : '0% rate'}
          </p>
        </div>

        <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800/80 shadow-md">
          <span className="text-xs font-bold uppercase text-gray-400 block">Table Reservations</span>
          <span className="text-3xl font-extrabold text-purple-400 mt-2 block">
            {summary.totalReservations || 0}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">Dining room covers</p>
        </div>
      </div>

      {/* Popular Menu Items Breakdown */}
      <div className="bg-gray-950 rounded-3xl border border-gray-800/80 p-6 sm:p-8 shadow-md space-y-6">
        <div className="border-b border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-brand-500" />
            Most Popular Menu Items Ranking
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Ranked by order volume and total revenue generated during selected period.
          </p>
        </div>

        {popular.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No sales data found for this date range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3.5">Rank</th>
                  <th className="px-6 py-3.5">Dish Name</th>
                  <th className="px-6 py-3.5">Total Quantity Sold</th>
                  <th className="px-6 py-3.5">Total Sales Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {popular.map((item: any, idx: number) => (
                  <tr key={item.name} className="hover:bg-gray-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      #{idx + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-300">
                      {item.totalQuantity} servings
                    </td>
                    <td className="px-6 py-4 font-extrabold text-brand-400">
                      {formatCurrency(item.totalSales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
