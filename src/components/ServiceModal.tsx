import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { X, Heart, Shield, Sparkles, HelpCircle, Check, MapPin } from 'lucide-react';

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
  onSelect: (serviceId: string) => void;
  isSelectedInCart: boolean;
}

export default function ServiceModal({
  service,
  onClose,
  onSelect,
  isSelectedInCart,
}: ServiceModalProps) {
  if (!service) return null;

  const [isFavorited, setIsFavorited] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync favorited status from localStorage on service change
  useEffect(() => {
    if (service) {
      try {
        const favs = JSON.parse(localStorage.getItem('nice_look_favorites') || '[]');
        setIsFavorited(favs.includes(service.id));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, [service]);

  const handleToggleFavorite = () => {
    if (!service) return;
    try {
      const favs = JSON.parse(localStorage.getItem('nice_look_favorites') || '[]');
      let updatedFavs = [];
      if (favs.includes(service.id)) {
        updatedFavs = favs.filter((id: string) => id !== service.id);
        setIsFavorited(false);
        setToastMessage('Removed from Favorites');
      } else {
        updatedFavs = [...favs, service.id];
        setIsFavorited(true);
        setToastMessage('Added to Favorites!');
      }
      localStorage.setItem('nice_look_favorites', JSON.stringify(updatedFavs));
      
      // Dispatch an event so other components (like ServiceList) can react immediately
      window.dispatchEvent(new Event('favorites-updated'));

      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Failed to update favorites', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" id="service-modal-overlay">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-stone-900/60 backdrop-blur-sm" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white dark:bg-stone-900 rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-stone-200/80 dark:border-stone-800">
          
          <div className="relative">
            {/* Quick Add to Favorites button */}
            <button 
              type="button"
              onClick={handleToggleFavorite}
              className={`absolute top-4 right-14 z-10 p-2 rounded-full transition-all cursor-pointer shadow-sm ${
                isFavorited 
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200/50 dark:border-rose-800' 
                  : 'bg-white/80 dark:bg-stone-950/80 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 border border-transparent'
              }`}
              id="favorite-modal-btn"
              title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''} transition-transform duration-300 hover:scale-110`} />
            </button>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-stone-950/80 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 transition-all cursor-pointer shadow-sm"
              id="close-modal-btn"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Subtle floating banner notification */}
            {showToast && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300 animate-fadeIn">
                <div className="bg-stone-900/90 dark:bg-stone-950/95 text-stone-100 px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase shadow-md flex items-center gap-1.5 border border-stone-850">
                  <span className="text-rose-500 font-bold">♥</span>
                  {toastMessage}
                </div>
              </div>
            )}

            {/* Elegant Typographic Header */}
            <div className="bg-[#FAF1EC] dark:bg-stone-950/80 px-6 pt-12 pb-6 sm:px-8 border-b border-[#ECE0DA] dark:border-stone-800/80">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#CD7F6D] text-[#FCF6F3] text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full font-semibold">
                  {service.category}
                </span>
                {service.skinType && (
                  <span className="bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium">
                    {service.skinType.split(',')[0]}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl serif text-stone-900 dark:text-stone-100 font-semibold leading-tight">
                {service.name}
              </h3>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Quick specifications */}
            <div className="grid grid-cols-3 gap-4 border-b border-stone-100 dark:border-stone-800/60 pb-5">
              <div className="text-center bg-[#FAF1EC] dark:bg-stone-950 p-3 rounded-2xl border border-[#ECE0DA] dark:border-stone-800/20">
                <p className="text-[10px] font-mono text-stone-400 uppercase">Rupees Price</p>
                <p className="text-base font-bold text-terracotta dark:text-[#E2B79A] mt-1">₹{service.price}</p>
                <p className="text-[9px] text-stone-400 mt-0.5">Post-Service Pay</p>
              </div>
              <div className="text-center bg-[#FAF1EC] dark:bg-stone-950 p-3 rounded-2xl border border-[#ECE0DA] dark:border-stone-800/20">
                <p className="text-[10px] font-mono text-stone-400 uppercase">Duration</p>
                <p className="text-base font-bold text-stone-800 dark:text-stone-200 mt-1">{service.durationMinutes}m</p>
                <p className="text-[9px] text-stone-400 mt-0.5">Relaxing Care</p>
              </div>
              <div className="text-center bg-[#FAF1EC] dark:bg-stone-950 p-3 rounded-2xl border border-[#ECE0DA] dark:border-stone-800/20">
                <p className="text-[10px] font-mono text-stone-400 uppercase">Compatibility</p>
                <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 mt-1 lines-2 truncate" title={service.skinType}>
                  {service.skinType.split(',')[0]}
                </p>
                <p className="text-[9px] text-stone-400 mt-0.5">Suitable Skins</p>
              </div>
            </div>

            {/* Core Details (Benefits & Ingredients) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-mono font-semibold text-[#CD7F6D] dark:text-[#E2B79A] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sage" />
                  Benefits &amp; Visible Glow Outcomes
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-605 dark:text-stone-300">
                  {service.benefits.map((b, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-sage shrink-0 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-mono font-semibold text-[#CD7F6D] dark:text-[#E2B79A] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-sage" />
                  Key Active Ingredients Present
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {service.ingredients.map((ing, idx) => (
                    <span 
                      key={idx} 
                      className="bg-[#FAF1EC] dark:bg-stone-900 border border-[#ECE0DA] dark:border-stone-800 text-stone-800 dark:text-stone-200 px-2.5 py-1 rounded-lg text-xs font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
                <div className="mt-3.5 p-2.5 bg-[#FAF1EC] dark:bg-stone-950 rounded-xl border border-[#ECE0DA] text-[11px] text-stone-550 italic">
                  *Completely natural derivatives and colophony-free agents.
                </div>
              </div>
            </div>

            {/* Treatment Procedure & Aftercare */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 dark:border-stone-800/40 pt-5">
              <div>
                <h4 className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  Treatment Steps &amp; Procedure
                </h4>
                <ol className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                  {service.procedure.map((step, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-stone-400 font-mono text-[10px] bg-stone-100 dark:bg-stone-800 h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-xs font-mono font-semibold text-stone-705 dark:text-stone-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  Post-Treatment Aftercare Guidance
                </h4>
                <ul className="space-y-2 text-xs text-stone-650 dark:text-stone-305">
                  {service.aftercare.map((ac, idx) => (
                    <li key={idx} className="flex gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-sage shrink-0 mt-1.5" />
                      <span>{ac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Safety & Hygiene Seals */}
            <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800/80 rounded-2xl p-4.5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  Aesthetic Safety Checkpoints
                </h5>
                <ul className="text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                  {service.safety.map((s, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  Sanitization &amp; Hygiene Standards
                </h5>
                <ul className="text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                  {service.hygiene.map((h, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-stone-50 dark:bg-stone-950 px-6 py-5 flex items-center justify-between border-t border-stone-150 dark:border-stone-800/50">
            <span className="text-xs text-stone-500">
              *Taxes (GST/GDP cover) &amp; discounts handled live in booking form.
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-stone-300 dark:border-stone-700 text-xs font-semibold rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelect(service.id);
                  onClose();
                }}
                className={`px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer select-none shadow-sm ${
                  isSelectedInCart
                    ? 'bg-sage-100 dark:bg-sage-900/30 text-sage-800 dark:text-sage-300 border border-sage-300'
                    : 'bg-sage hover:bg-sage-600 text-white'
                }`}
                id={`modal-action-select-${service.id}`}
              >
                {isSelectedInCart ? 'In Treatment Cart' : 'Book Session'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
