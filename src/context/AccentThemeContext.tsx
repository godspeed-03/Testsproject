'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccentTheme = 
  | 'neon-red' 
  | 'neon-green' 
  | 'neon-blue' 
  | 'neon-purple' 
  | 'neon-pink' 
  | 'neon-orange' 
  | 'neon-yellow' 
  | 'neon-teal';

export interface ThemeOption {
  id: AccentTheme;
  name: string;
  colorHex: string;
  colorGlow: string;
  lightHex: string;
  lightGlow: string;
  darkHex: string;
  darkGlow: string;
  darkTextInDark?: boolean;
}

// Curated OKLCH-Calibrated Palettes for High WCAG Contrast & Perceptual Uniformity
export const ThemeOptionList: ThemeOption[] = [
  {
    id: 'neon-red',
    name: 'Cyber Crimson',
    colorHex: '#FF2A5F',
    colorGlow: 'rgba(255, 42, 95, 0.45)',
    lightHex: '#DC2626',
    lightGlow: 'rgba(220, 38, 38, 0.25)',
    darkHex: '#FF2A5F',
    darkGlow: 'rgba(255, 42, 95, 0.45)',
  },
  {
    id: 'neon-green',
    name: 'Toxic Emerald',
    colorHex: '#10B981',
    colorGlow: 'rgba(16, 185, 129, 0.45)',
    lightHex: '#15803D',
    lightGlow: 'rgba(21, 128, 61, 0.25)',
    darkHex: '#10B981',
    darkGlow: 'rgba(16, 185, 129, 0.45)',
  },
  {
    id: 'neon-blue',
    name: 'Hyper Sapphire',
    colorHex: '#0EA5E9',
    colorGlow: 'rgba(14, 165, 233, 0.45)',
    lightHex: '#2563EB',
    lightGlow: 'rgba(37, 99, 235, 0.25)',
    darkHex: '#0EA5E9',
    darkGlow: 'rgba(14, 165, 233, 0.45)',
  },
  {
    id: 'neon-purple',
    name: 'Electric Violet',
    colorHex: '#A855F7',
    colorGlow: 'rgba(168, 85, 247, 0.45)',
    lightHex: '#6D28D9',
    lightGlow: 'rgba(109, 40, 217, 0.25)',
    darkHex: '#A855F7',
    darkGlow: 'rgba(168, 85, 247, 0.45)',
  },
  {
    id: 'neon-pink',
    name: 'Hot Magenta',
    colorHex: '#EC4899',
    colorGlow: 'rgba(236, 72, 153, 0.45)',
    lightHex: '#BE185D',
    lightGlow: 'rgba(190, 24, 93, 0.25)',
    darkHex: '#EC4899',
    darkGlow: 'rgba(236, 72, 153, 0.45)',
  },
  {
    id: 'neon-orange',
    name: 'Solar Flare',
    colorHex: '#F97316',
    colorGlow: 'rgba(249, 115, 22, 0.45)',
    lightHex: '#C2410C',
    lightGlow: 'rgba(194, 65, 12, 0.25)',
    darkHex: '#F97316',
    darkGlow: 'rgba(249, 115, 22, 0.45)',
  },
  {
    id: 'neon-yellow',
    name: 'Laser Gold',
    colorHex: '#EAB308',
    colorGlow: 'rgba(234, 179, 8, 0.45)',
    lightHex: '#B45309',
    lightGlow: 'rgba(180, 83, 9, 0.25)',
    darkHex: '#EAB308',
    darkGlow: 'rgba(234, 179, 8, 0.45)',
    darkTextInDark: true,
  },
  {
    id: 'neon-teal',
    name: 'Matrix Teal',
    colorHex: '#14B8A6',
    colorGlow: 'rgba(20, 184, 166, 0.45)',
    lightHex: '#0F766E',
    lightGlow: 'rgba(15, 118, 110, 0.25)',
    darkHex: '#14B8A6',
    darkGlow: 'rgba(20, 184, 166, 0.45)',
  },
];

interface AccentThemeContextType {
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  themes: ThemeOption[];
}

const AccentThemeContext = createContext<AccentThemeContextType>({
  accentTheme: 'neon-teal',
  setAccentTheme: () => {},
  themes: ThemeOptionList
});

const updateMetaThemeColor = (themeId: AccentTheme) => {
  if (typeof document === 'undefined') return;
  const isDark = document.documentElement.classList.contains('dark');
  const themeObj = ThemeOptionList.find((t) => t.id === themeId);
  const headerColor = isDark 
    ? (themeObj?.darkHex || themeObj?.colorHex || '#10B981')
    : (themeObj?.lightHex || themeObj?.colorHex || '#10B981');

  const metaTags = document.querySelectorAll('meta[name="theme-color"]');
  if (metaTags.length > 0) {
    metaTags.forEach((meta) => {
      meta.removeAttribute('media');
      meta.setAttribute('content', headerColor);
    });
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', headerColor);
    document.head.appendChild(meta);
  }
};

export const AccentThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>('neon-teal');

  const applyThemeToDocument = (themeId: AccentTheme) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Remove existing theme classes
    Array.from(root.classList).forEach((cls) => {
      if (cls.startsWith('theme-neon-') || cls.startsWith('theme-')) {
        root.classList.remove(cls);
      }
    });

    const themeClass = `theme-${themeId}`;
    root.classList.add(themeClass);
    root.setAttribute('data-accent-theme', themeId);

    // Update meta theme color without triggering infinite loop
    updateMetaThemeColor(themeId);
  };

  useEffect(() => {
    const saved = localStorage.getItem('upsc_tracker_accent_theme') as AccentTheme;
    const activeTheme = (saved && ThemeOptionList.some((t) => t.id === saved)) ? saved : 'neon-teal';
    setAccentThemeState(activeTheme);
    applyThemeToDocument(activeTheme);

    // Observe dark mode toggle (class attribute changes on root) without infinite loop
    const observer = new MutationObserver((mutations) => {
      const isClassChange = mutations.some((m) => m.attributeName === 'class');
      if (isClassChange) {
        const currentSaved = (localStorage.getItem('upsc_tracker_accent_theme') as AccentTheme) || 'neon-teal';
        updateMetaThemeColor(currentSaved);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const setAccentTheme = (theme: AccentTheme) => {
    setAccentThemeState(theme);
    localStorage.setItem('upsc_tracker_accent_theme', theme);
    applyThemeToDocument(theme);
  };

  return (
    <AccentThemeContext.Provider value={{ accentTheme, setAccentTheme, themes: ThemeOptionList }}>
      {children}
    </AccentThemeContext.Provider>
  );
};

export const useAccentTheme = () => useContext(AccentThemeContext);
