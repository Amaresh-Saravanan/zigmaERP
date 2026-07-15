import React from 'react';
import Chart from 'react-apexcharts';
import useTheme from '../../hooks/useTheme';
import { getChartPalette, getChartColors, getChartAnimations } from '../../utils/chartTheme';

// Metrics carry their own unit explicitly — no fragile "(mt)" string-splitting.
const METRICS = [
  { key: 'inward', label: 'Inward', unit: 'mt' },
  { key: 'inward_rejects', label: 'Inward Rejects', unit: 'mt' },
  { key: 'organic_waste', label: 'Organic Waste', unit: 'mt' },
  { key: 'egg_purchasing', label: 'Egg Purchasing', unit: 'kg' },
  { key: 'egg_hatching', label: 'Egg Hatching', unit: 'kg' },
  { key: 'larvae_harvested', label: 'Larvae Harvested', unit: 'mt' },
  { key: 'manure', label: 'Manure', unit: 'mt' },
  { key: 'processing_rejects', label: 'Rejects', unit: 'mt' },
];

export default function OverallStatusChart({ data }) {
  const { theme } = useTheme();
  const palette = getChartPalette(theme);
  const colors = getChartColors(theme);

  if (!data) return null;

  const labels = METRICS.map(m => `${m.label} (${m.unit})`);
  const series = METRICS.map(m => data[m.key] || 0);

  // mt and kg are different units of different materials — summing them into
  // one "Total" is meaningless. Keep `total` for the empty-state check only;
  // show per-unit subtotals in the donut center instead.
  const total = series.reduce((sum, v) => sum + v, 0);
  const subtotals = METRICS.reduce((acc, m, i) => {
    acc[m.unit] = (acc[m.unit] || 0) + series[i];
    return acc;
  }, {});
  const subtotalText = Object.entries(subtotals)
    .filter(([, v]) => v > 0)
    .map(([unit, v]) => `${v.toFixed(1)} ${unit}`)
    .join(' · ');

  const options = {
    chart: { type: 'donut', foreColor: palette.foreColor, background: 'transparent', animations: getChartAnimations(), fontFamily: 'Segoe UI, system-ui, sans-serif' },
    theme: { mode: theme === 'dark' ? 'dark' : 'light' },
    labels: labels,
    colors: colors,
    legend: { show: false },
    stroke: { width: 2, colors: [palette.donutStroke] },
    tooltip: { theme: palette.tooltip },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: false,
              label: 'Total',
              fontSize: '0.7rem',
              color: palette.foreColor,
              // mt and kg can't be summed into one number — show per-unit subtotals instead.
              formatter: () => subtotalText || '0',
            },
            value: {
              fontSize: '1.4rem',
              fontWeight: 700,
              color: palette.dataLabel,
            },
          },
        },
      },
    },
  };

  return (
    <div className="card card-height-100">
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Overall Status</h4>
      </div>
      <div className="card-body">
        {total === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 280 }}>
            <i className="ri-pie-chart-line" style={{ fontSize: '2rem', color: 'var(--vz-secondary-color)' }}></i>
            <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.85rem' }}>No activity recorded for this period</p>
          </div>
        ) : (
          <div className="row align-items-center g-3">
            <div className="col-md-5 d-flex justify-content-center">
              <Chart key={theme} options={options} series={series} type="donut" height={280} width={280} />
            </div>
            <div className="col-md-7">
              <div className="row row-cols-1 row-cols-sm-2 g-2">
                {METRICS.map((m, i) => (
                  <div className="col" key={m.key}>
                    <div
                      className="h-100 p-2 px-3 rounded d-flex align-items-center justify-content-between"
                      style={{ background: 'var(--vz-secondary-bg)', border: '1px solid var(--vz-border-color)' }}
                    >
                      <span className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--vz-emphasis-color)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i], flexShrink: 0 }}></span>
                        {m.label}
                      </span>
                      <span className="fw-semibold" style={{ fontSize: '0.8rem', color: 'var(--vz-emphasis-color)' }}>
                        {series[i]} {m.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
