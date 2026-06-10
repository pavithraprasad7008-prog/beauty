import React, { useState, useEffect, useMemo } from 'react';
import { Service, Booking, Product, AppNotification } from './types';
import { INITIAL_SERVICES, INITIAL_PRODUCTS, INITIAL_REVIEWS } from './data';
import ServiceList from './components/ServiceList';
import ServiceModal from './components/ServiceModal';
import BookingPortal from './components/BookingPortal';
import Dashboard from './components/Dashboard';
import PromptConsole from './components/PromptConsole';
import { ThemeSelector } from './components/ThemeSelector';
import { THEME_PRESETS } from './utils/themePresets';
import { Sparkles, Moon, Sun, Bell, Calendar, HelpCircle, ArrowRight, ShieldCheck, HeartPulse, LogOut, Paintbrush } from 'lucide-react';
import { getAmbienceHeroUrl, getFallbackLogoUrl } from './utils/imageMapper';
import { playBeauticianAudioAlert } from './utils/audioAlert';
import Welcome3DCard from './components/Welcome3DCard';
import BeauticianProfile from './components/BeauticianProfile';

const premiumLogo = new URL('./assets/images/premium_salon_logo_1779894276821.png', import.meta.url).href;

export default function App() {
  // Dynamic Real-time India Time State
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentTime(new Date().toLocaleString('en-IN', options) + ' (IST)');
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme State (Default high-contrast pristine light theme as recommended)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem('aura-theme-id') || 'blush-rose-gold';
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Core App Tab State
  const [activeTab, setActiveTab] = useState<'experience' | 'profile' | 'book' | 'admin' | 'dev_docs'>('experience');

  // Services Catalog & Products States
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  // Selected treatment cart listings for booking
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Selected Service object for bottom modal detail panel
  const [detailedService, setDetailedService] = useState<Service | null>(null);

  // Holidays state list
  const [holidays, setHolidays] = useState<string[]>(['2026-06-05', '2026-06-21']);

  // Reviews state listing
  const [reviews, setReviews] = useState<any[]>(INITIAL_REVIEWS);

  // Booking states loaded with mock records for TODAY
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'book-100234',
      customerName: 'Pavithra Prasad',
      customerEmail: 'pavithraprasad7008@gmail.com',
      customerPhone: '+91 98801 12345',
      customerAddress: 'Koramangala 4th Block, Bengaluru, India',
      serviceIds: ['wax-1', 'facial-10'], // Complete Rica + Sara vit C cleanse
      date: '2026-05-26', // Current Date
      timeSlot: '11:00 AM',
      discountApplied: 185, // combo discounts
      gdpTaxApplied: 299,
      totalPrice: 1962,
      paymentType: 'Post-Service Card/UPI',
      status: 'Confirmed',
      customerCoords: { lat: 12.9328, lng: 77.6295 },
    },
    {
      id: 'book-100235',
      customerName: 'Rhea Kuruvilla',
      customerEmail: 'rhea@gmail.com',
      customerPhone: '+91 99012 34567',
      customerAddress: 'Indiranagar 100 Feet Rd, Bengaluru, India',
      serviceIds: ['facial-1'], // Korean Glass Skin Facial
      date: '2026-05-26', // Current Date
      timeSlot: '02:00 PM',
      discountApplied: 0,
      gdpTaxApplied: 323,
      totalPrice: 2122,
      paymentType: 'Post-Service Cash',
      status: 'Completed',
      customerCoords: { lat: 12.9648, lng: 77.6418 },
    }
  ]);

  // Product sold count registry simulator state
  const [productSalesRecords, setProductSalesRecords] = useState<{ [productId: string]: number }>({
    'prod-1': 14,
    'prod-2': 29,
    'prod-3': 9,
    'prod-4': 22,
    'prod-5': 5,
  });

  // Client Notifications History logs state
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: '🌟 Welcome to Nice Look Beauty Therapist!',
      message: 'Explore our aesthetic treatment cards, read about organic key ingredients, and lock-in home booking slots anytime.',
      timestamp: '03:40 PM',
      type: 'system',
      read: false
    }
  ]);

  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  // Feedback Notification & Helper alerts space
  const [pendingFeedbackBooking, setPendingFeedbackBooking] = useState<Booking | null>(null);
  const [preFillFeedback, setPreFillFeedback] = useState<{ name: string; service: string } | null>(null);

  // Beautician Authorization State
  const [isBeauticianAuthorized, setIsBeauticianAuthorized] = useState(false);
  const [beauticianPassword, setBeauticianPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Apply visual theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Apply premium luxury theme properties when theme presets alter
  useEffect(() => {
    const root = window.document.documentElement;
    const selectedTheme = THEME_PRESETS.find((t) => t.id === currentThemeId) || THEME_PRESETS[0];
    
    Object.entries(selectedTheme.variables).forEach(([variableName, value]) => {
      root.style.setProperty(variableName, value);
    });

    localStorage.setItem('aura-theme-id', currentThemeId);
  }, [currentThemeId]);

  // Add notification handler
  const handleAddNotification = (notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  // Add review response reply handler
  const handleAddReviewResponse = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply } : r))
    );
  };

  // Add review left by customer directly on Pinky's profile
  const handleAddReview = (newReview: { customerName: string; serviceName: string; rating: number; text: string }) => {
    // Generate an automatic thank-you note based on the customer rating
    let autoReply = '';
    if (newReview.rating >= 5) {
      autoReply = `Thank you so much, ${newReview.customerName}! 🌸 It was an absolute pleasure bringing our premium home-care aesthetic treatments to you. Your glowing 5-star rating means the world to our small studio and keeps us motivated to deliver clinical perfection. Warm regards, Pinky Prasad (Nice Look).`;
    } else if (newReview.rating === 4) {
      autoReply = `Thank you for your valuable feedback, ${newReview.customerName}! 🌸 I am delighted to hear that you had a lovely experience with your ${newReview.serviceName} service. We always strive to match your maximum comfort and aesthetics. Warm regards, Pinky Prasad (Nice Look).`;
    } else {
      autoReply = `Thank you for taking the time to share your feedback, ${newReview.customerName}. I highly value your notes on the ${newReview.serviceName} treatment. I am committed to delivering an immaculate, 5-star home aesthetic standard and will use your comments to make our next appointment even better. Warmly, Pinky Prasad (Nice Look).`;
    }

    const freshReview = {
      id: `rev-${Date.now()}`,
      customerName: newReview.customerName,
      serviceName: newReview.serviceName,
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toISOString().split('T')[0],
      reply: autoReply
    };
    setReviews((prev) => [freshReview, ...prev]);

    // Clear feedback reminders
    setPendingFeedbackBooking(null);
    setPreFillFeedback(null);

    // Send a system notification that feedback has been received
    handleAddNotification({
      id: `notif-rev-${Date.now()}`,
      title: '🌟 New Guest Feedback Received!',
      message: `Review left by ${newReview.customerName} for ${newReview.serviceName} with score of ${newReview.rating}★. Initials display configured.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
      type: 'booking',
      read: false
    });
  };

  // Mark a single notification read
  const handleMarkNotifRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Add holiday handler
  const handleAddHoliday = (date: string) => {
    setHolidays((prev) => [...prev, date]);
  };

  // Remove holiday handler
  const handleRemoveHoliday = (date: string) => {
    setHolidays((prev) => prev.filter((d) => d !== date));
  };

  // Alter booking status (Confirmed -> Completed / Cancelled etc)
  const handleChangeBookingStatus = (id: string, status: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          // If status changes to completed, send notification reminder
          if (status === 'Completed' && b.status !== 'Completed') {
            const completedNotif: AppNotification = {
              id: `notif-${Date.now()}`,
              title: '🏆 Treatment Receipt & Completed!',
              message: `Your booking ID ${b.id} is marked Completed successfully. Payable of ₹${b.totalPrice} registered post-service. Thank you!`,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
              type: 'booking',
              read: false
            };
            handleAddNotification(completedNotif);

            // Populate feedback prompts
            const serviceNames = b.serviceIds
              .map((sid) => services.find((s) => s.id === sid)?.name || '')
              .filter(Boolean)
              .join(', ');
            setPendingFeedbackBooking(b);
            setPreFillFeedback({
              name: b.customerName,
              service: serviceNames || 'Deluxe Care Treatment'
            });
          }
          return { ...b, status };
        }
        return b;
      })
    );
  };

  // Buy Product simulator
  const handleBuyProductSimulate = (productId: string) => {
    setProductSalesRecords((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Toggle booking item card select
  const handleToggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Clear cart action
  const handleClearCart = () => {
    setSelectedServices([]);
  };

  // Notification badge unread trigger counts
  const unreadNotifCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-[#FCF8F5] dark:bg-[#141010] text-[#2C2220] dark:text-[#FAF6F5] transition-colors duration-200">
      
      {/* Top Professional Elegant Announcement Bar */}
      <div className={`px-4 py-2 flex justify-between items-center text-[10px] sm:text-[11px] font-mono tracking-wider border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-stone-950 text-[#FAF6F5] border-[#ECE0DA]/20' 
          : 'bg-[#FAF1EC] text-[#9C5F6D] border-[#ECE0DA]'
      }`}>
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
          <span>BANGALORE HQ EST | CLINICAL HYGIENE AND DISPOSED LINENS ONLY</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{currentTime || 'Loading Indian Time...'}</span>
          <span className="hidden sm:inline">📞 APPOINTMENT DESK: +91 9008024916</span>
        </div>
      </div>

      {/* Primary Brand Navigation Header */}
      <header className={`sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex justify-between items-center backdrop-blur-md transition-all duration-300 border-b ${
        isDarkMode 
          ? 'bg-stone-900/95 text-stone-100 border-stone-850' 
          : 'bg-white/95 text-[#2C2220] border-[#ECE0DA] shadow-xs'
      }`}>
        
        {/* Luxury Brand Title and Continuous-Line Icon */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('experience')}>
          <div className={`relative h-11 w-11 rounded-full overflow-hidden flex items-center justify-center shadow-xs border shrink-0 transition-colors duration-300 ${
            isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-[#FAF1EC] border-[#ECE0DA]'
          }`}>
            <img 
              src={premiumLogo} 
              alt="Nice Look Beauty Therapist Logo" 
              className="w-10 h-10 object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className={`serif text-md sm:text-xl font-bold leading-tight tracking-tight transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>
              NICE LOOK BEAUTY THERAPIST
            </h1>
            <p className="text-[9.5px] font-mono uppercase tracking-widest text-[#CD7F6D] font-extrabold">
              Premium Home-Care &amp; Aesthetics
            </p>
          </div>
        </div>

        {/* Global tab triggers / Dark mode toggle / Notification bell */}
        <div className="flex items-center gap-1 sm:gap-3.5">
          {/* Main SPA Navigation Badges */}
          <nav className={`hidden md:flex items-center gap-1.5 mr-4 p-1 rounded-xl border transition-all duration-300 ${
            isDarkMode ? 'bg-[#151110] border-stone-800' : 'bg-[#FCF5F3] border-[#ECE0DA]'
          }`}>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'experience'
                  ? isDarkMode
                    ? 'bg-stone-800 text-stone-50 shadow-sm border border-stone-700 font-bold'
                    : 'bg-[#CD7F6D] text-white shadow-xs border border-[#CD7F6D]/25 font-bold'
                  : isDarkMode
                  ? 'text-stone-400 hover:text-stone-100 font-normal hover:bg-stone-850/40'
                  : 'text-stone-600 hover:text-[#9C5F6D] font-normal hover:bg-[#FAF1EC]/50'
              }`}
            >
              Treatments Menu
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'profile'
                  ? isDarkMode
                    ? 'bg-stone-800 text-stone-50 shadow-sm border border-stone-700 font-bold'
                    : 'bg-[#CD7F6D] text-white shadow-xs border border-[#CD7F6D]/25 font-bold'
                  : isDarkMode
                  ? 'text-stone-400 hover:text-stone-100 font-normal hover:bg-stone-850/40'
                  : 'text-stone-600 hover:text-[#9C5F6D] font-normal hover:bg-[#FAF1EC]/50'
              }`}
              id="beautician-profile-tab"
            >
              Beautician Profile
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all relative ${
                activeTab === 'book'
                  ? isDarkMode
                    ? 'bg-stone-800 text-stone-50 shadow-sm border border-stone-700 font-bold'
                    : 'bg-[#CD7F6D] text-white shadow-xs border border-[#CD7F6D]/25 font-bold'
                  : isDarkMode
                  ? 'text-stone-400 hover:text-stone-100 font-normal hover:bg-stone-850/40'
                  : 'text-stone-600 hover:text-[#9C5F6D] font-normal hover:bg-[#FAF1EC]/50'
              }`}
            >
              Book Treatment
              {selectedServices.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-terracotta text-white font-mono text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                  {selectedServices.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'admin'
                  ? isDarkMode
                    ? 'bg-stone-800 text-stone-50 shadow-sm border border-stone-700 font-bold'
                    : 'bg-[#CD7F6D] text-white shadow-xs border border-[#CD7F6D]/25 font-bold'
                  : isDarkMode
                  ? 'text-stone-400 hover:text-stone-100 font-normal hover:bg-stone-850/40'
                  : 'text-stone-600 hover:text-[#9C5F6D] font-normal hover:bg-[#FAF1EC]/50'
              }`}
            >
              Therapist Rooms
            </button>
            <button
              onClick={() => setActiveTab('dev_docs')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                activeTab === 'dev_docs'
                  ? isDarkMode
                    ? 'bg-stone-800 text-stone-50 shadow-sm border border-stone-700 font-bold'
                    : 'bg-[#CD7F6D] text-white shadow-xs border border-[#CD7F6D]/25 font-bold'
                  : isDarkMode
                  ? 'text-stone-400 hover:text-stone-100 font-normal hover:bg-stone-850/40'
                  : 'text-stone-600 hover:text-[#9C5F6D] font-normal hover:bg-[#FAF1EC]/50'
              }`}
            >
              Developer Docs
            </button>
          </nav>

          {/* Quick Book floating trigger */}
          {selectedServices.length > 0 && activeTab !== 'book' && (
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className="bg-sage animate-pulse text-white text-[10px] sm:text-xs font-bold font-mono px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm shrink-0 cursor-pointer hover:bg-sage-600"
            >
              Cart ({selectedServices.length})
              <ArrowRight className="h-3 w-3" />
            </button>
          )}

          {/* Theme customizer selector toggle */}
          <button
            type="button"
            onClick={() => setShowThemeSelector(true)}
            className={`p-2 rounded-xl text-sage shrink-0 cursor-pointer border flex items-center gap-1.5 transition-all bg-sage/5 hover:border-sage/40 ${
              isDarkMode ? 'border-stone-800 hover:bg-stone-800' : 'border-[#ECE0DA] hover:bg-[#FAF1EC]'
            }`}
            title="Open Luxury Theme Atelier"
            id="theme-atelier-btn"
          >
            <Paintbrush className="h-4.5 w-4.5" />
            <span className={`hidden leading-none lg:inline text-[9.5px]/none font-mono tracking-wider font-extrabold uppercase ${
              isDarkMode ? 'text-stone-300' : 'text-[#9C5F6D]'
            }`}>
              Theme Atelier
            </span>
          </button>

          {/* Dark Mode toggle icon */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl shrink-0 cursor-pointer border transition-all ${
              isDarkMode 
                ? 'text-stone-300 bg-stone-900 border-stone-800 hover:bg-stone-800' 
                : 'text-stone-600 bg-white border-[#ECE0DA] hover:bg-[#FAF1EC]/50'
            }`}
            title="Toggle eye-safe night filter"
            id="theme-toggler"
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-stone-500" />}
          </button>

          {/* Push alert bell indicator */}
          <button
            type="button"
            onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
            className={`p-2 rounded-xl shrink-0 cursor-pointer relative border transition-all ${
              isDarkMode 
                ? 'text-stone-350 bg-stone-900 border-stone-800 hover:bg-stone-805' 
                : 'text-stone-600 bg-white border-[#ECE0DA] hover:bg-[#FAF1EC]/50'
            }`}
            title="Notification history console"
            id="bell-notif-btn"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#CD7F6D] text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-bold">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MOBILE SCROLLABLE TAB NAV (Shown only on small tabs) */}
      <div className={`md:hidden border-b px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-none sticky top-18 z-30 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-stone-900 border-stone-805' 
          : 'bg-white border-stone-200 shadow-xs'
      }`}>
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'experience'
              ? 'bg-sage text-white'
              : isDarkMode
              ? 'bg-stone-800 text-stone-300 border border-stone-750'
              : 'bg-[#FCF5F3] text-[#2C2220] border border-[#ECE0DA]/60'
          }`}
        >
          Menu Card
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'profile'
              ? 'bg-sage text-white'
              : isDarkMode
              ? 'bg-stone-800 text-stone-300 border border-stone-750'
              : 'bg-[#FCF5F3] text-stone-700 border border-[#ECE0DA]/60'
          }`}
          id="beautician-profile-mobile-tab"
        >
          Beautician Profile
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'book'
              ? 'bg-sage text-white'
              : isDarkMode
              ? 'bg-stone-800 text-stone-300 border border-stone-750'
              : 'bg-[#FCF5F3] text-stone-700 border border-[#ECE0DA]/60'
          }`}
        >
          Book Treatment ({selectedServices.length})
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'admin'
              ? 'bg-sage text-white'
              : isDarkMode
              ? 'bg-stone-800 text-stone-300 border border-stone-750'
              : 'bg-[#FCF5F3] text-stone-700 border border-[#ECE0DA]/60'
          }`}
        >
          Therapist Room &amp; Stats
        </button>
        <button
          onClick={() => setActiveTab('dev_docs')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'dev_docs'
              ? 'bg-sage text-white'
              : isDarkMode
              ? 'bg-stone-800 text-stone-300 border border-stone-750'
              : 'bg-[#FCF5F3] text-stone-700 border border-[#ECE0DA]/60'
          }`}
        >
          Master Prompts
        </button>
      </div>

      {/* NOTIFICATION LOG DRAWERS / DIALOGS COMPONENT */}
      {showNotificationsDrawer && (
        <div className="fixed right-4 top-20 z-50 w-80 max-w-sm bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 rounded-3xl shadow-xl p-5 space-y-4 animate-slideIn">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800/60 pb-2">
            <h4 className="serif text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-sage" />
              Live Push Alert Log
            </h4>
            <button
              onClick={() => setShowNotificationsDrawer(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-center py-6 text-xs text-stone-400 italic">No incoming notifications.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkNotifRead(n.id)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    n.read 
                      ? 'bg-stone-50/50 dark:bg-stone-950/20 border-stone-100 dark:border-stone-800/40 text-stone-500' 
                      : 'bg-sage-50/20 border-sage/20 text-stone-800 dark:text-stone-200 ring-1 ring-sage/10'
                  }`}
                  id={`notif-item-${n.id}`}
                >
                  <p className="font-bold flex items-center justify-between text-[11px]">
                    <span>{n.title}</span>
                    <span className="text-[9px] font-mono text-stone-400">{n.timestamp}</span>
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed">{n.message}</p>
                  
                  {n.title.includes('Completed') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkNotifRead(n.id);
                        setActiveTab('profile');
                        setTimeout(() => {
                          const el = document.getElementById('beautician-profile-workspace');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                          }
                        }, 200);
                        setShowNotificationsDrawer(false);
                      }}
                      className="mt-2.5 w-full text-center text-[10px] font-mono bg-[#CD7F6D] text-white py-1.5 rounded-lg font-bold hover:bg-[#B06351] transition-all cursor-pointer block uppercase tracking-wider"
                    >
                      ⭐ Write Treatment Feedback
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🚀 ELEGANT INTERACTIVE POST-SERVICE FEEDBACK REMINDER FOR THE CLIENT */}
      {pendingFeedbackBooking && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4 animate-fadeIn" id="service-feedback-reminder">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 to-[#FCF8F5] dark:from-[#2c1d1a] dark:to-[#1a1110] border border-amber-200/50 dark:border-stone-850 p-5 sm:p-6 shadow-md flex flex-wrap gap-4 items-center justify-between">
            {/* Ambient decorative glowing element */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(205,127,109,0.06),transparent_50%)] pointer-events-none" />
            
            <div className="flex gap-4 items-start relative z-10">
              <div className="h-12 w-12 rounded-full bg-[#CD7F6D]/15 text-[#CD7F6D] dark:text-[#E2B79A] text-xl flex items-center justify-center border border-[#CD7F6D]/20 shadow-xs shrink-0 mt-0.5 animate-bounce">
                🌸
              </div>
              <div className="space-y-1 max-w-xl">
                <span className="bg-[#CD7F6D]/10 dark:bg-[#CD7F6D]/20 text-[#CD7F6D] dark:text-[#E2B79A] text-[9.5px] font-mono font-extrabold px-3 py-1 rounded-full border border-[#CD7F6D]/15 uppercase tracking-widest leading-none block w-max">
                  Home Treatment Completed!
                </span>
                <h4 className="serif text-sm sm:text-md font-extrabold text-stone-900 dark:text-stone-50">
                  Did you love your home service, {pendingFeedbackBooking.customerName}?
                </h4>
                <p className="text-xs text-stone-550 dark:text-stone-400 leading-relaxed font-sans">
                  Your premium service for <strong>{preFillFeedback?.service || 'your treatment'}</strong> is complete. Share your feedback for Beautician Pinky Prasad to help preserve our exquisite 5★ standard!
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-center relative z-10 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  // Smoothly scroll down to the feedback form
                  setTimeout(() => {
                    const el = document.getElementById('beautician-profile-workspace');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }
                  }, 250);
                }}
                className="flex-1 sm:flex-none uppercase text-[10.5px] font-mono tracking-wider font-extrabold bg-[#CD7F6D] hover:bg-[#B06351] text-white px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm text-center"
              >
                ✍️ Write Feedback
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingFeedbackBooking(null);
                }}
                className="flex-1 sm:flex-none uppercase text-[10.5px] font-mono tracking-wider font-bold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-605 dark:text-stone-300 px-4 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-850 transition cursor-pointer text-center"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE CANVAS (SPA VIEWS SELECTION) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 min-h-[75vh]">
        
        {/* VIEW: BEAUTICIAN PROFILE SECTION */}
        {activeTab === 'profile' && (
          <BeauticianProfile
            onBookClick={() => setActiveTab('book')}
            reviews={reviews}
            onAddReview={handleAddReview}
            servicesList={services}
            defaultReviewName={preFillFeedback?.name || ''}
            defaultReviewService={preFillFeedback?.service || ''}
          />
        )}

        {/* VIEW 1: EXPERIENCE / CATALOG CARD DIRECTORY */}
        {activeTab === 'experience' && (
          <div className="space-y-8 animate-fadeIn" id="treatments-menu-view">
            {/* Elegant 3D Interactive Welcome Card */}
            <Welcome3DCard />

            {/* Elegant Hero display */}
            <div className={`relative rounded-3xl overflow-hidden p-8 md:p-12 border flex items-center transition-all duration-300 shadow-md ${
              isDarkMode 
                ? 'bg-gradient-to-br from-[#202020] via-[#2F2F2F] to-[#161616] text-stone-100 border-stone-800' 
                : 'bg-gradient-to-br from-[#FCF5F3] via-[#FAF1EC] to-[#FFF5F2] text-stone-800 border-[#ECE0DA]'
            }`}>
              {/* Subtle elegant radial lighting (No photographic image) */}
              <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_120%,rgba(205,127,109,0.08),transparent)]" />

              <div className="relative z-10 max-w-xl space-y-4">
                <div className={`inline-block py-1 px-3 rounded-full text-xs font-mono tracking-widest uppercase font-bold transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-[#FAF1EC]/10 border border-[#FAF1EC]/20 text-terracotta' 
                    : 'bg-[#CD7F6D]/10 border border-[#CD7F6D]/20 text-[#CD7F6D]'
                }`}>
                  ⭐ Bangalore's Aesthetic Best
                </div>
                <h2 className={`text-3xl md:text-5xl serif tracking-tight leading-tight transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  Uncompromised Hygiene, Exquisite Beauty Glow
                </h2>
                <p className={`text-xs sm:text-sm leading-relaxed font-sans font-normal transition-colors duration-300 ${
                  isDarkMode ? 'text-stone-300' : 'text-stone-600'
                }`}>
                  Rica colophony-free waxing combos, targeted K-Glass hydration facials, medical-grade sanitization, and professional, discrete therapist attention. Choose your services, inspect raw botanical key ingredients, step-by-step procedures, and select convenient home booking sheets below.
                </p>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('book')}
                    className="bg-sage hover:bg-sage-600 text-white font-bold font-mono text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-all duration-300"
                  >
                    🚀 BOOK A TREATMENT SESSION
                  </button>
                  <a
                    href="#services-section"
                    className={`font-bold font-mono text-xs px-5 py-2.5 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-white/10 hover:bg-white/15 text-white border-[#EAE2D5]/30' 
                        : 'bg-[#FCF5F3] hover:bg-[#FCF5F3]/80 text-[#9C5F6D] border-[#ECE0DA]'
                    }`}
                  >
                    View Treatments Menu
                  </a>
                </div>
              </div>
            </div>

            {/* Main Services catalog list component */}
            <ServiceList
              services={services}
              onSelectService={(s) => setDetailedService(s)}
              selectedServices={selectedServices}
              onToggleBookingSelection={handleToggleServiceSelection}
            />
          </div>
        )}

        {/* VIEW 2: SCHEDULER BOOKING DOOR PORTAL */}
        {activeTab === 'book' && (
          <div className="space-y-6 animate-fadeIn" id="appointment-booking-view">
            <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
              <h2 className="text-2xl font-serif text-stone-950 dark:text-stone-50 font-medium tracking-tight">
                Secure Treatment Booking Scheduler
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-1">
                BANGALORE INDIA METRO EXCLUSIVE APPOINTMENT REGISTRY
              </p>
            </div>

            <BookingPortal
              services={services}
              selectedServiceIds={selectedServices}
              onToggleServiceSelection={handleToggleServiceSelection}
              onClearCart={handleClearCart}
              existingBookings={bookings}
              holidays={holidays}
              onCreateBooking={(newRecord) => {
                setBookings((prev) => [newRecord, ...prev]);
                
                // Trigger audible audio alert chime and voice reading for the beautician
                playBeauticianAudioAlert(newRecord.customerName, newRecord.date, newRecord.timeSlot);
                
                // 1. Customer Notification
                handleAddNotification({
                  id: `notif-cust-${Date.now()}`,
                  title: '✨ Booking Placed Successfully!',
                  message: `New booking ID ${newRecord.id} created live for ${newRecord.customerName} on ${newRecord.date}. Assigned Beautician Support Contact: +91 9008024916. Verified post-treatment cash/UPI.`,
                  timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
                  type: 'booking',
                  read: false
                });

                // 2. Beautician Dispatch Notification
                handleAddNotification({
                  id: `notif-beautician-${Date.now()}`,
                  title: '📞 [Beautician Alert] New Task Registered!',
                  message: `New appointment assigned to Beautician +91 9008024916. Live client ${newRecord.customerName} (Phone: ${newRecord.customerPhone}) booked ${newRecord.date} at ${newRecord.timeSlot}. Subtotal: ₹${newRecord.totalPrice}. Route Landmark: ${newRecord.customerAddress}.`,
                  timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
                  type: 'system',
                  read: false
                });

                alert('Success! Your appointment is logged. Assigned Beautician (+91 9008024916) has been notified with a sound alert and real-time voice callout about your booking details directly, and it is successfully registered in the Manage Bookings room!');
              }}
              onAddNotification={handleAddNotification}
            />
          </div>
        )}

        {/* BEAUTICIAN ACCESS LOCK FOR SECURE ROOMS */}
        {(activeTab === 'admin' || activeTab === 'dev_docs') && !isBeauticianAuthorized && (
          <div className="max-w-md mx-auto my-12 animate-fadeIn" id="beautician-gate-lock">
            <div className="bg-white dark:bg-stone-900 border border-[#ECE0DA] dark:border-stone-800 rounded-3xl p-8 shadow-md text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#FAF1EC] dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-800 flex items-center justify-center text-rose-500 text-2xl">
                🔐
              </div>
              <div className="space-y-2">
                <h3 className="serif text-xl font-bold text-stone-900 dark:text-stone-50">
                  Beautician Access Verification
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  The Therapist Room and Developer Docs are designated for licensed salon professionals. Please enter your confidential security passcode to proceed.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (beauticianPassword === '2008') {
                    setIsBeauticianAuthorized(true);
                    setPasswordError('');
                    setBeauticianPassword('');
                  } else {
                    setPasswordError('Incorrect passcode. Please enter the valid 4-digit Beautician credentials.');
                    setBeauticianPassword('');
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#CD7F6D] font-bold block">
                    Confidential Security Passcode
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    value={beauticianPassword}
                    onChange={(e) => {
                      setBeauticianPassword(e.target.value.trim());
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Enter Password"
                    className="w-full text-center text-lg font-mono tracking-widest py-3 rounded-2xl bg-[#FAF1EC] dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-800 text-stone-900 dark:text-stone-50 focus:outline-none focus:ring-1 focus:ring-sage"
                    required
                  />
                  {passwordError && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/10 p-2.5 rounded-xl mt-1">
                      ⚠️ {passwordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#CD7F6D] hover:bg-[#B06351] text-white font-semibold py-3 px-4 rounded-2xl text-xs font-mono tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  VERIFY &amp; ENTER SECURE ROOMS
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 3: THERAPIST ROOM (ADMIN DASHBOARD) */}
        {activeTab === 'admin' && isBeauticianAuthorized && (
          <div className="space-y-6 animate-fadeIn" id="therapist-room-view">
            <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl serif text-stone-950 dark:text-stone-50 font-semibold tracking-tight">
                  Therapist Operations Centre (Owner Desk)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Manage bookings, corporate holiday constraints, respond to reviews, add product inventories.
                </p>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <button
                  onClick={() => setIsBeauticianAuthorized(false)}
                  className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-805 text-stone-700 dark:text-stone-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-[11px] font-mono cursor-pointer"
                  title="Lock secured therapist and engineering docs"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                  LOCK PANEL
                </button>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                  ● CLINIC ONLINE
                </span>
                <span className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs px-3 py-1 rounded-full font-bold">
                  SECURE SSL V3
                </span>
              </div>
            </div>

            <Dashboard
              bookings={bookings}
              services={services}
              products={products}
              onChangeBookingStatus={handleChangeBookingStatus}
              holidays={holidays}
              onAddHoliday={handleAddHoliday}
              onRemoveHoliday={handleRemoveHoliday}
              reviews={reviews}
              onAddReviewResponse={handleAddReviewResponse}
              onAddNotification={handleAddNotification}
              onBuyProductSimulate={handleBuyProductSimulate}
              productSalesRecords={productSalesRecords}
            />
          </div>
        )}

        {/* VIEW 4: MASTER PROMPTS DEV DOCS PANEL */}
        {activeTab === 'dev_docs' && isBeauticianAuthorized && (
          <div className="space-y-6 animate-fadeIn" id="dev-docs-view">
            <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl serif text-stone-950 dark:text-stone-50 font-semibold tracking-tight">
                  Prompt Engineering &amp; Architect Docs
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Complete master prompt specs incorporating few-shot templates and Chain-of-Thought paths.
                </p>
              </div>
              <div>
                <button
                  onClick={() => setIsBeauticianAuthorized(false)}
                  className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-805 text-stone-700 dark:text-stone-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-[11px] font-mono cursor-pointer"
                  title="Lock secured therapist and engineering docs"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                  LOCK PANEL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Right explanation panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#FAF1EC] dark:bg-stone-900 border border-[#ECE0DA] dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="serif text-md font-semibold text-stone-950 dark:text-stone-50">
                    Why Few-Shot &amp; CoT?
                  </h3>
                  <p className="text-xs text-stone-605 leading-relaxed">
                    By feeding realistic **before and after few-shot constraints**, we dictate the precise structural boundaries the AI model must respect during generation. Adding an explicit **Chain-of-Thought instruction set** blocks logical omissions and ensures consistent price tax, holiday checks, post-payment, and mobile usability constraints are kept absolute.
                  </p>

                  <div className="h-[1px] bg-[#ECE0DA] dark:bg-stone-800 my-2" />

                  <h4 className="text-xs font-bold font-mono text-terracotta dark:text-amber-400 uppercase">
                    Security Encryption Architecture
                  </h4>
                  <p className="text-xs text-[#2D2D2D]/85 leading-relaxed">
                    Client names and address landmark telemetry records are kept enclosed in encrypted base state formats (SHA-256 local simulations). No sensitive location markers leak outside of the Bangalore Local Landmark Routing database.
                  </p>
                </div>

                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="font-serif text-md font-medium text-stone-950 dark:text-stone-50">
                    Third-Party Integrations
                  </h3>
                  <div className="space-y-2 text-xs text-stone-600">
                    <p className="flex justify-between items-center p-2 bg-stone-50 dark:bg-stone-950 rounded-xl">
                      <span>Google Calendar Sync API</span>
                      <span className="text-emerald-600 font-mono text-[10px] font-bold">READY</span>
                    </p>
                    <p className="flex justify-between items-center p-2 bg-[#FAF1EC] dark:bg-stone-955 border border-[#ECE0DA] rounded-xl">
                      <span>UPI Pay-After-Service</span>
                      <span className="text-[#CD7F6D] font-mono text-[10px] font-bold">📞 +91 9008024916</span>
                    </p>
                    <p className="flex justify-between items-center p-2 bg-stone-50 dark:bg-stone-950 rounded-xl">
                      <span>In-App WebPush Channel</span>
                      <span className="text-emerald-605 font-mono text-[10px] font-bold text-emerald-600">CONNECTED</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Console rendering */}
              <div className="lg:col-span-8">
                <PromptConsole />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* GLOW GUIDE BOTTOM MODAL/DRAWER OVERLAY */}
      <ServiceModal
        service={detailedService}
        onClose={() => setDetailedService(null)}
        onSelect={handleToggleServiceSelection}
        isSelectedInCart={detailedService ? selectedServices.includes(detailedService.id) : false}
      />

      {/* LUXURY INTERACTIVE ATELIER DRAWERS */}
      <ThemeSelector
        currentThemeId={currentThemeId}
        onSelectTheme={setCurrentThemeId}
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />

      {/* Aesthetic High-Contrast Footer */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 mt-20 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src={premiumLogo} 
                alt="Nice Look Logo Small" 
                className="w-8 h-8 object-cover rounded-full border border-stone-200 dark:border-stone-800"
                referrerPolicy="no-referrer"
              />
              <h4 className="font-serif text-base font-bold text-stone-950 dark:text-stone-50">
                NICE LOOK BEAUTY THERAPIST
              </h4>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Premium tailored body care, uncompromised sanitization standards, and custom organic ingredients setups. Proudly operating across all residential corridors in Bangalore, India.
            </p>
            <p className="text-[10px] text-stone-400 font-mono">
              © 2026 Nice Look Inc. All beauty therapeutic rights observed.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
              Treatments List
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li><button onClick={() => { setActiveTab('experience'); }} className="hover:underline text-left">Rica &amp; Honey Waxing Combos</button></li>
              <li><button onClick={() => { setActiveTab('experience'); }} className="hover:underline text-left">K-Glass Glow &amp; Vitamin C Facials</button></li>
              <li><button onClick={() => { setActiveTab('experience'); }} className="hover:underline text-left">Lemon Manicures &amp; Pedicures</button></li>
              <li><button onClick={() => { setActiveTab('experience'); }} className="hover:underline text-left">Elegant Eyebrows Threading</button></li>
              <li><button onClick={() => { setActiveTab('experience'); }} className="hover:underline text-left">Premium Oils Traditional Massage</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
              Corporate Standards
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
              <li>Single-use sterile spatulas and bed wrappers only</li>
              <li>100% organic and colophony-free active ingredients</li>
              <li>Tensioned skin protection hair release methods</li>
              <li>Medical-grade autoclave sterilizations inside base offices</li>
              <li>Post-service check payments strictly validated</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-stone-400 uppercase tracking-widest">
              Live Alert Standby Desk
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Submit your WhatsApp contact details via our booking sheets to receive dynamic calendar reminders. No prior deposits requested.
            </p>
            <div className="flex gap-2">
              <span className="bg-stone-100 dark:bg-stone-850 px-3 py-1.5 rounded-xl text-[10px] font-mono text-stone-600 dark:text-stone-300">
                ⭐ Rated 4.9 by 250+ clients
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
