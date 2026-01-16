import { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';

type Theme = 'dark' | 'light' | 'emerald' | 'ocean';

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: string;
}

const themes: ThemeOption[] = [
  { value: 'dark', label: 'Dark', description: 'Deep purple theme', icon: '🌙' },
  { value: 'light', label: 'Light', description: 'Clean white theme', icon: '☀️' },
  { value: 'emerald', label: 'Emerald', description: 'Forest green theme', icon: '🌿' },
  { value: 'ocean', label: 'Ocean', description: 'Deep blue theme', icon: '🌊' },
];

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'dark';

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'emerald', 'ocean');

    // Add the new theme class (except for dark, which is the default)
    if (newTheme !== 'dark') {
      root.classList.add(newTheme);
    }
  };

  const selectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setIsOpen(false);
  };

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentTheme.icon}</span>
        <Palette className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl">
          <div className="mb-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select Theme
          </div>
          <div className="flex flex-col gap-1">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => selectTheme(t.value)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  theme === t.value
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </div>
                {theme === t.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
