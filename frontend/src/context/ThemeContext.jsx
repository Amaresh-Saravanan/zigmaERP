import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext(null);

// ponytail: single source of truth for the theme key so the pre-mount script
// in index.html and this provider stay in sync (avoids a flash on first paint).
export const THEME_STORAGE_KEY = 'zigfly-theme';

const LIGHT = 'light';
const DARK = 'dark';

/**
 * Apply Velzon's theme data-attributes to <html>. The bundled app.min.css ships
 * full styling for [data-bs-theme=dark], [data-sidebar=dark] and [data-topbar=dark],
 * so toggling all three keeps the chrome (topbar + sidebar + content) consistent.
 */
function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === DARK;
  root.setAttribute('data-bs-theme', isDark ? DARK : LIGHT);
  root.setAttribute('data-sidebar', isDark ? DARK : LIGHT);
  root.setAttribute('data-topbar', isDark ? DARK : LIGHT);
  // Expose the chosen mode for our own CSS hooks (login page, charts, etc.)
  root.setAttribute('data-theme-mode', theme);
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === LIGHT || saved === DARK) return saved;
  } catch {
    // localStorage unavailable (private mode / SSR) — fall through to system pref
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return DARK;
  return LIGHT;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Keep <html> attributes + storage in sync whenever the theme changes.
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore persistence failures
    }
  }, [theme]);

  // Follow the OS preference only while the user hasn't made an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => {
      try {
        if (localStorage.getItem(THEME_STORAGE_KEY)) return; // user override wins
      } catch {
        return;
      }
      setThemeState(e.matches ? DARK : LIGHT);
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next === DARK ? DARK : LIGHT);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === DARK ? LIGHT : DARK));
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === DARK, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
