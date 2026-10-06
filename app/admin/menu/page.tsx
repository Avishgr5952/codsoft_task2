'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItemWithCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Flame,
  UtensilsCrossed,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemWithCategory | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCatId, setFormCatId] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/menu?all=true'),
        fetch('/api/categories'),
      ]);

      if (menuRes.ok) setItems(await menuRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (e) {
      console.error('Error loading menu', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCatId(categories[0]?.id || '');
    setFormImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
    setFormAvailable(true);
    setFormFeatured(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItemWithCategory) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesc(item.description);
    setFormPrice(item.price.toString());
    setFormCatId(item.categoryId);
    setFormImage(item.imageUrl);
    setFormAvailable(item.isAvailable);
    setFormFeatured(item.isFeatured);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formDesc.trim() || !formPrice || !formCatId) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        price: parseFloat(formPrice),
        imageUrl: formImage.trim(),
        categoryId: formCatId,
        isAvailable: formAvailable,
        isFeatured: formFeatured,
      };

      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save menu item');
      } else {
        setModalOpen(false);
        loadData();
      }
    } catch (err) {
      setFormError('Network error while saving item.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItemWithCategory) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
        );
      }
    } catch (e) {
      console.error('Toggle error', e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCat === 'all' || item.categoryId === selectedCat;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Menu Items Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Create, modify, toggle availability, and configure pricing for all food items.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCat === 'all'
                ? 'bg-brand-600 text-white font-bold'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === c.id
                  ? 'bg-brand-600 text-white font-bold'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-950 rounded-3xl border border-gray-800/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/60 text-xs uppercase font-extrabold tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name & Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      {item.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-300">
                    {item.category?.name}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-white">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                        title="Edit Item"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 rounded-lg bg-gray-900 hover:bg-rose-950/60 text-gray-400 hover:text-rose-400 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Menu Dish' : 'Create New Menu Dish'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pan-Seared Atlantic Salmon"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formCatId}
                    onChange={(e) => setFormCatId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="24.50"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ingredients, preparation, flavor profile..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Available for Ordering</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Chef's Choice / Featured</span>
                </label>
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
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingItem ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
