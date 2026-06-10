import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Star, CheckCircle, Flame, Heart, Lock, Key, Award, Send } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  serviceName: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
}

interface BeauticianProfileProps {
  onBookClick: () => void;
  reviews: Review[];
  onAddReview: (review: { customerName: string; serviceName: string; rating: number; text: string }) => void;
  servicesList: { id: string; name: string; category: string }[];
  defaultReviewName?: string;
  defaultReviewService?: string;
}

export default function BeauticianProfile({
  onBookClick,
  reviews,
  onAddReview,
  servicesList,
  defaultReviewName = '',
  defaultReviewService = '',
}: BeauticianProfileProps) {
  // Local state to submit a review directly on Pinky's profile (so clients can leave instant feedback)
  const [newReviewName, setNewReviewName] = useState(defaultReviewName);
  const [newReviewService, setNewReviewService] = useState(defaultReviewService);

  // Sync pre-filled feedback props if provided
  React.useEffect(() => {
    if (defaultReviewName) {
      setNewReviewName(defaultReviewName);
    }
  }, [defaultReviewName]);

  React.useEffect(() => {
    if (defaultReviewService) {
      setNewReviewService(defaultReviewService);
    }
  }, [defaultReviewService]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // OTP Demo Simulation State for Trust assurance
  const [simulatedPhone, setSimulatedPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [errorOtp, setErrorOtp] = useState('');

  // Extract initials for anonymous customer listing
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'A.C.';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) {
      return (fullName[0] || 'A').toUpperCase() + '.';
    }
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstInitial}.${lastInitial}.`.toUpperCase();
  };

  // Sort reviews newest first
  const sortedReviews = [...reviews].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate Average Rating dynamically
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  // Handle Review Submission
  const handleReviewFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewText) return;
    onAddReview({
      customerName: newReviewName,
      serviceName: newReviewService || 'Premium General Care',
      rating: newReviewRating,
      text: newReviewText,
    });
    setNewReviewName('');
    setNewReviewText('');
    setNewReviewService('');
    setNewReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 5000);
  };

  // Simulate sending a secure clinical OTP verification
  const handleSendOtpSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedPhone) return;
    setOtpSent(true);
    setErrorOtp('');
    setOtpSuccess(false);
  };

  // Validate OTP simulation
  const handleVerifyOtpSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpVal === '1234') {
      setOtpSuccess(true);
      setErrorOtp('');
    } else {
      setErrorOtp('Incorrect OTP passcode. For simulation demo, please enter 1234');
    }
  };

  // Render Star Utility
  const renderStars = (ratingCount: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= ratingCount
                ? 'fill-terracotta text-terracotta'
                : 'text-stone-300 dark:text-stone-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-fadeIn" id="beautician-profile-workspace">
      
      {/* 1. PROFILE HEADER SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FCF8F5] to-[#FAF1EC] dark:from-[#1D1615] dark:via-[#151110] dark:to-[#2B1B19] border border-[#ECE0DA] dark:border-stone-800 shadow-xl p-6 md:p-10">
        
        {/* Glamorous background radial light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(205,127,109,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute top-4 right-4 bg-[#CD7F6D]/10 text-[#CD7F6D] dark:text-amber-300 text-[10px] font-bold font-mono px-3.5 py-1.5 rounded-full border border-[#CD7F6D]/20 uppercase tracking-widest animate-pulse shadow-sm">
          📍 100% At-Home Service
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10 items-center">
          
          {/* Large Professional Profile Image */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative group">
              {/* Outer Golden/Terracotta Halo Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#CD7F6D] to-[#9C5F6D] rounded-full blur-xs opacity-60 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative h-56 w-56 sm:h-64 sm:w-64 rounded-full overflow-hidden border-4 border-white dark:border-stone-900 bg-stone-100 shadow-xl shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=600&h=600&q=80"
                  alt="PINKY NAGENDRA PRASAD - High End Home-Service Beautician Specialist"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Verified Ribbon Bottom Badge */}
              <div className="absolute -bottom-2 -translate-x-1/2 left-1/2 bg-[#5A8F75] text-white text-[10px] font-bold tracking-widest font-mono uppercase px-4 py-1.5 rounded-full shadow-lg border border-emerald-400/20 whitespace-nowrap flex items-center gap-1.5 animate-bounce">
                <CheckCircle className="h-3.5 w-3.5 fill-emerald-100 text-[#5A8F75]" />
                Verified Partner
              </div>
            </div>

            {/* Quick Metrics display directly under image */}
            <div className="mt-8 flex gap-4 w-full justify-center">
              <div className="text-center bg-white/50 dark:bg-stone-950/40 border border-[#ECE0DA] dark:border-stone-850 px-4 py-2.5 rounded-2xl w-24">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 font-mono">Rating</p>
                <p className="text-lg font-serif font-extrabold text-[#CD7F6D] mt-0.5">{avgRating} ★</p>
              </div>
              <div className="text-center bg-white/50 dark:bg-stone-950/40 border border-[#ECE0DA] dark:border-stone-850 px-4 py-2.5 rounded-2xl w-24">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 font-mono">Exp</p>
                <p className="text-lg font-serif font-extrabold text-[#CD7F6D] mt-0.5">5+ Years</p>
              </div>
              <div className="text-center bg-white/50 dark:bg-stone-950/40 border border-[#ECE0DA] dark:border-stone-850 px-4 py-2.5 rounded-2xl w-28">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 font-mono">Location</p>
                <p className="text-xs font-bold font-mono text-stone-700 dark:text-stone-200 mt-1 leading-none">Bangalore</p>
              </div>
            </div>
          </div>

          {/* Right Header content columns */}
          <div className="md:col-span-8 text-center md:text-left space-y-5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#CD7F6D]/10 text-[#CD7F6D] dark:text-[#E2B79A] text-[9.5px] font-bold font-mono uppercase tracking-widest border border-[#CD7F6D]/20">
                <Sparkles className="h-3 w-3 animate-spin text-[#CD7F6D]" />
                Exclusive Solo Practitioner
              </span>
              <h2 className="title-serif text-3xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
                PINKY NAGENDRA PRASAD
              </h2>
              <p className="text-sm md:text-md text-[#9C5F6D] dark:text-[#E2B79A] font-medium font-mono italic tracking-wide max-w-xl">
                Expert in facial, waxing, threading, pedicure, manicure & skin care at home
              </p>
            </div>

            {/* Quick trust metrics text list */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-medium text-stone-605 dark:text-stone-400 py-1.5">
              <span className="flex items-center gap-1.5">
                🌸 <strong className="text-stone-850 dark:text-stone-200">250+ Sessions</strong> Placed
              </span>
              <span className="text-stone-300 dark:text-stone-800 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                ⭐ <strong className="text-stone-850 dark:text-stone-200">{avgRating}/5 Client Rating</strong>
              </span>
              <span className="text-stone-300 dark:text-stone-800 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                🛡️ <strong className="text-stone-850 dark:text-stone-200">100% Shield Guard</strong> Sanitized
              </span>
            </div>

            <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 max-w-2xl font-sans font-normal">
              Skip travel fatigue and traffic delays completely. Serving elite residential complexes across Bengaluru with medical-grade hygiene kits, single-use disposables, and bespoke organic extracts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-3.5 justify-center md:justify-start">
              <button
                onClick={onBookClick}
                className="luxury-btn-glow bg-[#CD7F6D] hover:bg-[#B06351] text-white font-mono text-xs font-extrabold uppercase py-4 px-8 rounded-2xl transition duration-300 shadow-md flex items-center justify-center gap-2 tracking-widest cursor-pointer"
                id="profile-book-cta"
              >
                📅 BOOK APPOINTMENT WITH PINKY
              </button>
              
              <div className="bg-white/40 dark:bg-stone-900/40 p-2.5 px-4 rounded-xl border border-[#ECE0DA] dark:border-stone-850 text-left">
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-medium">Beautician Direct Helpline</span>
                <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100">+91 90080 24916</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column layout: About (8 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 2. ABOUT SECTION */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 md:p-8 border border-[#ECE0DA] dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-850 pb-3">
              <span className="text-2xl text-[#CD7F6D]">🌸</span>
              <div>
                <h3 className="serif text-xl font-bold text-stone-900 dark:text-stone-50">
                  Meet Your Personal Therapist
                </h3>
                <p className="text-[10px] font-mono text-stone-450 uppercase tracking-widest leading-none mt-1">
                  Founder &amp; Certified Practitioner
                </p>
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
              <p>
                Hi, I'm a professional home-service beautician with over <strong>5 years of experience</strong> in skincare, facials, waxing, pedicure, manicure, threading and personal grooming services.
              </p>
              <p>
                I'm passionate about delivering a premium salon-like experience at home, with full attention to hygiene, comfort and care. Every service is done with professional techniques and quality products to ensure the best results for your skin and well-being.
              </p>
              <p>
                My goal is simple—to make you feel confident, refreshed, and cared for, without the stress of travelling to a salon. I focus on providing a smooth, relaxing and trustworthy experience every time you book.
              </p>
              <p className="font-serif italic font-semibold text-[#9C5F6D] dark:text-[#E2B79A]">
                "Looking forward to bringing beauty and self-care right to your doorstep."
              </p>
            </div>

            {/* Specialties collage display */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-850/60">
              <h4 className="text-[10px] font-bold font-mono tracking-wider uppercase text-stone-400 mb-3 block">
                Pinky's Care Standards:
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FCF8F5] dark:bg-stone-950 rounded-xl border border-[#ECE0DA] dark:border-stone-850 flex items-start gap-2.5">
                  <span className="text-lg">🌿</span>
                  <div>
                    <h5 className="text-[11px] font-bold text-stone-850 dark:text-stone-100">Pure Organic Products</h5>
                    <p className="text-[10px] text-stone-450 mt-0.5 line-clamp-2">Colophony-free Rica wax and premium clinical Vitamin-C packs without toxic bleaches.</p>
                  </div>
                </div>
                <div className="p-3 bg-[#FCF8F5] dark:bg-stone-950 rounded-xl border border-[#ECE0DA] dark:border-stone-850 flex items-start gap-2.5">
                  <span className="text-lg">✨</span>
                  <div>
                    <h5 className="text-[11px] font-bold text-stone-850 dark:text-stone-100">Relaxing Head Massage</h5>
                    <p className="text-[10px] text-stone-450 mt-0.5 line-clamp-2">Comes complementary with facials, incorporating pressure points and almond oil nourishment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. REVIEWS SECTION */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 md:p-8 border border-[#ECE0DA] dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-101 dark:border-stone-850 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-[#CD7F6D]">⭐</span>
                <div>
                  <h3 className="serif text-xl font-bold text-stone-900 dark:text-stone-50">
                    Trusted Client Logbooks
                  </h3>
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-1">
                    Anonymous Displays (Initials Only)
                  </p>
                </div>
              </div>
              <span className="bg-[#FAF1EC] dark:bg-stone-950 text-stone-600 dark:text-stone-300 px-3.5 py-1 rounded-full font-mono text-[11px] border border-[#ECE0DA] dark:border-stone-800 font-bold">
                {reviews.length} Reviews
              </span>
            </div>

            {/* List Reviews - newest first */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
              {sortedReviews.map((rev) => {
                const initials = getInitials(rev.customerName);
                return (
                  <div
                    key={rev.id}
                    className="p-4 bg-stone-50/50 dark:bg-stone-955/20 border border-stone-100 dark:border-stone-850/60 rounded-2xl space-y-2.5 hover:border-[#CD7F6D]/20 hover:bg-stone-50/80 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#CD7F6D]/15 text-[#CD7F6D] font-mono text-xs font-bold flex items-center justify-center border border-[#CD7F6D]/30 shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-stone-800 dark:text-stone-200">
                            Verified Guest — <span className="text-[#9C5F6D] dark:text-[#E2B79A]">{initials}</span>
                          </p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                            Treatment: {rev.serviceName} • {rev.date}
                          </p>
                        </div>
                      </div>
                      {renderStars(rev.rating)}
                    </div>
                    
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic fill-none">
                      "{rev.text}"
                    </p>

                    {/* Beautician reply dialog if present */}
                    {rev.reply && (
                      <div className="pl-4 border-l-2 border-[#CD7F6D] bg-[#FCF8F5]/50 dark:bg-stone-950/40 p-2.5 rounded-r-xl text-[11px] space-y-1">
                        <p className="font-mono text-[10px] text-[#CD7F6D] font-bold">
                          🌸 Response from Pinky Prasad:
                        </p>
                        <p className="text-stone-550 dark:text-stone-400 leading-relaxed">
                          "{rev.reply}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Write a review inside profile */}
            <div className="pt-6 border-t border-stone-100 dark:border-stone-850/60 space-y-4">
              <h4 className="serif text-sm font-bold text-stone-900 dark:text-stone-50 flex items-center gap-1.5 pb-2 border-b border-dashed border-stone-100">
                ✍️ Write a Service Feedback for Pinky
              </h4>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/10 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl font-medium animate-fadeIn">
                  ✓ Success! Your feedback has been placed and anonymously listed above (initials only). Thank you for supporting Pinky's elite home service desk.
                </div>
              )}

              <form onSubmit={handleReviewFormSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-mono uppercase text-stone-400 font-bold block">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-850 text-stone-900 dark:text-stone-100"
                      placeholder="e.g. Aishwarya Sen"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-mono uppercase text-stone-400 font-bold block">
                      Treatment Received
                    </label>
                    <select
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-850 text-stone-900 dark:text-stone-100"
                      value={newReviewService}
                      onChange={(e) => setNewReviewService(e.target.value)}
                    >
                      <option value="">Select treatment...</option>
                      {servicesList.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono uppercase text-stone-400 font-bold block">
                    Treatment Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setNewReviewRating(stars)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            stars <= newReviewRating
                              ? 'fill-terracotta text-terracotta'
                              : 'text-stone-300 dark:text-stone-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-mono text-[11px] font-bold text-stone-500">
                      {newReviewRating}/5 Star Score
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono uppercase text-stone-400 font-bold block">
                    Describe Your Experience
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-850 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-sage"
                    placeholder="Provide your helpful feedback on comfort, safety, product smell, massage strokes, or overall glow..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#CD7F6D] hover:bg-[#B06351] text-white font-mono font-bold tracking-wider py-2.5 px-5 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  SUBMIT CONFIDENTIALLY
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Right Column layout: Trust, OTP demonstration, verify badge (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 4. TRUST SECTION */}
          <div className="bg-gradient-to-b from-[#FCF8F5] to-white dark:from-[#1D1615] dark:to-stone-900 rounded-3xl p-6 md:p-8 border border-[#ECE0DA] dark:border-stone-800 shadow-sm space-y-6">
            
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-850">
              <ShieldCheck className="h-6 w-6 text-[#5A8F75] animate-pulse" />
              <div>
                <h3 className="serif text-md font-bold text-stone-900 dark:text-stone-50">
                  Clinical Safety &amp; Trust Guard
                </h3>
                <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">
                  Certified Home Protocols
                </p>
              </div>
            </div>

            {/* Shield list assurance */}
            <div className="space-y-4">
              
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100/60 dark:bg-emerald-950/20 p-2 rounded-xl text-[#5A8F75] border border-emerald-200/20 shrink-0">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-850 dark:text-stone-100 flex items-center gap-1.5">
                    "Verified Beautician" Badge
                  </h4>
                  <p className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                    Pinky holds authentic certification in professional cosmetology &amp; aesthetic hygiene from licensed beauty institutions. Zero subcontracted technicians.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-emerald-100/60 dark:bg-emerald-950/20 p-2 rounded-xl text-[#5A8F75] border border-emerald-200/20 shrink-0">
                  🛡️
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-850 dark:text-stone-100">
                    Hygiene &amp; Safety Assurance Message
                  </h4>
                  <p className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                    Therapist wears complete disposable face shield, medical mask, and surgical gloves throughout. No double dipping of waxing spatulas, 100% disposed towels and beds wrappers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-emerald-100/60 dark:bg-emerald-950/20 p-2 rounded-xl text-[#5A8F75] border border-emerald-200/20 shrink-0">
                  ⚡
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-850 dark:text-stone-100">
                    Professional Tools &amp; Sanitized Kit Note
                  </h4>
                  <p className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                    All metallic tools (clippers, cuticle pushers, blackhead extractors) undergo autoclave dry heat disinfection inside Pinky's headquarters prior to dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-emerald-100/60 dark:bg-emerald-950/20 p-2 rounded-xl text-[#5A8F75] border border-emerald-200/20 shrink-0">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-850 dark:text-stone-100">
                    OTP Verification Before Starting Service
                  </h4>
                  <p className="text-[11.5px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                    For uncompromised client safety, a secure OTP triggers on your registered phone upon Pinky's arrival. This blocks unauthorized providers and locks booking accuracy.
                  </p>
                </div>
              </div>

            </div>

            {/* Interactive OTP simulator demo panel */}
            <div className="p-4 bg-white dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-850 rounded-2xl space-y-3.5">
              <span className="inline-block py-0.5 px-2.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[9px] font-mono text-stone-400 uppercase tracking-widest font-bold">
                🔒 Try Interactive OTP Simulation Demo
              </span>

              {otpSuccess ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl space-y-1 font-sans">
                  <p className="font-bold flex items-center gap-1">✅ Identity Verified!</p>
                  <p className="text-[11px] leading-relaxed">Identity matching with Pinky Nagendra Prasad is successful. Safe clinical treatment session is now authorized to start.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtpSimulate} className="space-y-2">
                      <p className="text-[10px] text-stone-500 font-mono">
                        Simulate booking verification code dispatch:
                      </p>
                      <div className="flex gap-1.5">
                        <input
                          type="tel"
                          required
                          placeholder="Enter 10-digit Phone"
                          className="flex-1 p-2 bg-[#FCF8F5] dark:bg-stone-900 border border-[#ECE0DA] dark:border-stone-800 rounded-xl text-xs font-mono"
                          value={simulatedPhone}
                          onChange={(e) => setSimulatedPhone(e.target.value.replace(/\D/g,''))}
                        />
                        <button
                          type="submit"
                          className="bg-stone-900 dark:bg-stone-800 hover:bg-[#CD7F6D] text-white text-[10px] font-bold font-mono px-3 py-2 rounded-xl transition duration-300 cursor-pointer text-center"
                        >
                          SEND OTP
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtpSimulate} className="space-y-2 animate-fadeIn">
                      <p className="text-[10px] text-stone-500 font-mono">
                        OTP dispatched! Enter simulated passcode <strong>1234</strong> to proceed:
                      </p>
                      <div className="flex gap-1.5 col-span-2">
                        <input
                          type="text"
                          maxLength={4}
                          required
                          placeholder="e.g. 1234"
                          className="flex-1 p-2 bg-[#FCF8F5] dark:bg-stone-950 border border-[#ECE0DA] text-center dark:border-stone-800 rounded-xl text-xs font-mono font-bold tracking-widest"
                          value={otpVal}
                          onChange={(e) => setOtpVal(e.target.value.trim())}
                        />
                        <button
                          type="submit"
                          className="bg-[#CD7F6D] hover:bg-[#B06351] text-white text-[10.5px] font-bold font-mono px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          VERIFY OTP
                        </button>
                      </div>
                      
                      {errorOtp && (
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-mono mt-1">⚠️ {errorOtp}</p>
                      )}

                      <button 
                        type="button" 
                        onClick={() => setOtpSent(false)} 
                        className="text-[10px] text-[#CD7F6D] font-mono hover:underline"
                      >
                        ← Resend/Change Number
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-250/20 text-[11px] leading-relaxed text-amber-800 dark:text-amber-400 font-mono">
              ★ Active Salon Standby: Pinky has been background tested and holds zero negative reviews or service accidents in her 5 years of operation. Excellent!
            </div>
          </div>

          {/* Quick Helpline Contact Desk Card */}
          <div className="bg-stone-900 text-[#FAF6F5] rounded-3xl p-6 border border-stone-850 shadow-sm space-y-4">
            <h4 className="font-serif text-sm font-semibold text-white">
              Need Help Prior to Locking slots?
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              If you have custom skin requirements (e.g. skin conditions, active acne, or specific product sensitivities), feel free to directly message Pinky Prasad on WhatsApp or place a direct call.
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="https://wa.me/919008024916"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold py-2.5 px-4 rounded-xl text-center tracking-widest uppercase block"
              >
                💬 CHAT ON WHATSAPP (+91 9008024916)
              </a>
              <a 
                href="tel:+919008024916" 
                className="bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-mono text-[10px] font-bold py-2.5 px-4 rounded-xl text-center tracking-widest uppercase block"
              >
                📞 DIAL PINKY DIRECTLY
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
