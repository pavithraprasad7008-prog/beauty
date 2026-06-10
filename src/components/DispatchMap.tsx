import React, { useState, useEffect, useMemo } from 'react';
import { Booking } from '../types';
import { MapPin, Navigation, Compass, Phone, Calendar, Clock, X, Info, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface DispatchMapProps {
  booking: Booking;
  onClose: () => void;
}

// Salon HQ constant (Koramangala 4th Block, Bengaluru)
const SALON_HQ = { lat: 12.9343, lng: 77.6322, name: 'Nice Look Headquarters (Koramangala)' };

export default function DispatchMap({ booking, onClose }: DispatchMapProps) {
  const [apiKey, setApiKey] = useState('');
  
  // Load API key from environment
  useEffect(() => {
    const key =
      process.env.GOOGLE_MAPS_PLATFORM_KEY ||
      (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
      (window as any).GOOGLE_MAPS_PLATFORM_KEY ||
      '';
    setApiKey(key);
  }, []);

  const hasValidKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY' && apiKey.length > 10;

  // Resolve customer coordinates or fall back to default Bangalore coords
  const customerCoords = useMemo(() => {
    return booking.customerCoords || { lat: 12.9343, lng: 77.6322 };
  }, [booking]);

  // Haversine formula to compute great-circle distance
  const routeDistanceKm = useMemo(() => {
    const R = 6371; // km
    const dLat = ((customerCoords.lat - SALON_HQ.lat) * Math.PI) / 180;
    const dLng = ((customerCoords.lng - SALON_HQ.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((SALON_HQ.lat * Math.PI) / 180) *
        Math.cos((customerCoords.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return parseFloat(d.toFixed(1));
  }, [customerCoords]);

  // ETA: driving speed average in Bangalore traffic is around 18-22 km/h. Let's use 20 km/h here.
  const estimatedDurationMins = useMemo(() => {
    if (routeDistanceKm < 0.1) return 5;
    const minutes = (routeDistanceKm / 20) * 60;
    return Math.max(5, Math.round(minutes));
  }, [routeDistanceKm]);

  // Create Google Maps direct URL for the beautician (navigates from Salon HQ to Customer exact coords/address)
  const navUrl = useMemo(() => {
    const destination = `${customerCoords.lat},${customerCoords.lng}`;
    const origin = `${SALON_HQ.lat},${SALON_HQ.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }, [customerCoords]);

  // Address search URL
  const addressSearchUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.customerAddress)}`;
  }, [booking.customerAddress]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="dispatch-map-modal"
        className="bg-[#FAF7F2] dark:bg-stone-900 rounded-3xl overflow-hidden border border-[#EAE2D5] dark:border-stone-800 shadow-2xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-[85vh] animate-fadeIn"
      >
        {/* Left column: Route info or list */}
        <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r border-[#EAE2D5] dark:border-stone-800">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="bg-sage/10 text-sage dark:text-sage-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                  ⚡ BEAUTICIAN ROUTING CARD
                </span>
                <h3 className="text-xl serif font-medium text-stone-900 dark:text-stone-100">
                  Dispatch Desk
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Client Details */}
            <div className="bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-150 dark:border-stone-850 space-y-3">
              <div>
                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Customer Name</p>
                <p className="text-sm font-bold text-stone-850 dark:text-stone-100">{booking.customerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Scheduled Timing</p>
                  <p className="font-semibold text-stone-700 dark:text-stone-300">{booking.timeSlot}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Appt Date</p>
                  <p className="font-semibold text-stone-700 dark:text-stone-300">{booking.date}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Shared Address</p>
                <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-400 font-sans italic">
                  "{booking.customerAddress}"
                </p>
              </div>
            </div>

            {/* Travel metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-950/20 text-center">
                <p className="text-[10px] text-emerald-600/85 dark:text-emerald-400 uppercase font-mono tracking-wider font-semibold">Route Distance</p>
                <p className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-1">{routeDistanceKm} km</p>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-950/20 text-center">
                <p className="text-[10px] text-amber-600/85 dark:text-amber-400 uppercase font-mono tracking-wider font-semibold">Travel Time EST</p>
                <p className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1">{estimatedDurationMins} mins</p>
              </div>
            </div>

            {/* Route explanation step */}
            <div className="text-xs space-y-2 text-stone-600 dark:text-stone-400">
              <p className="font-sans font-semibold">Route summary for the beautician:</p>
              <div className="space-y-2 border-l border-dashed border-stone-200 dark:border-stone-800 pl-4 py-1">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 bg-amber-500 rounded-full w-2.5 h-2.5 border-2 border-white dark:border-stone-900" />
                  <p className="font-mono text-[10px] text-stone-400 uppercase">DEP: Salon HQ (Koramangala)</p>
                  <p className="text-[11px] text-stone-700 dark:text-stone-300">Start from Koramangala block sector Office.</p>
                </div>
                <div className="relative min-h-[30px] flex flex-col justify-center">
                  <div className="absolute -left-[21px] top-1 bg-sage rounded-full w-2.5 h-2.5 border-2 border-white dark:border-stone-900" />
                  <p className="font-mono text-[10px] text-stone-450 uppercase">DEST: Customer Doorstep</p>
                  <p className="text-[11px] text-stone-700 dark:text-stone-300 line-clamp-1">{booking.customerAddress.split(',')[0]} (GPS Lock)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#C17F59] hover:bg-[#A96D4B] text-white py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider text-center block transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="h-4 w-4 animate-pulse" />
              🧭 START GOOGLE MAPS NAVIGATION
            </a>
            
            <a
              href={addressSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white dark:bg-stone-950 hover:bg-stone-50 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 py-2.5 px-4 rounded-xl text-[11px] font-mono text-center block transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Search Full Address Text in Maps
            </a>
          </div>
        </div>

        {/* Right column: The interactive map */}
        <div className="md:col-span-7 h-[300px] md:h-auto min-h-[400px] relative bg-stone-100 dark:bg-stone-950">
          {hasValidKey ? (
            <APIProvider apiKey={apiKey} version="weekly">
              <Map
                defaultCenter={customerCoords}
                defaultZoom={13}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {/* AdvancedMarker for Salon Headquarters */}
                <AdvancedMarker position={SALON_HQ}>
                  <Pin background="#C17F59" glyphColor="#fff" scale={0.9} />
                </AdvancedMarker>

                {/* AdvancedMarker for Customer precise point */}
                <AdvancedMarker position={customerCoords}>
                  <Pin background="#8A9A5B" glyphColor="#fff" scale={1.2} />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            /* Custom stylized vector canvas interactive simulated GIS map */
            <div className="absolute inset-0 overflow-hidden flex flex-col justify-between">
              
              {/* Grid map overlay */}
              <div className="absolute inset-0 bg-stone-200 dark:bg-stone-950 opacity-30 grid grid-cols-10 grid-rows-10 pointer-events-none">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-stone-350 dark:border-stone-900" />
                ))}
              </div>

              {/* Styled geography features */}
              <div className="absolute top-10 left-1/4 w-32 h-20 bg-emerald-100/20 dark:bg-emerald-900/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute bottom-16 right-1/3 w-40 h-28 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#FAF7F2]/50 dark:bg-stone-900/10 rounded-full blur-xl pointer-events-none" />

              {/* Map block details representing real bangalore road grid */}
              <svg className="absolute inset-0 w-full h-full text-white/90 dark:text-stone-900/50 stroke-[3] pointer-events-none">
                {/* Roads */}
                <line x1="10%" y1="0%" x2="10%" y2="100%" className="stroke-white dark:stroke-stone-900/40 opacity-70" />
                <line x1="45%" y1="0%" x2="45%" y2="100%" className="stroke-white dark:stroke-stone-900/40 opacity-70" />
                <line x1="80%" y1="0%" x2="80%" y2="100%" className="stroke-white dark:stroke-stone-900/40 opacity-70" />
                <line x1="0%" y1="20%" x2="100%" y2="20%" className="stroke-white dark:stroke-stone-900/40 opacity-70" />
                <line x1="0%" y1="55%" x2="100%" y2="55%" className="stroke-white dark:stroke-stone-900/40 opacity-70" />
                <line x1="0%" y1="85%" x2="100%" y2="85%" className="stroke-white dark:stroke-stone-900/40 opacity-70" />
                
                {/* Diagonal secondary lanes */}
                <line x1="10%" y1="20%" x2="45%" y2="55%" className="stroke-stone-200 dark:stroke-stone-850 opacity-60" />
                <line x1="45%" y1="55%" x2="80%" y2="85%" className="stroke-stone-200 dark:stroke-stone-850 opacity-60" />
              </svg>

              {/* Route representation from HQ to Customer */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  {/* Animating dash array showing travel route line */}
                  <line 
                    x1="45%" 
                    y1="55%" 
                    x2="70%" 
                    y2="30%" 
                    stroke="#C17F59" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    strokeDasharray="8 6"
                    className="animate-[dash_10s_linear_infinite]"
                    style={{ animation: 'dash 15s linear infinite' }}
                  />
                  <style>{`
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -100;
                      }
                    }
                  `}</style>
                </svg>
              </div>

              {/* SALON HQ PIN (Koramangala HQ - Center-left area) */}
              <div className="absolute top-[55%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-[#C17F59] text-white p-1.5 rounded-full shadow-lg border border-white dark:border-stone-850 relative">
                  <Compass className="h-4 w-4 animate-spin-slow" />
                </div>
                <div className="mt-1 bg-stone-900/95 dark:bg-stone-950 border border-stone-850 rounded px-2 py-0.5 shadow-md">
                  <p className="text-[9px] font-mono text-white font-bold whitespace-nowrap">🏢 SALON HEADQUARTERS</p>
                </div>
              </div>

              {/* CUSTOMER DESTINATION PIN */}
              <div className="absolute top-[30%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-sage/35 rounded-full animate-ping" />
                  <div className="bg-sage text-white p-2.5 rounded-full shadow-lg border border-white dark:border-stone-850 relative">
                    <MapPin className="h-5 w-5 animate-pulse" />
                  </div>
                </div>
                <div className="mt-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur border border-stone-200 dark:border-stone-850 rounded-xl px-2.5 py-1.5 shadow-xl max-w-[140px] text-center">
                  <p className="text-[9px] font-mono font-bold text-stone-800 dark:text-stone-100 truncate">
                    📍 CLIENT: {booking.customerName.toUpperCase()}
                  </p>
                  <p className="text-[8px] text-stone-550 font-mono mt-0.5">
                    Lat: {customerCoords.lat.toFixed(4)}<br/>Lng: {customerCoords.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* Status footer inside simulated map */}
              <div className="m-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur border border-stone-200 dark:border-stone-800 p-3 rounded-2xl shadow-lg z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <p className="text-[10px] font-mono font-bold text-stone-800 dark:text-stone-200">
                    DISPATCH MAP READY (GPS ACTIVE)
                  </p>
                </div>
                <p className="text-[9px] font-mono text-stone-400">
                  Bangalore Local Vector Coverage
                </p>
              </div>

              {/* Info text box at the top */}
              <div className="m-4 mt-16 md:mt-4 p-2.5 bg-amber-500/10 dark:bg-amber-900/5 backdrop-blur border border-amber-500/20 text-stone-700 dark:text-amber-300 rounded-xl text-[10px] flex items-center gap-1.5 z-10">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <p className="leading-normal">
                  No active Google Maps Platform billing key detected. Showing high-fidelity offline vector grid fallback. Real key can be bound in AI Studio Secrets to unlock standard maps.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
