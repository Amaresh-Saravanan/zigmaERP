import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Safe no-op fallback so components remain renderable in isolation (e.g. unit
// tests) without a ThemeProvider — mirrors useAuth, which also never throws.
const FALLBACK = {
  theme: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
};

export default function useTheme() {
  return useContext(ThemeContext) ?? FALLBACK;
}
