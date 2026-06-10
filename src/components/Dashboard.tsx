import React, { useState, useMemo } from 'react';
import { Booking, Service, Product, AppNotification } from '../types';
import { TrendingUp, Users, Calendar, DollarSign, Star, Plus, Trash2, CheckCircle2, ShoppingBag, Eye, HeartPulse, Send, Sparkles, Volume2 } from 'lucide-react';
import { playBeauticianAudioAlert } from '../utils/audioAlert';
import DispatchMap from './DispatchMap';

interface DashboardProps {
  bookings: Booking[];
  services: Service[];
  products: Product[];
  onChangeBookingStatus: (id: string, status: Booking['status']) => void;
  holidays: string[];
  onAddHoliday: (date: string) => void;
  onRemoveHoliday: (date: string) => void;
  reviews: any[];
  onAddReviewResponse: (reviewId: string, reply: string) => void;
  onAddNotification: (notification: AppNotification) => void;
  onBuyProductSimulate: (id: string) => void;
  productSalesRecords: { [productId: string]: number };
}

export default function Dashboard({
  bookings,
  services,
  products,
  onChangeBookingStatus,
  holidays,
  onAddHoliday,
  onRemoveHoliday,
  reviews,
  onAddReviewResponse,
  onAddNotification,
  onBuyProductSimulate,
  productSalesRecords,
}: DashboardProps) {
  // Tabs State (Inside Admin Panel)
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'scheduler' | 'product_store' | 'holidays' | 'feedback'>('overview');
  const [selectedRouteBooking, setSelectedRouteBooking] = useState<Booking | null>(null);

  // Input states
  const [newHoliday, setNewHoliday] = useState('');
  const [replyInputs, setReplyInputs] = useState<{ [reviewId: string]: string }>({});
  
  // Custom Product creator
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(250);
  const [pCategory, setPCategory] = useState('Skincare');
  const [pIngredients, setPIngradients] = useState('Aloe extract, Mint, Rosewater');
  const [pBenefit, setPBenefit] = useState('Excellent skin-glow and healing.');

  // Today's Date
  const TODAY_STR = '2026-05-26';

  // Stats Computations
  const stats = useMemo(() => {
    // Total Earnings: Sum of Completed and Confirmed bookings
    const dailyBookings = bookings.filter(b => b.date === TODAY_STR && b.status !== 'Cancelled');
    const earningsToday = dailyBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Dynamic Product Sales Earnings
    let productSalesTotal = 0;
    products.forEach((p) => {
      const units = productSalesRecords[p.id] || 0;
      productSalesTotal += units * p.price;
    });

    const activeUpcomingCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
    const completedCount = bookings.filter(b => b.status === 'Completed').length;

    // Average Rating
    const activeRatings = reviews.filter(r => r.rating > 0);
    const avgRating = activeRatings.length > 0 
      ? +(activeRatings.reduce((acc, curr) => acc + curr.rating, 0) / activeRatings.length).toFixed(1)
      : 4.8;

    return {
      earningsToday,
      productSalesTotal,
      activeUpcomingCount,
      completedCount,
      avgRating,
      totalCountToday: dailyBookings.length,
    };
  }, [bookings, reviews, products, productSalesRecords]);

  // Handler for Reply Submit
  const handleReplySubmit = (reviewId: string) => {
    const reply = replyInputs[reviewId]?.trim();
    if (!reply) return;

    onAddReviewResponse(reviewId, reply);
    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));

    // Send Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: '💬 Salon Answer Dispatched',
      message: `Your responsive reply to the reviews of client has been published live.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
      type: 'system',
      read: false
    };
    onAddNotification(notif);
  };

  // Handler for Holiday Add
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday) return;

    if (holidays.includes(newHoliday)) {
      alert('This date has already been registered as a Holiday.');
      return;
    }

    onAddHoliday(newHoliday);

    // Cancel dynamic upcoming appointments on this holiday
    const matchesToCancel = bookings.filter(b => b.date === newHoliday && b.status !== 'Cancelled');
    matchesToCancel.forEach(b => {
      onChangeBookingStatus(b.id, 'Cancelled');
    });

    // Notify System
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: '🚨 Holiday Registered',
      message: `${newHoliday} was marked holiday. ${matchesToCancel.length} appointments on this day were auto-notified.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
      type: 'system',
      read: false
    };
    onAddNotification(notif);

    setNewHoliday('');
  };

  // Simulate buying product
  const handleSimulateSale = (productId: string) => {
    onBuyProductSimulate(productId);
    const item = products.find(p => p.id === productId);
    if (item) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: '🛍 Product Sale Registered',
        message: `1 unit of "${item.name}" was sold. Added ₹${item.price} to Product revenues successfully!`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
        type: 'promo',
        read: false
      };
      onAddNotification(notif);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-main">
      
      {/* Upper Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase">Earnings Today</span>
            <DollarSign className="h-4 w-4 text-sage" />
          </div>
          <div>
            <h4 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              ₹{stats.earningsToday}
            </h4>
            <p className="text-[10px] text-emerald-600 font-mono mt-0.5 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stats.totalCountToday} appointments active
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase">Product Revenues</span>
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              ₹{stats.productSalesTotal}
            </h4>
            <p className="text-[10px] text-stone-500 font-mono mt-0.5">
              Live salon counter inventory
            </p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase">Active Seats</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h4 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {stats.activeUpcomingCount}
            </h4>
            <p className="text-[10px] text-terracotta font-mono mt-0.5">
              Strict single seat occupancy
            </p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase">Client Reviews Rating</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {stats.avgRating}
              </h4>
              <span className="text-xs text-stone-400">/ 5.0</span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono mt-0.5">
              {reviews.length} written letters of feedback
            </p>
          </div>
        </div>
      </div>

      {/* Admin Panel Tabs Navigation */}
      <div className="border-b border-stone-200 dark:border-stone-800 flex items-center justify-between overflow-x-auto gap-4 py-1.5">
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-950 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Overview &amp; Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('scheduler')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSubTab === 'scheduler'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Manage Bookings
          </button>
          <button
            onClick={() => setActiveSubTab('product_store')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSubTab === 'product_store'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Product Sales
          </button>
          <button
            onClick={() => setActiveSubTab('holidays')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSubTab === 'holidays'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Holiday Planner
          </button>
          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSubTab === 'feedback'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Reviews Room ({reviews.length})
          </button>
        </div>

        <span className="text-[10px] text-sage dark:text-[#E2B79A] font-mono shrink-0 hidden md:inline">
          🔐 SECURE ADMIN / OWNER SPACE
        </span>
      </div>

      {/* SUB-TABS VIEWS */}
      {/* 1. OVERVIEW & CHARTS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Custom SVG Analytics Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                  Daily Treatment Revenue Insights
                </h3>
                <p className="text-[11px] text-stone-500">
                  Computed curve over the current operational week in Bangalore
                </p>
              </div>
              <span className="bg-sage-100 dark:bg-sage-900/30 text-sage dark:text-sage-300 text-[10px] font-mono px-2 py-0.5 rounded">
                KPI GAINS: +28%
              </span>
            </div>

            {/* Bespoke React 19 safe SVG line chart */}
            <div className="h-64 relative bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800/20 p-4 flex flex-col justify-between">
              {/* Vertical grids */}
              <div className="absolute inset-y-0 inset-x-8 grid grid-cols-5 pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border-r border-dashed border-stone-200 dark:border-stone-800" />
                ))}
              </div>

              {/* Line charts curve */}
              <svg className="absolute inset-x-8 bottom-12 top-6 h-[calc(100%-4.5rem)] w-[calc(100%-4rem)] overflow-visible">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8A9A5B" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8A9A5B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area path */}
                <path
                  d="M 0 100 L 80 85 L 160 140 L 240 70 L 320 40 L 400 20 L 400 160 L 0 160 Z"
                  fill="url(#chartGrad)"
                />

                {/* Line path */}
                <path
                  d="M 0 100 L 80 85 L 160 140 L 240 70 L 320 40 L 400 20"
                  fill="none"
                  stroke="#8A9A5B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Markers */}
                <circle cx="0" cy="100" r="5" fill="#ffffff" stroke="#8A9A5B" strokeWidth="2.5" />
                <circle cx="80" cy="85" r="5" fill="#ffffff" stroke="#8A9A5B" strokeWidth="2.5" />
                <circle cx="160" cy="140" r="5" fill="#ffffff" stroke="#8A9A5B" strokeWidth="2.5" />
                <circle cx="240" cy="70" r="5" fill="#ffffff" stroke="#8A9A5B" strokeWidth="2.5" />
                <circle cx="320" cy="40" r="5" fill="#ffffff" stroke="#8A9A5B" strokeWidth="2.5" />
                <circle cx="400" cy="20" r="5" fill="#ffffff" stroke="#8A9A5B" strokeWidth="2.5" />
              </svg>

              {/* Weekly Labels */}
              <div className="flex justify-between pl-8 pr-4 font-mono text-[10px] text-stone-500 z-10 pt-[11rem]">
                <span>Mon (22nd)</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu (Today)</span>
                <span>Fri</span>
                <span>Sat (Proj)</span>
              </div>
            </div>
            
            <p className="text-xs text-stone-500 italic">
              *Revenue tracks physical home-care bookings plus interactive Post-Wax post-operative products.
            </p>
          </div>

          {/* Core Service Performance split */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-md font-medium text-stone-900 dark:text-stone-100">
                Service Popularity Mix
              </h3>
              
              <div className="space-y-3">
                {[
                  { name: 'Waxing Care combo', count: 18, pct: '52%', col: 'bg-sage' },
                  { name: 'K-Glass Facials', count: 12, pct: '30%', col: 'bg-indigo-500' },
                  { name: 'Threading & Brows', count: 10, pct: '12%', col: 'bg-emerald-500' },
                  { name: 'Traditional massages', count: 4, pct: '6%', col: 'bg-rose-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">{item.name}</span>
                      <span className="text-stone-400 font-mono text-[11px]">{item.count} items ({item.pct})</span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-stone-950 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.col}`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bangalore Technician Standby list */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="font-serif text-md font-medium text-stone-900 dark:text-stone-100">
                Active Staff Standby
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2.5 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800/10">
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Meera Iyer (Glow Expert)</p>
                    <p className="text-[10px] text-stone-400">On transit - Koramangala 4th block</p>
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800/10">
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Diana Lobo (Hair Specialist)</p>
                    <p className="text-[10px] text-stone-400">In Office standby - MG Road</p>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded">
                    STANDBY
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. MANAGE APPOINTMENTS SCHEDULER */}
      {activeSubTab === 'scheduler' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                Salon Appointment Log Ledger
              </h3>
              <p className="text-xs text-stone-550">
                Confirm, execute, or cancel client treatments from Bangalore dispatch lines.
              </p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <button
                type="button"
                onClick={() => playBeauticianAudioAlert("Test Guest", new Date().toISOString().split('T')[0], "03:00 PM")}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 dark:bg-stone-950 dark:hover:bg-stone-850 dark:border-stone-800 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Test Beautician Voice Notification Sound Alert"
              >
                <Volume2 className="h-3.5 w-3.5 text-[#C17F59] animate-pulse" />
                🔊 TEST BEAUTICIAN ALERT SOUND
              </button>
              <span className="bg-sage/10 text-sage dark:text-sage-300 text-xs px-3 py-1 rounded-full font-bold">
                {bookings.length} Registered entries
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-150 dark:border-stone-800">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left">
              <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Client ID &amp; Contacts</th>
                  <th className="px-6 py-4">Treatment list</th>
                  <th className="px-6 py-4">Session Date &amp; Slot</th>
                  <th className="px-6 py-4">Address Details</th>
                  <th className="px-6 py-4">Assigned Beautician</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4">Executive Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 dark:divide-stone-800/80 text-xs">
                {bookings.map((book) => (
                  <tr key={book.id} className="hover:bg-stone-50 dark:hover:bg-stone-950/40">
                    <td className="px-6 py-4 space-y-1 animate-fadeIn">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-stone-850 dark:text-stone-150">{book.customerName}</p>
                        <button
                          type="button"
                          onClick={() => playBeauticianAudioAlert(book.customerName, book.date, book.timeSlot)}
                          className="p-1 rounded-lg text-[#C17F59] hover:bg-[#FAF7F2] dark:hover:bg-stone-900 transition-all cursor-pointer"
                          title="Speak Booking Details (Audible Notification)"
                        >
                          <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-500">{book.customerPhone}</p>
                      <p className="text-[10px] font-mono text-stone-400">{book.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-800 dark:text-stone-200">
                        {book.serviceIds.length} treatments loaded
                      </p>
                      <p className="text-[10px] text-sage line-clamp-1">
                        {book.serviceIds.map(sid => services.find(s => s.id === sid)?.name.split(' (')[0]).join(', ')}
                      </p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <p className="font-mono font-bold text-stone-800 dark:text-stone-300">{book.date}</p>
                      <span className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded font-mono text-[10px]">
                        {book.timeSlot}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1">
                        <p className="text-[11px] text-stone-605 font-medium leading-relaxed" title={book.customerAddress}>
                          {book.customerAddress}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedRouteBooking(book)}
                          className="text-[10px] font-mono font-bold text-sage dark:text-sage-300 hover:text-sage-600 dark:hover:text-sage-200 flex items-center gap-1 cursor-pointer transition-all bg-sage/5 dark:bg-sage/10 hover:bg-sage/10 px-2 py-0.5 rounded border border-sage/20 inline-flex"
                        >
                          🗺️ VIEW ROUTE MAP
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="SMS Telemetry Online" />
                        <p className="font-mono text-[11px] font-bold text-[#C17F59] dark:text-[#E2B79A]">
                          +91 9008024916
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded w-max">
                          <span>📬 SMS: SENT &amp; DELIVERED</span>
                        </div>
                        <a 
                          href={`https://wa.me/919008024916?text=${encodeURIComponent(
                            `Nice Look Beauty Therapist Centre\n` +
                            `ID: ${book.id}\n` +
                            `Guest: ${book.customerName}\n` +
                            `Contact: ${book.customerPhone}\n` +
                            `Session: ${book.date} @ ${book.timeSlot}\n` +
                            `Subtotal: ₹${book.totalPrice}\n` +
                            `Duty Landmark: ${book.customerAddress}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9.5px] font-mono hover:underline font-bold text-sage dark:text-sage-400 flex items-center gap-1 bg-sage/5 dark:bg-sage/15 border border-sage/20 px-1.5 py-0.5 rounded w-max"
                          title="Generate pre-filled SMS dispatch message to +919008024916"
                        >
                          📲 SEND VIA WHATSAPP
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-terracotta dark:text-[#E2B79A]">
                      ₹{book.totalPrice}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2 mt-2">
                      {book.status === 'Cancelled' ? (
                        <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          Cancelled
                        </span>
                      ) : book.status === 'Completed' ? (
                        <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          Completed
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onChangeBookingStatus(book.id, 'Completed')}
                            className="bg-emerald-600 text-white p-1 rounded-lg hover:bg-emerald-700 cursor-pointer"
                            title="Mark Completed and claim earnings!"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onChangeBookingStatus(book.id, 'Cancelled')}
                            className="bg-stone-100 text-red-500 hover:bg-red-50 p-1 rounded-lg cursor-pointer border border-stone-200"
                            title="Cancel Booking"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PRODUCT CATALOG SALES */}
      {activeSubTab === 'product_store' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
                Manage Aesthetic Product Inventories
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Track retail creams &amp; therapy formulas. Tap sell to register direct client purchases.
              </p>
            </div>
            
            <button
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="bg-sage hover:bg-sage-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Product Inventory
            </button>
          </div>

          {/* Optional product adder */}
          {isAddingProduct && (
            <div className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-stone-500">Product Name</label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Nice Look Rosewater Mist"
                  className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-stone-500">Retail price (rupees)</label>
                <input
                  type="number"
                  value={pPrice}
                  onChange={(e) => setPPrice(+e.target.value)}
                  className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-stone-500">Category name</label>
                <input
                  type="text"
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="text-[11px] font-mono font-bold text-stone-500">Ingredients (Comma separated)</label>
                <input
                  type="text"
                  value={pIngredients}
                  onChange={(e) => setPIngradients(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div className="space-y-1 md:col-span-3 flex justify-between items-center">
                <div className="w-[80%]">
                  <label className="text-[11px] font-mono font-bold text-stone-500">Benefits description</label>
                  <input
                    type="text"
                    value={pBenefit}
                    onChange={(e) => setPBenefit(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs text-stone-800"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!pName) return;
                    products.push({
                      id: `prod-${Date.now()}`,
                      name: pName,
                      price: pPrice,
                      volume: '150 ml',
                      category: pCategory,
                      keyIngredients: pIngredients.split(',').map(itm => itm.trim()),
                      benefit: pBenefit,
                      rating: 4.8
                    });
                    setPName('');
                    setIsAddingProduct(false);
                  }}
                  className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 p-2.5 rounded-xl text-xs font-bold font-mono self-end shrink-0"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {/* Products grid show */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const totalSoldUnits = productSalesRecords[p.id] || 0;
              return (
                <div key={p.id} className="border border-[#EAE2D5] dark:border-stone-800 rounded-2xl p-5 space-y-4 hover:shadow hover:border-sage transition-all bg-stone-50/50 dark:bg-stone-950/40">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] font-mono bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded text-stone-400">
                        {p.category}
                      </span>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1 leading-tight">
                        {p.name}
                      </h4>
                    </div>
                    <span className="text-sm font-bold text-terracotta dark:text-[#E2B79A] font-mono">
                      ₹{p.price}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 line-clamp-2">{p.benefit}</p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-450">Active Ingredients:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.keyIngredients.map((ing, idx) => (
                        <span key={idx} className="text-[9px] bg-white border border-stone-150 px-1.5 py-0.5 rounded text-stone-500">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sales tracking metrics */}
                  <div className="h-[1px] bg-stone-200 dark:bg-stone-800 my-2" />

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-mono text-stone-400 text-[10px]">TOTAL UNITS REGISTERED</p>
                      <p className="font-bold text-stone-800 dark:text-stone-200">
                        {totalSoldUnits} sold (~ ₹{totalSoldUnits * p.price})
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSimulateSale(p.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer"
                    >
                      🛒 Sell 1 Unit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. HOLIDAY MANAGER */}
      {activeSubTab === 'holidays' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              National &amp; Owner Managed Holidays
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Mark custom dates as Holidays. When active, customer booking slots are completely locked &amp; blocked for those calendar days!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Holiday Input Form */}
            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300">
                  Select Holiday Date Calendar Line
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={newHoliday}
                    onChange={(e) => setNewHoliday(e.target.value)}
                    className="p-3 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-800"
                  />
                  <button
                    type="submit"
                    className="bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2.5 rounded-xl text-xs font-bold font-mono hover:bg-stone-900 cursor-pointer shrink-0"
                  >
                    Lock-In Holiday
                  </button>
                </div>
              </div>

              <div className="bg-sage/10 text-stone-700 rounded-xl p-4 border border-sage/15 text-xs space-y-1">
                <p className="font-bold text-sage dark:text-[#E2B79A]">💡 Important System Action Note:</p>
                <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400">
                  Submitting a holiday blocks customer scheduling on the Booking page immediately. Any pre-existing dynamic appointments locked-in for that specific date will be auto-notified via booking triggers.
                </p>
              </div>
            </form>

            {/* List of active holidays */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-stone-500 uppercase">Registered Holiday Dates</h4>
              {holidays.length === 0 ? (
                <p className="text-xs text-stone-450 italic">No custom holidays marked. Salon open 7 days a week!</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {holidays.map((date) => (
                    <div
                      key={date}
                      className="flex justify-between items-center p-3 bg-stone-50 dark:bg-stone-950/40 border border-stone-150 rounded-xl"
                    >
                      <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                        🚨 {date} (Marked Salon Off)
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveHoliday(date)}
                        className="text-stone-400 hover:text-red-500 hover:bg-stone-100 p-1.5 rounded-lg cursor-pointer"
                        title="Remove Holiday"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. FEEDBACK REVIEWS CONSOLE */}
      {activeSubTab === 'feedback' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">
              Customer Feedback &amp; Reviews Hub
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Read real customer letters. Respond professionally to address skin responses and build robust salon trust.
            </p>
          </div>

          <div className="space-y-5">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-3 bg-stone-50/40 dark:bg-stone-950/20"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                      {rev.customerName}
                    </h4>
                    <p className="text-[10px] font-mono text-stone-400">
                      Treatment Received: {rev.serviceName} • Date: {rev.date}
                    </p>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 bg-[#F3F5EC] dark:bg-stone-950/20 px-2 py-1 rounded-lg">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3 w-3 ${
                          idx < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 italic">
                  &ldquo;{rev.text}&rdquo;
                </p>

                {/* Response trace */}
                {rev.reply ? (
                  <div className="bg-white dark:bg-stone-900 border border-stone-150 p-3.5 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-[11px] text-terracotta dark:text-[#E2B79A] uppercase font-mono tracking-wider">
                      Nice Look Owner Official Answer:
                    </p>
                    <p className="text-stone-605">{rev.reply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2.5 max-w-lg mt-3">
                    <input
                      type="text"
                      placeholder="Write an elegant appreciative official reply..."
                      value={replyInputs[rev.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReplyInputs(prev => ({ ...prev, [rev.id]: val }));
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage text-stone-805"
                      id={`reply-input-${rev.id}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleReplySubmit(rev.id)}
                      className="bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-950 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
                      id={`reply-btn-${rev.id}`}
                    >
                      <Send className="h-3 w-3" />
                      Dispatch
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRouteBooking && (
        <DispatchMap
          booking={selectedRouteBooking}
          onClose={() => setSelectedRouteBooking(null)}
        />
      )}

    </div>
  );
}
