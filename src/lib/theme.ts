import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'emerald' | 'ocean';

export interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: string;
}

export const themes: ThemeOption[] = [
  { value: 'dark', label: 'Dark', description: 'Deep purple theme', icon: '🌙' },
  { value: 'light', label: 'Light', description: 'Clean white theme', icon: '☀️' },
  { value: 'emerald', label: 'Emerald', description: 'Forest green theme', icon: '🌿' },
  { value: 'ocean', label: 'Ocean', description: 'Deep blue theme', icon: '🌊' },
];

export function applyTheme(newTheme: Theme) {
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove('light', 'emerald', 'ocean');

  // Add the new theme class (except for dark, which is the default)
  if (newTheme !== 'dark') {
    root.classList.add(newTheme);
  }
}

/**
 * Shared theme state. Mounted in more than one place (header dropdown on
 * desktop, mobile menu on small screens), so instances sync via a storage
 * listener rather than each holding an independent copy.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'dark';

    setTheme(initialTheme);
    applyTheme(initialTheme);

    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Theme>).detail;
      if (next) setTheme(next);
    };

    window.addEventListener('themechange', onChange);
    return () => window.removeEventListener('themechange', onChange);
  }, []);

  const selectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: newTheme }));
  };

  return { theme, selectTheme };
}
