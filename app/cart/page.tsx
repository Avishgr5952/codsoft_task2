'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { formatCurrency } from '@/lib/utils';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
    itemCount,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50/50 min-h-screen py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-6 shadow-sm">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Your Cart is Empty
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed">
            Looks like you haven't added any culinary dishes yet. Explore our freshly prepared menu and satisfy your appetite!
          </p>
          <div className="mt-8">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Digital Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Review Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Inspect your culinary choices before placing your order.
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 p-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Entire Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
              >
                {/* Image */}
                <div className="relative w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <span className="text-base font-extrabold text-brand-600">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(item.price)} each
                  </p>

                  {/* Quantity and Remove */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="text-xs font-semibold text-gray-400 hover:text-rose-600 transition-colors flex items-center gap-1 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Add More Dishes from Menu
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kitchen Service Fee</span>
                  <span className="font-semibold text-emerald-600 uppercase text-xs">FREE</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-brand-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => router.push('/checkout')}
                  disabled={cartItems.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Simulated Secure Checkout • Real-time kitchen dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
