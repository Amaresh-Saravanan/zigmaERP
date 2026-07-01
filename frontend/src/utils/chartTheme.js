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

// Consistent color palettes aligned with Zigfly green theme
const COLOR_PALETTES = {
  light: ['#25a96b', '#29b6f6', '#f7b84b', '#f06548', '#8b949e', '#e6edf3', '#66bb6a', '#ab47bc'],
  dark: ['#25a96b', '#29b6f6', '#f7b84b', '#f06548', '#6e7681', '#c9d1d9', '#66bb6a', '#ab47bc'],
};

export function getChartPalette(mode) {
  return PALETTES[mode === 'dark' ? 'dark' : 'light'];
}

export function getChartColors(mode) {
  return COLOR_PALETTES[mode === 'dark' ? 'dark' : 'light'];
}

/**
 * Base option fragment shared by all charts. Merge first, then layer
 * chart-specific options on top.
 */
export function baseChartOptions(mode) {
  const p = getChartPalette(mode);
  return {
    chart: { foreColor: p.foreColor },
    theme: { mode: mode === 'dark' ? 'dark' : 'light' },
    grid: { borderColor: p.gridBorder },
    tooltip: { theme: p.tooltip },
  };
}
