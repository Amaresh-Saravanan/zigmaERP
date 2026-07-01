// Shared ApexCharts theming so every chart reacts to light/dark consistently.
// Pass the current mode ('light' | 'dark') and deep-merge the result into options.

const PALETTES = {
  light: {
    foreColor: '#878a99',     // axis / label text (Velzon muted)
    gridBorder: '#e9ebec',
    dataLabel: '#333333',
    donutStroke: '#ffffff',   // gap between donut slices = card bg
    tooltip: 'light',
  },
  dark: {
    foreColor: '#adb5bd',
    gridBorder: 'rgba(255, 255, 255, 0.08)',
    dataLabel: '#ced4da',
    donutStroke: '#1a2942',   // card bg in dark mode
    tooltip: 'dark',
  },
};

export function getChartPalette(mode) {
  return PALETTES[mode === 'dark' ? 'dark' : 'light'];
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
