'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Shield,
  ChefHat,
  User,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid email or password.');
      setIsSubmitting(false);
    } else {
      router.push(res.redirectTo || '/menu');
      router.refresh();
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
            Sign In to DineDesk
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Access your orders, reservations, or staff dashboard.
          </p>
        </div>

        {/* Demo Accounts Quick Selector */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-4 mb-6 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            Instant Demo Account Fill:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@dinedesk.com', 'Admin@123')}
              className="px-2.5 py-2 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100/50 transition-colors flex flex-col items-center justify-center text-center shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-gray-900 mb-0.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('kitchen@dinedesk.com', 'Kitchen@123')}
              className="px-2.5 py-2 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100/50 transition-colors flex flex-col items-center justify-center text-center shadow-xs"
            >
              <ChefHat className="w-3.5 h-3.5 text-orange-600 mb-0.5" />
              <span>Kitchen</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('customer@dinedesk.com', 'Customer@123')}
              className="px-2.5 py-2 rounded-xl bg-white border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100/50 transition-colors flex flex-col items-center justify-center text-center shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-brand-600 mb-0.5" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-600/30 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Don't have a DineDesk customer account?{' '}
              <Link href="/register" className="font-bold text-brand-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
