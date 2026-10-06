'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import {
  UtensilsCrossed,
  ShoppingCart,
  CalendarDays,
  Receipt,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ChefHat,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Do not render default navbar inside full admin layout to avoid duplicate navigation
  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/reservations', label: 'Reservations' },
    { href: '/orders', label: 'My Orders' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-brand-600 transition-colors">
                Dine<span className="text-brand-600">Desk</span>
              </span>
              <span className="hidden sm:block text-[10px] text-gray-600 -mt-1 font-medium tracking-wide">
                RESTAURANT & KITCHEN
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-brand-600 bg-brand-50 font-semibold'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Quick role shortcuts if logged in */}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                Admin Panel
              </Link>
            )}

            {user?.role === 'KITCHEN' && (
              <Link
                href="/kitchen/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-sm"
              >
                <ChefHat className="w-3.5 h-3.5" />
                Kitchen Display
              </Link>
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-md animate-bounce">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth status */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 text-sm font-medium transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase bg-brand-50 text-brand-700 border border-brand-200">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                      >
                        <UserIcon className="w-4 h-4 text-gray-600" />
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                      >
                        <Receipt className="w-4 h-4 text-gray-600" />
                        Order History
                      </Link>
                      <Link
                        href="/reservations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                      >
                        <CalendarDays className="w-4 h-4 text-gray-600" />
                        My Reservations
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-900 font-medium hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      {user.role === 'KITCHEN' && (
                        <Link
                          href="/kitchen/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-orange-600 font-medium hover:bg-orange-50"
                        >
                          <ChefHat className="w-4 h-4 text-orange-600" />
                          Kitchen Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-base font-medium ${
                pathname === link.href
                  ? 'bg-brand-50 text-brand-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold bg-gray-900 text-amber-400"
            >
              Admin Dashboard
            </Link>
          )}

          {user?.role === 'KITCHEN' && (
            <Link
              href="/kitchen/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold bg-orange-600 text-white"
            >
              Kitchen Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
