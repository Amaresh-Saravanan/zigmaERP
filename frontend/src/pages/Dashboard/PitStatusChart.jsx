import React from 'react';
import Chart from 'react-apexcharts';
import useTheme from '../../hooks/useTheme';
import { getChartPalette, getChartColors } from '../../utils/chartTheme';

export default function PitStatusChart({ data }) {
  const { theme } = useTheme();
  const palette = getChartPalette(theme);
  const colors = getChartColors(theme);

  if (!data || !data.categories) return null;

  const pitCount = data.categories.length;
  const avgAge = pitCount ? (data.data.reduce((s, v) => s + v, 0) / pitCount).toFixed(1) : 0;
  const totalFeed = (data.feed_qty || []).reduce((s, v) => s + v, 0).toFixed(1);

  // Days is an integer count — force whole-number axis ticks (no 0.2/0.4/0.6).
  // Floor the scale at 5 days: with a real max of 1, the axis has nowhere to put a
  // tick between 0 and 1 (looks broken/empty) and a 1-day batch renders as a
  // full-width bar, which reads as "mature" when it's actually brand new.
  const realMaxAge = Math.max(1, ...data.data);
  const axisMax = Math.max(realMaxAge, 20);
  const days = (n) => `${n} Day${n === 1 ? '' : 's'}`;

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      background: 'transparent',
      foreColor: palette.foreColor,
      fontFamily: 'inherit',
      // Glanceable dashboard widget — the per-chart export toolbar just adds clutter.
      toolbar: { show: false },
      animations: { easing: 'easeinout', speed: 500 }
    },
    theme: { mode: theme === 'dark' ? 'dark' : 'light' },
    grid: {
      borderColor: palette.gridBorder,
      strokeDashArray: 3,
      padding: { left: 8, right: 8 }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '58%',
        borderRadius: 4,
        borderRadiusApplication: 'end'
      }
    },
    // Labels ride inside the bar (white, centered) so they can never clip off the
    // plot edge the way end-anchored labels did on full-width bars. Zero-age pits
    // get no label — an empty bar reads as "just started" on its own.
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        if (!val) return '';
        const feed = data.feed_qty[opts.dataPointIndex] || 0;
        return `${days(val)}  ·  ${feed}t`;
      },
      style: { colors: ['#ffffff'], fontSize: '12px', fontWeight: 600 },
      dropShadow: { enabled: true, top: 0, left: 0, blur: 2, opacity: 0.25 }
    },
    colors: [colors[0]],
    xaxis: {
      categories: data.categories,
      title: { text: 'Batch Age (days)', style: { fontWeight: 500 } },
      min: 0,
      max: axisMax,
      tickAmount: Math.min(axisMax, 6),
      labels: { formatter: (v) => `${Math.round(v)}` }
    },
    yaxis: { labels: { style: { fontSize: '12px' } } },
    tooltip: {
      theme: palette.tooltip,
      y: {
        formatter: function (val, opts) {
          const feed = data.feed_qty[opts.dataPointIndex] || 0;
          return `${days(val)} · ${feed}t feed`;
        }
      }
    }
  };

  const series = [{ name: 'Batch Age', data: data.data }];

  return (
    <div className="card card-big">
      <div className="card-header align-items-center d-flex flex-wrap gap-2">
        <h4 className="card-title mb-0 flex-grow-1">Pit Status</h4>
        <div className="d-flex gap-3">
          <span style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)' }}>
            Pits <strong style={{ color: 'var(--vz-emphasis-color)' }}>{pitCount}</strong>
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)' }}>
            Avg Age <strong style={{ color: 'var(--vz-emphasis-color)' }}>{avgAge}d</strong>
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)' }}>
            Feed <strong style={{ color: 'var(--vz-emphasis-color)' }}>{totalFeed}t</strong>
          </span>
        </div>
      </div>
      <div className="card-body p-0">
        {pitCount === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 300 }}>
            <i className="ri-inbox-line" style={{ fontSize: '2rem', color: 'var(--vz-secondary-color)' }}></i>
            <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.85rem' }}>No active pits for this period</p>
          </div>
        ) : (
          <Chart key={theme} options={options} series={series} type="bar" height={350} />
        )}
      </div>
    </div>
  );
}
