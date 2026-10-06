'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  CalendarDays,
  Grid,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  ChefHat,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/menu');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Shield className="w-10 h-10 text-brand-500 animate-pulse" />
          <p className="text-sm font-semibold text-gray-400">Verifying Administrator Privileges...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/menu', label: 'Menu Items', icon: UtensilsCrossed },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
    { href: '/admin/tables', label: 'Table Management', icon: Grid },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Restaurant Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-gray-950 border-b border-gray-800 p-4 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-base">
            DineDesk <span className="text-amber-400">Admin</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-950 border-r border-gray-800/80 p-5 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight">
                  DineDesk
                </span>
                <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider -mt-1">
                  Control Center
                </span>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Shortcuts */}
        <div className="pt-6 border-t border-gray-800/80 space-y-2">
          <Link
            href="/kitchen/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-orange-400 hover:bg-orange-950/40 transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Display System</span>
          </Link>

          <Link
            href="/menu"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Public Customer Menu</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 bg-gray-900 overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
