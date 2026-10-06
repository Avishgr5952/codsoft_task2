'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { StatusBadge, PaymentMethodBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  CheckCheck,
  XCircle,
  ArrowLeft,
  UtensilsCrossed,
  RefreshCw,
  MapPin,
  FileText,
  User,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Received by DineDesk kitchen', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Kitchen acknowledged order', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparing', desc: 'Chef cooking your dishes', icon: ChefHat },
  { key: 'READY', label: 'Ready', desc: 'Plated & awaiting serving', icon: BellRing },
  { key: 'COMPLETED', label: 'Completed', desc: 'Served / Delivered enjoyably', icon: CheckCheck },
];

function OrderTrackingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const isJustConfirmed = searchParams.get('confirmed') === 'true';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
      const interval = setInterval(loadOrder, 6000); // 6s live polling
      return () => clearInterval(interval);
    }
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this pending order?')) return;

    setCancelling(true);
    setCancelError('');

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || 'Failed to cancel order');
      } else {
        setOrder(data);
      }
    } catch (err) {
      setCancelError('Network error while cancelling order.');
    } finally {
      setCancelling(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return -1;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded-3xl" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
        <p className="text-gray-500 mt-2 text-sm">
          We could not locate this order. Please verify your order number.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> View My Orders
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Order ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-brand-600 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-gray-900 font-mono tracking-tight">
                  {order.orderNumber}
                </h1>
                <StatusBadge status={order.status} type="order" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={loadOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Auto-refreshing live</span>
          </button>
        </div>

        {/* Confirmation Banner */}
        {isJustConfirmed && (
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 text-emerald-900 shadow-sm animate-in fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                Order Received Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                Your order has been transmitted directly to our head chef and kitchen staff. You can watch the real-time preparation steps below.
              </p>
            </div>
          </div>
        )}

        {cancelError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{cancelError}</span>
          </div>
        )}

        {/* VISUAL STATUS TIMELINE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">
              Kitchen Preparation Timeline
            </h2>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              {isCancelled ? 'Order Was Cancelled' : `Status: ${order.status}`}
            </span>
          </div>

          {isCancelled ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-rose-900">This order has been cancelled</h3>
              <p className="text-xs text-rose-700 mt-1">
                No charges were incurred or a refund has been initiated.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Stepper Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative">
                {ORDER_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isPast = currentStep > idx;
                  const isCurrent = currentStep === idx;
                  const isPending = currentStep < idx;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-2 relative z-10"
                    >
                      {/* Step Circle */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          isPast
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : isCurrent
                            ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-lg shadow-brand-600/40 animate-pulse'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>

                      {/* Text */}
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            isCurrent
                              ? 'text-brand-600'
                              : isPast
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-gray-500 hidden sm:block mt-0.5 leading-tight">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancellation button if order is still PENDING */}
          {order.status === 'PENDING' && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Need to change your mind before preparation begins?
              </span>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>

        {/* ORDER DETAILS & RECEIPT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Items Breakdown */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Items in this Order
            </h3>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-extrabold text-gray-800">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{item.itemName}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.itemPrice)} each</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(order.tax)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-extrabold text-gray-900">
                <span>Total Paid</span>
                <span className="text-brand-600 text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                Delivery / Dining Info
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 text-gray-600">
                  <User className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 block">{order.customerName}</span>
                    <span className="text-gray-500">{order.customerEmail}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-gray-600">
                  <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 block">Location / Table</span>
                    <span>{order.deliveryAddress || 'Dine-in service'}</span>
                  </div>
                </div>

                {order.notes && (
                  <div className="flex items-start gap-2.5 text-gray-600">
                    <FileText className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 block">Chef Instructions</span>
                      <span>{order.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                Payment Status
              </h3>

              {order.payment ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Method</span>
                    <PaymentMethodBadge method={order.payment.method} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={order.payment.status} type="payment" />
                  </div>
                  {order.payment.transactionRef && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Ref</span>
                      <span className="font-mono text-gray-700">{order.payment.transactionRef}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Pending payment</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Loading Order Details...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
