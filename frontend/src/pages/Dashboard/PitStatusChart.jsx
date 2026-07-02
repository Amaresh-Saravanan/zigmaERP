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

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      foreColor: palette.foreColor,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    theme: { mode: theme === 'dark' ? 'dark' : 'light' },
    grid: {
      borderColor: palette.gridBorder,
      strokeDashArray: 3
    },
    plotOptions: {
      bar: { horizontal: true, barHeight: '50%', dataLabels: { position: 'top' } }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const feed = data.feed_qty[opts.dataPointIndex] || 0;
        return `${val} Days - ${feed} Tons`;
      },
      style: { colors: [palette.dataLabel] },
      offsetX: 20
    },
    colors: [colors[0]],
    xaxis: {
      categories: data.categories,
      title: { text: 'Batch Age (days)' }
    },
    yaxis: { title: { text: 'Pit Name' } },
    tooltip: {
      theme: palette.tooltip,
      y: {
        formatter: function (val, opts) {
          const feed = data.feed_qty[opts.dataPointIndex] || 0;
          return `${val} Days (${feed} Tons Feed)`;
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
          <Chart options={options} series={series} type="bar" height={350} />
        )}
      </div>
    </div>
  );
}
