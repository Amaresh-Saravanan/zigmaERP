import React from 'react';
import Chart from 'react-apexcharts';
import useTheme from '../../hooks/useTheme';
import { getChartPalette, getChartColors } from '../../utils/chartTheme';

export default function OverallStatusChart({ data }) {
  const { theme } = useTheme();
  const palette = getChartPalette(theme);
  const colors = getChartColors(theme);

  if (!data) return null;

  const labels = [
    'Inward (mt)',
    'Inward Rejects (mt)',
    'Organic Waste (mt)',
    'Egg Purchasing (kg)',
    'Egg Hatching (kg)',
    'Larvae Harvested (mt)',
    'Manure (mt)',
    'Rejects (mt)'
  ];

  const series = [
    data.inward || 0,
    data.inward_rejects || 0,
    data.organic_waste || 0,
    data.egg_purchasing || 0,
    data.egg_hatching || 0,
    data.larvae_harvested || 0,
    data.manure || 0,
    data.processing_rejects || 0
  ];

  const total = series.reduce((sum, v) => sum + v, 0);

  const options = {
    chart: { type: 'donut', foreColor: palette.foreColor, background: 'transparent' },
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
              show: true,
              label: 'Total',
              fontSize: '0.78rem',
              color: theme === 'light' ? '#000000' : palette.foreColor,
              formatter: () => total.toFixed(1),
            },
            value: {
              fontSize: '1.4rem',
              fontWeight: 700,
              color: theme === 'light' ? '#000000' : palette.dataLabel,
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
                {labels.map((label, i) => (
                  <div className="col" key={i}>
                    <div
                      className="h-100 p-2 px-3 rounded d-flex align-items-center justify-content-between"
                      style={{ background: 'var(--vz-secondary-bg)', borderLeft: `3px solid ${colors[i]}` }}
                    >
                      <span style={{ fontSize: '0.8rem', color: 'var(--vz-emphasis-color)' }}>
                        {label.split(' (')[0]}
                      </span>
                      <span className="fw-semibold" style={{ fontSize: '0.8rem', color: colors[i] }}>
                        {series[i]} {label.split(' ')[label.split(' ').length - 1]}
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
