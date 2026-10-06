'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { formatCurrency } from '@/lib/utils';
import {
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, subtotal, tax, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('Table #1');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'CASH'>('CARD');

  // Simulated card fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Simulated UPI field
  const [upiId, setUpiId] = useState('user@okaxis');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50/50 min-h-screen py-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Please add some food items from our menu before proceeding to checkout.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 text-white font-bold text-sm shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate realistic payment gateway processing latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const locationDetails =
        orderType === 'DINE_IN'
          ? `Dine-in: ${tableNumber}`
          : `Takeaway / Address: ${deliveryAddress || 'Counter Pickup'}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: locationDetails,
          notes: notes.trim() || undefined,
          items: cartItems.map((ci) => ({
            menuItemId: ci.menuItemId,
            name: ci.name,
            quantity: ci.quantity,
          })),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place order.');
        setIsSubmitting(false);
        return;
      }

      // Clear cart
      clearCart();

      // Redirect to order tracking page
      router.push(`/orders/${data.id}?confirmed=true`);
    } catch (err) {
      console.error('Order checkout error', err);
      setErrorMessage('A network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-6">
          <Link href="/cart" className="hover:text-brand-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <span>/</span>
          <span className="text-gray-900">Secure Checkout</span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
          Complete Your Order
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Dining Type Selection */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                1. Dining Preference
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setOrderType('DINE_IN')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    orderType === 'DINE_IN'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="font-bold text-gray-900 text-sm">Dine-in at Restaurant</span>
                  <span className="text-xs text-gray-500 mt-1">Serve fresh to your table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('TAKEAWAY')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    orderType === 'TAKEAWAY'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="font-bold text-gray-900 text-sm">Takeaway / Delivery</span>
                  <span className="text-xs text-gray-500 mt-1">Pack securely for pickup</span>
                </button>
              </div>

              {orderType === 'DINE_IN' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Table Selection
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Table #1 (Window Side)">Table #1 (Window Side - Street View)</option>
                    <option value="Table #2 (Window Side)">Table #2 (Window Side - Street View)</option>
                    <option value="Table #3 (Indoor Main Dining)">Table #3 (Indoor Main Dining Hall)</option>
                    <option value="Table #4 (Indoor Main Dining)">Table #4 (Indoor Main Dining Hall)</option>
                    <option value="Table #5 (Family Booth Alcove)">Table #5 (Family Booth Alcove)</option>
                    <option value="Table #6 (Private VIP Room)">Table #6 (Private VIP Room)</option>
                    <option value="Table #7 (Romantic Garden Patio)">Table #7 (Romantic Garden Patio)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Pickup Counter or Delivery Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Counter pickup in 25 mins or Suite 402 Metropolis"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Customer Contact Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                2. Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 012-3456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Special Kitchen Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Allergies, extra sauce, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  3. Payment Method (Simulated)
                </h2>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Sandbox Simulation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 text-brand-700 font-bold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 text-brand-700 font-bold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-bold">Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 text-brand-700 font-bold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Cash on Counter</span>
                </button>
              </div>

              {/* Dynamic Payment Details Mock */}
              {paymentMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <label className="block text-xs font-semibold text-gray-600">
                    Virtual Payment Address (VPA) / UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white font-mono"
                  />
                  <p className="text-[11px] text-gray-500">
                    Payment will be auto-simulated as verified upon clicking Confirm Order.
                  </p>
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                  <strong>Cash on Counter / Table:</strong> Your order will be sent to the kitchen immediately with PENDING payment status, and marked PAID when our staff collects cash.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                Order Review
              </h2>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {cartItems.map((ci) => (
                  <div key={ci.menuItemId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="font-bold text-gray-900 w-5">{ci.quantity}x</span>
                      <span className="truncate text-gray-700 font-medium">{ci.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(ci.price * ci.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5 flex justify-between text-base font-extrabold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-brand-600 text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm & Place Order</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Simulated Transaction • Immediate Kitchen Dispatch</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
