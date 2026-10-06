'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { MenuItemWithCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Flame,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function FoodDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { addToCart } = useCart();

  const [item, setItem] = useState<MenuItemWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const res = await fetch(`/api/menu/${id}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data);
        } else {
          setItem(null);
        }
      } catch (err) {
        console.error('Error fetching food details', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadItem();
  }, [id]);

  const handleAdd = () => {
    if (!item || !item.isAvailable) return;
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Dish not found</h2>
        <p className="text-gray-500 mt-2 text-sm">
          The requested menu item does not exist or has been removed.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Digital Menu
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Image Box */}
            <div className="relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden shadow-md bg-gray-100">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />

              {/* Status & Category overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                  {item.category?.name}
                </span>

                {item.isFeatured && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Chef's Choice
                  </span>
                )}
              </div>

              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="px-5 py-2.5 rounded-full bg-rose-600 text-white text-sm font-extrabold uppercase tracking-wider shadow-xl">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Details Box */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      item.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {item.isAvailable ? 'Available Now' : 'Out of Stock'}
                  </span>

                  <span className="text-3xl font-extrabold text-brand-600">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
                  {item.name}
                </h1>

                <p className="text-gray-600 mt-4 text-base leading-relaxed">
                  {item.description}
                </p>

                {/* Highlights */}
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                    <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span>Cooked to Order (15-20m)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>Fresh & 100% Quality Checked</span>
                  </div>
                </div>
              </div>

              {/* Quantity and Add to Cart Section */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                  <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || !item.isAvailable}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-base font-extrabold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={!item.isAvailable}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Total: {formatCurrency(item.price * quantity)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAdd}
                    disabled={!item.isAvailable}
                    className={`flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl font-bold text-base shadow-lg transition-all ${
                      !item.isAvailable
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : added
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 active:scale-98'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5 text-white" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add {quantity} to Cart ({formatCurrency(item.price * quantity)})</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      handleAdd();
                      router.push('/cart');
                    }}
                    disabled={!item.isAvailable}
                    className="sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-2xl border border-gray-300 hover:border-gray-400 bg-white text-gray-800 font-bold text-base transition-colors disabled:opacity-40"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
