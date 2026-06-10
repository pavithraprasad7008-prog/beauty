import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { Sparkles, Clock, ShieldCheck, HeartPulse, Search, Eye, Filter, Heart } from 'lucide-react';
import { getServiceImageUrl } from '../utils/imageMapper';

interface ServiceListProps {
  services: Service[];
  onSelectService: (service: Service) => void;
  selectedServices: string[];
  onToggleBookingSelection: (serviceId: string) => void;
}

export default function ServiceList({
  services,
  onSelectService,
  selectedServices,
  onToggleBookingSelection,
}: ServiceListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('nice_look_favorites') || '[]');
        setFavorites(favs);
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };

    loadFavorites();
    window.addEventListener('favorites-updated', loadFavorites);
    return () => window.removeEventListener('favorites-updated', loadFavorites);
  }, []);

  const categories = ['All', 'Waxing', 'Facial & Cleanup', 'Manicure & Pedicure', 'Threading & Face Wax', 'D-Tan & Bleach', 'Hair Services'];

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          s.skinType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6" id="services-section">
      {/* Search and Category Filter Header with glassmorphism and subtle sweep */}
      <div className="luxury-glass rounded-3xl p-6 shadow-sm shimmer-sweep">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div>
            <h2 className="text-2xl serif text-[#2D2D2D] dark:text-stone-100 font-bold tracking-tight">
              Aura Beauty Treatments Menu
            </h2>
            <p className="text-[10px] text-[#CD7F6D] dark:text-[#E2B79A] font-mono mt-0.5 tracking-widest uppercase font-semibold">
              EST. BANGALORE / HYGIENIC &amp; ACCREDITED
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="luxury-icon-bounce absolute left-3.5 top-2.5 h-4 w-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              placeholder="Search ingredients, skin types, or treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white/80 dark:bg-stone-950/80 border border-[#ECE0DA] dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CD7F6D]/40 focus:border-[#CD7F6D] text-[#2C2220] dark:text-[#FAF6F5] transition-all duration-300 shadow-inner"
              id="service-search-input"
            />
          </div>
        </div>

        {/* Categories Badges */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-stone-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-300 shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#CD7F6D] text-white shadow-md shadow-[#CD7F6D]/20'
                  : 'bg-white/90 dark:bg-stone-850/90 text-stone-600 dark:text-stone-300 border border-[#ECE0DA] dark:border-stone-800 hover:border-[#CD7F6D]/40 hover:bg-[#FAF1EC]/60 hover:text-[#CD7F6D] luxury-btn-glow'
              }`}
              id={`cat-btn-${cat.toLowerCase().replace(/\s/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          const serviceImgUrl = getServiceImageUrl(service.id, service.name, service.category);
          
          return (
            <div
              key={service.id}
              className={`shimmer-sweep luxury-card-lift bg-white dark:bg-stone-900 border overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-sage ring-1 ring-sage/30 shadow-[0_16px_36px_-10px_rgba(138,154,91,0.1)]'
                  : 'border-[#EAE2D5] dark:border-stone-800'
              }`}
              style={{ contentVisibility: 'auto' }}
              onMouseEnter={() => setHoveredServiceId(service.id)}
              onMouseLeave={() => setHoveredServiceId(null)}
              id={`service-card-${service.id}`}
            >
              <div>
                {/* 2. Image Slow Zoom with hover scaling container */}
                <div className="zoom-img-container h-32 w-full bg-stone-100 dark:bg-stone-950 relative border-b border-[#EAE2D5]/40 dark:border-stone-800/60">
                  <img 
                    src={serviceImgUrl} 
                    alt={service.name} 
                    className="zoom-img w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle luxurious overlay gradient brand blend */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
                  
                  {/* Absolute positioning badges above image */}
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 max-w-[90%]">
                    <span className="bg-white/94 dark:bg-stone-950/94 backdrop-blur-md shadow-sm border border-[#ECE0DA] dark:border-stone-800 text-[9.5px] font-bold text-[#CD7F6D] dark:text-[#E2B79A] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {service.category}
                    </span>
                  </div>

                  {/* Elegant heart icon badge for favorited items */}
                  {favorites.includes(service.id) && (
                    <div className="absolute top-3.5 right-3.5 bg-white/94 dark:bg-stone-950/94 backdrop-blur-md shadow-sm border border-rose-200/50 dark:border-rose-950/45 p-1.5 rounded-full text-rose-500 animate-pulse z-10">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                    </div>
                  )}
                </div>

                <div className="p-5 pb-0 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#FAF1EC]/80 dark:bg-stone-950/60 border border-[#ECE0DA]/70 dark:border-stone-800/80 text-[9.5px] font-mono font-medium text-stone-500 dark:text-stone-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {service.skinType.split(',')[0]}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <h3 className="serif text-[18px] md:text-[20px] font-bold text-[#2C2220] dark:text-stone-50 leading-tight tracking-tight group-hover:text-[#CD7F6D] transition-colors duration-300">
                      {service.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 pt-3 space-y-3.5">
                  <div className="flex items-center gap-4 text-xs font-mono text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-1">
                      <Clock className="luxury-icon-bounce h-3.5 w-3.5 text-stone-450 dark:text-stone-500" />
                      {service.durationMinutes >= 60
                        ? `${Math.floor(service.durationMinutes / 60)}h ${service.durationMinutes % 60 ? (service.durationMinutes % 60) + 'm' : ''}`
                        : `${service.durationMinutes} mins`}
                    </div>
                    <div className="h-3 w-[1px] bg-[#EAE2D5] dark:bg-stone-800" />
                    <div className="text-terracotta dark:text-[#E2B79A] font-sans font-extrabold text-[16px] md:text-[17px] tracking-tight">
                      ₹{service.price}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed font-sans font-normal">
                    {service.benefits[0]}. {service.benefits[1]}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {service.ingredients.slice(0, 3).map((ing, idx) => (
                      <span
                        key={idx}
                        className="bg-[#FAF7F2] dark:bg-stone-955 border border-[#EAE2D5]/80 dark:border-stone-800/80 text-[10px] text-[#2D2D2D]/80 dark:text-stone-400 px-2 py-0.5 rounded-lg font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                    {service.ingredients.length > 3 && (
                      <span className="text-[9px] font-mono text-stone-405 p-0.5">
                        +{service.ingredients.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3 border-t border-[#EAE2D5]/60 dark:border-stone-800/50 mt-2">
                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300 hover:text-sage cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#FAF1EC] dark:hover:bg-stone-800 transition-all duration-300"
                  id={`btn-details-${service.id}`}
                >
                  <Eye className="luxury-icon-bounce h-3.5 w-3.5 text-sage" />
                  Glow Guide
                </button>

                <button
                  type="button"
                  onClick={() => onToggleBookingSelection(service.id)}
                  className={`luxury-btn-glow px-4 py-1.5 rounded-xl text-xs font-bold select-none cursor-pointer ${
                    isSelected
                      ? 'bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-300 border border-sage/40'
                      : 'bg-[#CD7F6D] hover:bg-[#B06351] text-white shadow-sm'
                  }`}
                  id={`btn-addon-${service.id}`}
                >
                  {isSelected ? 'Selected ✓' : 'Book Regimen'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-stone-950 rounded-2xl border border-dashed border-[#ECE0DA] dark:border-stone-800">
          <Sparkles className="h-8 w-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-600 dark:text-stone-300">No treatments found matching your style.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="text-xs font-mono text-sage hover:underline mt-2"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
