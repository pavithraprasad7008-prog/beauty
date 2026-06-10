import React from 'react';
import { THEME_PRESETS, ThemePreset } from '../utils/themePresets';
import { Check, Paintbrush, X, Sparkles, Layers } from 'lucide-react';

interface ThemeSelectorProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentThemeId,
  onSelectTheme,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="theme-selector-panel">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-all duration-500 ease-in-out">
          <div className="h-full flex flex-col bg-[#FCF8F5] dark:bg-stone-900 shadow-2xl border-l border-[#ECE0DA] dark:border-stone-800">
            {/* Header */}
            <div className="px-6 py-5 bg-[#FAF1EC] dark:bg-stone-950 border-b border-[#ECE0DA] dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4.5 w-4.5 text-sage animate-pulse" />
                <div>
                  <h3 className="serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    Prestige Theme Atelier
                  </h3>
                  <p className="text-[10px] font-mono tracking-wider uppercase text-stone-400">
                    Aura Beauty Therapeutics
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-[#ECE0DA] dark:hover:bg-stone-850 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                aria-label="Close theme atelier"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Explanatory introduction */}
            <div className="p-6 bg-sage/5 border-b border-sage/10 space-y-2">
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                Welcome to the <strong>Interactive Design Lounge</strong>. Select any premium, hand-crafted aesthetic pairing below to instantly transform the entire application's mood, menus, buttons, and visual glows.
              </p>
              <div className="p-2.5 bg-white/70 dark:bg-stone-950/40 rounded-xl border border-sage/15 flex items-center gap-2 text-[10.5px] text-stone-500 dark:text-stone-400 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-sage shrink-0" />
                <span>Zero-code, automatic palette mutation.</span>
              </div>
            </div>

            {/* Scrollable Theme presets lists */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {THEME_PRESETS.map((preset) => {
                const isActive = preset.id === currentThemeId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectTheme(preset.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 text-stone-800 dark:text-stone-200 flex flex-col gap-2.5 relative cursor-pointer relative group overflow-hidden ${
                      isActive 
                        ? 'bg-white dark:bg-stone-950 border-sage shadow-md ring-1 ring-sage/20' 
                        : 'bg-white/60 dark:bg-stone-950/30 border-[#ECE0DA] dark:border-stone-800/80 hover:border-sage/40 hover:bg-white dark:hover:bg-stone-950'
                    }`}
                  >
                    {/* Tiny active marker */}
                    {isActive && (
                      <span className="absolute top-4 right-4 bg-sage text-white p-0.5 rounded-full z-10 animate-scaleIn">
                        <Check className="h-3 w-3" />
                      </span>
                    )}

                    {/* Left border indicator highlighting themes accent */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300"
                      style={{ backgroundColor: preset.primaryColor }}
                    />

                    <div className="flex items-center gap-3 pl-1">
                      <span className="text-2xl select-none" role="img" aria-label={preset.name}>
                        {preset.icon}
                      </span>
                      <div>
                        <h4 className="serif text-md font-bold tracking-tight text-stone-900 dark:text-stone-50 group-hover:text-sage transition-colors">
                          {preset.name}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-mono tracking-wide line-clamp-1">
                          {preset.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400 pl-1">
                      {preset.description}
                    </p>

                    {/* Color swatches preview pipeline */}
                    <div className="flex items-center gap-1.5 pt-1.5 pl-1 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest mr-1.5">
                        Palette Preview:
                      </span>
                      <div className="flex -space-x-1">
                        <div 
                          className="h-4.5 w-4.5 rounded-full border border-white dark:border-stone-900 shadow-xs" 
                          style={{ backgroundColor: preset.variables['--theme-sand'] }} 
                          title="Base Sand Background"
                        />
                        <div 
                          className="h-4.5 w-4.5 rounded-full border border-white dark:border-stone-900 shadow-xs" 
                          style={{ backgroundColor: preset.variables['--theme-sage'] }} 
                          title="Accent Tone"
                        />
                        <div 
                          className="h-4.5 w-4.5 rounded-full border border-white dark:border-stone-900 shadow-xs" 
                          style={{ backgroundColor: preset.variables['--theme-terracotta'] }} 
                          title="Focus Highlight"
                        />
                        <div 
                          className="h-4.5 w-4.5 rounded-full border border-white dark:border-stone-900 shadow-xs" 
                          style={{ backgroundColor: preset.variables['--theme-ink'] }} 
                          title="Ink Contrast Text"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom confirmation footer layout */}
            <div className="p-6 bg-[#FAF1EC] dark:bg-stone-950 border-t border-[#ECE0DA] dark:border-stone-800 space-y-3.5">
              <button
                onClick={onClose}
                className="w-full bg-sage hover:bg-sage-600 text-white font-mono text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all text-center tracking-widest uppercase cursor-pointer"
              >
                Apply Atelier Setup
              </button>
              <p className="text-[9px] text-stone-400 dark:text-stone-500 text-center font-mono uppercase tracking-wider leading-relaxed">
                Aura Clinical therapeutics • Active Session Persistent Memory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
