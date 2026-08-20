// Appearance control. Flips data-theme on <html> so the dark-mode token
// overrides in styles.css take effect. Persisted to localStorage so a reload
// keeps the viewer's choice. (Density hook kept for future use.)
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Density = 'comfortable' | 'compact';

function read<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}

export function useTheme() {
  // Dark is the default (matches interfaces.dev); light is the opt-in toggle.
  const [theme, setTheme] = useState<Theme>(() => read('ds-theme', 'dark'));
  const [density, setDensity] = useState<Density>(() => read('ds-density', 'comfortable'));

  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'light') el.setAttribute('data-theme', 'light');
    else el.removeAttribute('data-theme');
    try {
      localStorage.setItem('ds-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    const el = document.documentElement;
    if (density === 'compact') el.setAttribute('data-density', 'compact');
    else el.removeAttribute('data-density');
    try {
      localStorage.setItem('ds-density', density);
    } catch {
      /* ignore */
    }
  }, [density]);

  return {
    theme,
    density,
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    toggleDensity: () => setDensity((d) => (d === 'compact' ? 'comfortable' : 'compact')),
  };
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, id?: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(id ?? text);
    window.setTimeout(() => setCopied(null), 1200);
  };
  return { copied, copy };
}
