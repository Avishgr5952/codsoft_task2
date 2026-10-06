'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Grid,
  Plus,
  Pencil,
  Trash2,
  Users,
  MapPin,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);

  // Form State
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [location, setLocation] = useState('Indoor Main Dining Hall');
  const [status, setStatus] = useState<'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE'>('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadTables = async () => {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        setTables(await res.json());
      }
    } catch (e) {
      console.error('Error loading tables', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const openCreateModal = () => {
    setEditingTable(null);
    setTableNumber(`T-0${tables.length + 1}`);
    setCapacity('4');
    setLocation('Indoor Main Dining Hall');
    setStatus('AVAILABLE');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (tbl: any) => {
    setEditingTable(tbl);
    setTableNumber(tbl.tableNumber);
    setCapacity(tbl.capacity.toString());
    setLocation(tbl.location);
    setStatus(tbl.status);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tableNumber.trim() || !capacity || !location.trim()) {
      setError('Table number, capacity, and location are required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        tableNumber: tableNumber.trim(),
        capacity: parseInt(capacity, 10),
        location: location.trim(),
        status,
      };

      const url = editingTable ? `/api/tables/${editingTable.id}` : '/api/tables';
      const method = editingTable ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save table');
      } else {
        setModalOpen(false);
        loadTables();
      }
    } catch (err) {
      setError('Network error saving table.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTables((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (e) {
      console.error('Status change error', e);
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Are you sure you want to delete table ${num}?`)) return;

    try {
      const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTables((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Restaurant Tables Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Configure floor layout, seating capacities, and real-time occupancy status.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Visual Floor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((tbl) => (
          <div
            key={tbl.id}
            className={`p-6 rounded-3xl border flex flex-col justify-between transition-all bg-gray-950 shadow-md ${
              tbl.status === 'AVAILABLE'
                ? 'border-emerald-600/40 hover:border-emerald-500'
                : tbl.status === 'OCCUPIED'
                ? 'border-purple-600/40 hover:border-purple-500'
                : tbl.status === 'RESERVED'
                ? 'border-blue-600/40 hover:border-blue-500'
                : 'border-zinc-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-2xl text-white font-mono">
                  {tbl.tableNumber}
                </span>
                <StatusBadge status={tbl.status} type="table" />
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span className="text-white font-semibold">{tbl.capacity} Person Capacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span>{tbl.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-900 space-y-3">
              {/* Quick Status Dropdown */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[11px] uppercase font-bold">Status:</span>
                <select
                  value={tbl.status}
                  onChange={(e) => handleStatusChange(tbl.id, e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              {/* Edit & Delete Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => openEditModal(tbl)}
                  className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                  title="Edit Table"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tbl.id, tbl.tableNumber)}
                  className="p-2 rounded-lg bg-gray-900 hover:bg-rose-950/60 text-gray-400 hover:text-rose-400 transition-colors"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT TABLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingTable ? 'Edit Table Settings' : 'Add New Dining Table'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Table Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-09, VIP-1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Seating Capacity (Guests) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Location / Zone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Window Side (Street View), Patio"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTable ? 'Update Table' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
