import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import {
  UtensilsCrossed,
  CalendarDays,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Flame,
  ChefHat,
  Star,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 60; // revalidate every minute

export default async function HomePage() {
  const [categories, featuredItems] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.menuItem.findMany({
      where: { isFeatured: true, isAvailable: true },
      include: { category: true },
      take: 6,
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gray-950 text-white overflow-hidden">
        {/* Background Overlay Image */}
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="DineDesk Restaurant Ambiance"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Award-Winning Modern Gastronomy & Artisanal Dining</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-none">
            Culinary Artistry, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-amber-300 to-brand-500">
              Seamlessly Served.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
            Welcome to DineDesk. Explore our chef-crafted seasonal menu, order directly to your table or doorstep, and reserve your dining experience in seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span>Explore Digital Menu</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/reservations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-base backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <CalendarDays className="w-5 h-5 text-amber-400" />
              <span>Reserve a Table</span>
            </Link>
          </div>

          {/* Quick Value Props */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-left w-full max-w-4xl border-t border-white/10 pt-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Master Chefs</p>
                <p className="text-xs text-gray-400">Artisanal farm recipes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Fast Ordering</p>
                <p className="text-xs text-gray-400">Real-time kitchen prep</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pure Freshness</p>
                <p className="text-xs text-gray-400">100% organic produce</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">5-Star Dining</p>
                <p className="text-xs text-gray-400">Critically celebrated</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOD CATEGORIES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">
                Browse By Category
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
                Curated Culinary Selections
              </h2>
            </div>
            <Link
              href="/menu"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.id}`}
                className="group relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5"
              >
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <h3 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-200 mt-1.5 line-clamp-2">
                    {cat.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 mt-3">
                    Explore items <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DISHES SECTION */}
      <section className="py-20 bg-gray-50 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-brand-600" />
              Chef's Signatures
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Handpicked Dishes of the Season
            </h2>
            <p className="text-gray-600 mt-3 text-base">
              Each recipe is delicately crafted by Executive Chef Marco, featuring premium locally-sourced cuts, wild catches, and handcrafted pastas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    {dish.category?.name}
                  </div>
                  <div className="absolute top-3.5 right-3.5 bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                    {formatCurrency(dish.price)}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/menu/${dish.id}`}
                      className="text-xs font-bold text-gray-700 hover:text-brand-600 flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/menu/${dish.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-semibold text-xs transition-all shadow-sm"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-md transition-all hover:scale-105"
            >
              <span>Explore All Dishes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* RESTAURANT STORY / PHILOSOPHY */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                alt="DineDesk Dining Room & Kitchen"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/95 backdrop-blur-md text-gray-900 shadow-xl border border-white/50">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold italic text-gray-800">
                  "DineDesk redefines hospitality. The ingredients are sublime, and having digital table ordering with live kitchen updates was pure perfection."
                </p>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  — Metropolis Food & Wine Critic
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-brand-600 font-bold text-sm uppercase tracking-wider">
                Our Gastronomic Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                Crafted with Passion, Served with Modern Innovation.
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At DineDesk, our kitchen bridges age-old artisanal culinary techniques with a seamless modern dining platform. We partner directly with organic family farms, coastal fisheries, and artisanal vineyards to ensure that every single ingredient on your plate tells an unforgettable story.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Zero Artificial Preservatives: 100% freshly prepared from scratch every morning.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Precision Kitchen Workflow: Your food transitions directly from stove to table in record time.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Guaranteed Table Reservation: Choose your exact table setting with instant confirmation.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  href="/reservations"
                  className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  Book Your Experience
                </Link>
                <Link
                  href="/menu"
                  className="px-6 py-3.5 rounded-xl border border-gray-300 hover:border-gray-400 text-gray-800 font-bold text-sm transition-all"
                >
                  View Digital Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABLE RESERVATION CTA CALLOUT */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-brand-950 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              Reserve Your Table Today
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Planning a Special Dinner, Date Night, or Group Gathering?
            </h2>
            <p className="text-gray-300 text-sm mt-2 max-w-xl">
              Lock in your preferred table (Street-view window, cozy booths, or private VIP salon) with real-time availability check.
            </p>
          </div>
          <Link
            href="/reservations"
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-base shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <CalendarDays className="w-5 h-5" />
            <span>Select Table & Time</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
