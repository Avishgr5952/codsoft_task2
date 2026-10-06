import React from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  CheckCheck,
  XCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'reservation' | 'table' | 'payment';
  className?: string;
}

export function StatusBadge({ status, type = 'order', className = '' }: StatusBadgeProps) {
  let color = 'bg-gray-100 text-gray-800 border-gray-200';
  let Icon = Clock;
  let label = status;

  switch (status) {
    // Order & Reservation
    case 'PENDING':
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Clock;
      label = 'Pending';
      break;
    case 'CONFIRMED':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = CheckCircle2;
      label = 'Confirmed';
      break;
    case 'PREPARING':
      color = 'bg-orange-50 text-orange-700 border-orange-300 animate-pulse';
      Icon = ChefHat;
      label = 'Preparing';
      break;
    case 'READY':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      Icon = BellRing;
      label = 'Ready for Pickup / Table';
      break;
    case 'COMPLETED':
      color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      Icon = CheckCheck;
      label = 'Completed';
      break;
    case 'CANCELLED':
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      label = 'Cancelled';
      break;

    // Table Status
    case 'AVAILABLE':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      Icon = CheckCircle2;
      label = 'Available';
      break;
    case 'RESERVED':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Clock;
      label = 'Reserved';
      break;
    case 'OCCUPIED':
      color = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = ChefHat;
      label = 'Occupied';
      break;
    case 'MAINTENANCE':
      color = 'bg-zinc-100 text-zinc-700 border-zinc-300';
      Icon = AlertCircle;
      label = 'Maintenance';
      break;

    // Payment Status
    case 'PAID':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      Icon = CheckCheck;
      label = 'Paid';
      break;
    case 'FAILED':
      color = 'bg-red-50 text-red-700 border-red-200';
      Icon = XCircle;
      label = 'Failed';
      break;
    case 'REFUNDED':
      color = 'bg-zinc-100 text-zinc-600 border-zinc-200';
      Icon = AlertCircle;
      label = 'Refunded';
      break;

    default:
      color = 'bg-gray-100 text-gray-700 border-gray-200';
      label = status;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export function PaymentMethodBadge({ method }: { method: string }) {
  let Icon = CreditCard;
  let label = method;
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  if (method === 'CASH') {
    Icon = Banknote;
    label = 'Cash on Counter';
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (method === 'UPI') {
    Icon = Smartphone;
    label = 'Instant UPI';
    bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (method === 'CARD') {
    Icon = CreditCard;
    label = 'Credit / Debit Card';
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${bg}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
}
