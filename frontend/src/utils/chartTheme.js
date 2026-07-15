// Shared ApexCharts theming so every chart reacts to light/dark consistently.
// Pass the current mode ('light' | 'dark') and deep-merge the result into options.

const PALETTES = {
  light: {
    foreColor: '#878a99',
    gridBorder: '#e9ebec',
    dataLabel: '#333333',
    donutStroke: '#ffffff',
    tooltip: 'light',
  },
  dark: {
    foreColor: '#6e7681',
    gridBorder: '#21262d',
    dataLabel: '#c9d1d9',
    donutStroke: '#161b22',
    tooltip: 'dark',
  },
};

// Sequential ramp off the brand green + neutrals — the One Signal Rule means
// green stays the only saturated hue; other series step through neutral tints
// rather than introducing a second accent (no purple, no second green).
// ponytail: Apex needs literal color values, not CSS custom properties, so these
// stay as hex — chartTheme.js is the sanctioned exception to the "consume var(),
// don't hardcode hex" rule elsewhere in the dashboard.
const COLOR_PALETTES = {
  light: ['#3CB371', '#CC5500', '#50C878', '#DAA520', '#FFBF00', '#008080', '#808000', '#DC143C'],
  dark:  ['#3CB371', '#CC5500', '#50C878', '#DAA520', '#FFBF00', '#008080', '#808000', '#DC143C'],
};

export function getChartPalette(mode) {
  return PALETTES[mode === 'dark' ? 'dark' : 'light'];
}

export function getChartColors(mode) {
  return COLOR_PALETTES[mode === 'dark' ? 'dark' : 'light'];
}

// Respect OS-level reduced-motion preference for chart transitions/animations.
export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Chart-level animation config — spread into `chart: {...}` on every chart.
export function getChartAnimations(speed = 500) {
  return prefersReducedMotion()
    ? { enabled: false }
    : { enabled: true, easing: 'easeinout', speed };
}

/**
 * Base option fragment shared by all charts. Merge first, then layer
 * chart-specific options on top.
 */
export function baseChartOptions(mode) {
  const p = getChartPalette(mode);
  return {
    chart: { foreColor: p.foreColor, animations: getChartAnimations() },
    theme: { mode: mode === 'dark' ? 'dark' : 'light' },
    grid: { borderColor: p.gridBorder },
    tooltip: { theme: p.tooltip },
  };
}
