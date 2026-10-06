'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { MenuItemWithCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  ShoppingCart,
  Plus,
  Check,
  Flame,
  AlertCircle,
  Eye,
  Filter,
} from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedItemMap, setAddedItemMap] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [menuRes, catRes] = await Promise.all([
          fetch('/api/menu?all=true'), // fetch all items
          fetch('/api/categories'),
        ]);

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setItems(menuData);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (err) {
        console.error('Failed to load menu data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleAddToCart = (item: MenuItemWithCategory) => {
    if (!item.isAvailable) return;
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
    });

    setAddedItemMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-brand-600 font-bold text-xs uppercase tracking-widest bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200">
            Digital Restaurant Menu
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-3 tracking-tight">
            Artisanal Dishes & Gourmet Delights
          </h1>
          <p className="text-gray-600 mt-3 text-sm sm:text-base">
            Prepared fresh to order using finest ingredients. Filter by course or search to find your culinary craving.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-200/80 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Courses ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 flex-shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-96 p-4 border border-gray-100 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div className="bg-gray-200 h-48 rounded-2xl w-full" />
                <div className="space-y-2 mt-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-10 bg-gray-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/80 p-8 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No dishes found</h3>
            <p className="text-gray-500 text-sm mt-1">
              No items match your criteria. Try adjusting your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-50 text-brand-600 font-bold text-xs hover:bg-brand-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const isAdded = addedItemMap[item.id];
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group ${
                    !item.isAvailable ? 'opacity-70 bg-gray-50/80' : ''
                  }`}
                >
                  {/* Food Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Tag */}
                    <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                      {item.category?.name}
                    </div>

                    {/* Featured Flame */}
                    {item.isFeatured && (
                      <div className="absolute top-3.5 right-3.5 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>Chef's Choice</span>
                      </div>
                    )}

                    {/* Unavailable Overlay */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg">
                          Currently Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Food Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/menu/${item.id}`}
                          className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors hover:underline"
                        >
                          {item.name}
                        </Link>
                        <span className="text-lg font-extrabold text-brand-600 flex-shrink-0">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <Link
                        href={`/menu/${item.id}`}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/50 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.isAvailable}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                          !item.isAvailable
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isAdded
                            ? 'bg-emerald-600 text-white scale-98'
                            : 'bg-brand-600 hover:bg-brand-500 text-white active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 text-white" />
                            <span>Added to Cart!</span>
                          </>
                        ) : !item.isAvailable ? (
                          <span>Unavailable</span>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DigitalMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Loading Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
