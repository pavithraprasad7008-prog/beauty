import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Heart, ShieldAlert, Award } from 'lucide-react';

export default function Welcome3DCard() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show the card for 2 seconds, then trigger the 500ms exit transition
    const autoDismissTimer = setTimeout(() => {
      setIsFadingOut(true);
      const unmountTimer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(unmountTimer);
    }, 2000);

    return () => clearTimeout(autoDismissTimer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFadingOut) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Get mouse coordinate calculations relative to center of the tile
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    const mouseX = e.clientX - rect.left - cardWidth / 2;
    const mouseY = e.clientY - rect.top - cardHeight / 2;
    
    // Max 15 degrees tilting intensity
    const maxTilt = 15;
    const rX = -(mouseY / (cardHeight / 2)) * maxTilt;
    const rY = (mouseX / (cardWidth / 2)) * maxTilt;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    if (isFadingOut) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`relative z-20 max-w-7xl mx-auto mb-8 transition-all duration-500 ease-in-out transform ${
        isFadingOut 
          ? 'opacity-0 -translate-y-12 scale-95 pointer-events-none max-h-0 !mb-0 overflow-hidden' 
          : 'opacity-100 translate-y-0 scale-100 animate-fadeIn'
      }`} 
      id="welcome-3d-outer"
    >
      {/* 3D Scene viewport parent */}
      <div style={{ perspective: 1000 }} className="w-full">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.015 : 1})`,
            transition: isHovered ? 'transform 0.05s ease-out, shadow 0.15s ease' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), shadow 0.4s ease',
            transformStyle: 'preserve-3d',
          }}
          className={`relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#FAF1EC] via-[#FCF8F5] to-[#F2EAE4] dark:from-[#1D1615] dark:via-[#151110] dark:to-[#2B1B19] border border-[#ECE0DA] dark:border-stone-800 shadow-${isHovered ? '2xl' : 'md'} cursor-grab transition-shadow duration-300 hover:shadow-[#CD7F6D]/5 select-none`}
          id="welcome-3d-interactive-card"
        >
          {/* Accent lighting highlights positioned on deeper back-layer planes */}
          <div 
            style={{ transform: 'translateZ(-40px)' }} 
            className="absolute pointer-events-none -top-16 -left-16 w-48 h-48 bg-amber-100/30 dark:bg-amber-950/20 rounded-full blur-3xl" 
          />
          <div 
            style={{ transform: 'translateZ(-40px)' }} 
            className="absolute pointer-events-none -bottom-16 -right-16 w-56 h-56 bg-emerald-100/20 dark:bg-emerald-950/10 rounded-full blur-3xl" 
          />

          {/* Dismiss button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute top-4 right-4 z-40 p-1.5 rounded-full bg-stone-200/50 hover:bg-stone-200/80 dark:bg-stone-850 dark:hover:bg-stone-820 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-all cursor-pointer"
            title="Dismiss Greeting Info Banner"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Core Row Grid designed with multi-level translation Z depths */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Title & Body text with medium depth */}
            <div 
              style={{ transform: 'translateZ(45px)' }} 
              className="md:col-span-8 space-y-4"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 py-1 px-3 rounded-full bg-sage/10 text-sage dark:text-sage-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 animate-pulse text-[#CD7F6D]" />
                  Live Experience Lounge
                </span>
                <span className="text-[10px] font-mono font-medium text-stone-400">
                  🏠 Bangalore Home Dispatch Active
                </span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white tracking-tight leading-snug">
                  Thank You for Visiting! ✨
                </h1>
                <p className="text-xs sm:text-[13px] font-sans text-stone-600 dark:text-stone-300 font-normal leading-relaxed">
                  We are absolutely thrilled to welcome you to our wellness sanctuary page. Nice Look delivers certified, medical-grade sanitized home hair removal regimens and intensive Korean glass glow treatments right to your doorstep. Type your address instantly or pin on the live coverage map.
                </p>
              </div>

              {/* Status bullet elements */}
              <div className="flex items-center gap-4 flex-wrap pt-1 text-[10px] font-mono font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                <div className="flex items-center gap-1">
                  <span className="text-rose-500">♥️</span>
                  <span>100% Colophony-Free Wax</span>
                </div>
                <div className="h-1.5 w-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                <div className="flex items-center gap-1">
                  <span className="text-[#CD7F6D]">⭐</span>
                  <span>Beautician Code: 2008 Only</span>
                </div>
                <div className="h-1.5 w-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                <div className="flex items-center gap-1">
                  <span className="text-emerald-600">📍</span>
                  <span>Interactive Coordinates Pin</span>
                </div>
              </div>
            </div>

            {/* Interactive Float Ribbon Widget with highest Z depth */}
            <div 
              style={{ transform: 'translateZ(90px)' }} 
              className="md:col-span-4"
            >
              <div className="p-5 bg-white/70 dark:bg-[#151413]/60 backdrop-blur border border-[#ECE0DA] dark:border-stone-800 rounded-2xl text-center space-y-3 shadow-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF1EC]/20 to-transparent dark:from-stone-900/10 dark:to-transparent pointer-events-none" />
                
                <div className="inline-flex bg-[#FAF1EC] dark:bg-stone-900/80 border border-[#ECE0DA] dark:border-stone-800 p-2 rounded-xl text-stone-900 dark:text-stone-100 shadow-sm">
                  <Award className="h-5 w-5 text-[#CD7F6D]" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-mono font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Customer Reward Welcome
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Your exclusive 10% first-time discount code is pre-applied at checklist checkout!
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-850 inline-block text-[10px] font-mono text-[#CD7F6D] font-bold tracking-widest shadow-inner">
                  WELCOMEGLOW10
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
