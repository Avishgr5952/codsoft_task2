'use client';

import React, { useState } from 'react';
import {
  Settings,
  Store,
  MapPin,
  Phone,
  Mail,
  Percent,
  Clock,
  CheckCircle2,
  Bell,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [restaurantName, setRestaurantName] = useState('DineDesk Gourmet Restaurant');
  const [tagline, setTagline] = useState('Digital ordering, reservations and kitchen management made simple.');
  const [address, setAddress] = useState('452 Grand Boulevard, Culinary District, Metropolis 10001');
  const [phone, setPhone] = useState('+1 (555) 019-2831');
  const [email, setEmail] = useState('concierge@dinedesk.com');
  const [currency, setCurrency] = useState('USD ($)');
  const [taxRate, setTaxRate] = useState('8.0');
  const [kitchenSound, setKitchenSound] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Restaurant Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Configure restaurant branding, location, kitchen notifications, and tax policies.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Restaurant settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Information */}
        <div className="bg-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-800/80 shadow-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <Store className="w-4 h-4 text-brand-500" />
            General Restaurant Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="bg-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-800/80 shadow-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <Percent className="w-4 h-4 text-brand-500" />
            Financial & Tax Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                Standard Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Kitchen KDS Preferences */}
        <div className="bg-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-800/80 shadow-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <Bell className="w-4 h-4 text-brand-500" />
            Kitchen Display Notifications
          </h2>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kitchenSound}
                onChange={(e) => setKitchenSound(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-semibold text-gray-300">
                Play sound alert when new order arrives in kitchen queue
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all active:scale-98"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
}
