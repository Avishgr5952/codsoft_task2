import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Clock, MapPin, Phone, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Dine<span className="text-brand-500">Desk</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Modern digital dining, table reservations, and seamless kitchen operations crafted to elevate your culinary experience.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>for exceptional hospitality.</span>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              Dining Hours
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Monday – Thursday:</span>
                <span className="text-white font-medium">11:00 AM – 10:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday – Saturday:</span>
                <span className="text-white font-medium">11:00 AM – 11:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday Brunch & Dinner:</span>
                <span className="text-white font-medium">10:00 AM – 10:00 PM</span>
              </li>
              <li className="pt-2 text-xs text-emerald-400 font-medium">
                ● Kitchen open for live online ordering now
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-brand-400 transition-colors">
                  Digital Food Menu
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-brand-400 transition-colors">
                  Table Reservations
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-brand-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-brand-400 transition-colors">
                  Order Tracking & History
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-400 transition-colors">
                  Staff & Kitchen Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact & Location
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 mt-1 flex-shrink-0" />
                <span>452 Grand Boulevard, Culinary District, Metropolis 10001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>+1 (555) 019-2831</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>concierge@dinedesk.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} DineDesk – Restaurant Ordering Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Food Safety Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
