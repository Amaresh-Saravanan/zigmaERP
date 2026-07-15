import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import djangoClient from '../../api/djangoClient';
import useTheme from '../../hooks/useTheme';
import { getChartPalette, getChartColors, getChartAnimations } from '../../utils/chartTheme';

// One renderable line per PitStatus org_status — label, icon, and the detail
// that matters for that stage. Fields are nullable server-side, so every
// detail() guards with ?? fallbacks.
const ORG_STATUS = {
  1: { label: 'Feed added', icon: 'ri-leaf-line', detail: (r) => `${r.feed_qty ?? 0}t organic waste` },
  2: { label: 'Larvae added', icon: 'ri-bug-line', detail: (r) => `${r.larvae_qty_in ?? 0} kg baby larvae` },
  3: { label: 'Aeration', icon: 'ri-windy-line', detail: (r) => r.method || '' },
  4: {
    label: 'Measurement', icon: 'ri-temp-hot-line',
    detail: (r) => `${r.temp_start ?? '—'}–${r.temp_end ?? '—'}°C · ${r.humi_start ?? '—'}–${r.humi_end ?? '—'}% hum`,
  },
  5: { label: 'Harvest', icon: 'ri-scales-3-line', detail: (r) => `${r.larvae_qty ?? 0} kg larvae${r.harvest_comp ? ` · ${r.harvest_comp}` : ''}` },
  6: { label: 'Vibro screen', icon: 'ri-filter-3-line', detail: (r) => `${r.larvae_qty ?? 0} kg larvae` },
  7: { label: 'Tippi', icon: 'ri-archive-line', detail: (r) => `${r.tippi_qty ?? 0} qty` },
};

function ActivityPanel({ pit, onClose }) {
  const [rows, setRows] = useState(null); // null = loading
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(false);
    djangoClient
      .get('/pit-status', { params: { pit: pit.id, page_size: 5 } })
      .then((res) => { if (!cancelled) setRows(res.data?.data?.results || []); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [pit.id]);

  return (
    <div className="pit-activity-panel" style={{ borderTop: '1px solid var(--vz-border-color)', padding: '12px 16px 14px' }}>
      <style>{`
        .pit-activity-panel { animation: pitPanelIn 200ms cubic-bezier(0.22, 1, 0.36, 1); transform-origin: top; }
        @keyframes pitPanelIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .pit-activity-row { animation: pitRowIn 250ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes pitRowIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .pit-activity-panel, .pit-activity-row { animation: none; }
        }
      `}</style>

      <div className="d-flex align-items-center mb-2">
        <h6 className="mb-0 flex-grow-1" style={{ fontSize: '0.82rem' }}>
          {pit.name} — recent activity
        </h6>
        <Link to="/pit_status/list" style={{ fontSize: '0.75rem' }}>View full pit →</Link>
        <button
          type="button"
          className="btn btn-sm p-0 ms-3 border-0"
          aria-label="Close pit activity"
          onClick={onClose}
          style={{ color: 'var(--vz-secondary-color)', lineHeight: 1 }}
        >
          <i className="ri-close-line" style={{ fontSize: '1.1rem' }}></i>
        </button>
      </div>

      {error ? (
        <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Could not load activity for this pit.</p>
      ) : rows === null ? (
        <div className="d-flex flex-column gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 18, borderRadius: 4, width: `${85 - i * 15}%` }}></div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>No recorded activity yet.</p>
      ) : (
        <div className="d-flex flex-column" style={{ gap: 6 }}>
          {rows.map((r, i) => {
            const meta = ORG_STATUS[r.org_status] || { label: 'Update', icon: 'ri-record-circle-line', detail: () => '' };
            return (
              <div
                key={r.unique_id || i}
                className="pit-activity-row d-flex align-items-baseline"
                style={{ fontSize: '0.8rem', gap: 10, animationDelay: `${i * 40}ms` }}
              >
                <span style={{ color: 'var(--vz-secondary-color)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {r.entry_date}
                </span>
                <i className={meta.icon} style={{ color: 'var(--primary-green, #3CB371)' }}></i>
                <span style={{ fontWeight: 600, color: 'var(--vz-emphasis-color)', whiteSpace: 'nowrap' }}>{meta.label}</span>
                <span style={{ color: 'var(--vz-secondary-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {meta.detail(r)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PitStatusChart({ data }) {
  const { theme } = useTheme();
  const palette = getChartPalette(theme);
  const colors = getChartColors(theme);
  const [selected, setSelected] = useState(null); // { index, id, name } | null

  // Month change / refetch rebuilds the category list — stale selection would
  // point at the wrong pit, so close the panel.
  useEffect(() => { setSelected(null); }, [data]);

  if (!data || !data.categories) return null;

  const pitCount = data.categories.length;
  const avgAge = pitCount ? (data.data.reduce((s, v) => s + v, 0) / pitCount).toFixed(1) : 0;
  const totalFeed = (data.feed_qty || []).reduce((s, v) => s + v, 0).toFixed(1);

  // Days is an integer count — force whole-number axis ticks (no 0.2/0.4/0.6).
  // Floor the scale at 12 days so a young farm doesn't render 1-day bars as
  // full-width "mature" bars; +2 headroom keeps the longest bar off the edge
  // instead of the old fixed max of 20 that left half the plot empty.
  const realMaxAge = Math.max(1, ...data.data);
  const axisMax = Math.max(realMaxAge + 2, 12);
  const days = (n) => `${n} Day${n === 1 ? '' : 's'}`;

  const toggleSelect = (index) => {
    setSelected((cur) =>
      cur && cur.index === index
        ? null
        : { index, id: (data.pit_ids || [])[index], name: data.categories[index] }
    );
  };

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      background: 'transparent',
      foreColor: palette.foreColor,
      fontFamily: 'inherit',
      // Glanceable dashboard widget — the per-chart export toolbar just adds clutter.
      toolbar: { show: false },
      animations: getChartAnimations(500),
      events: {
        dataPointSelection: (event, ctx, config) => toggleSelect(config.dataPointIndex),
        dataPointMouseEnter: (event) => { event.target.style.cursor = 'pointer'; },
      },
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
    states: {
      active: { allowMultipleDataPointsSelection: false, filter: { type: 'darken', value: 0.82 } }
    },
    // Labels ride inside the bar (white, centered) so they can never clip off the
    // plot edge the way end-anchored labels did on full-width bars. Short bars get
    // the compact "1d" form — the full "1 Day · 50t" used to spill past the bar
    // onto the plot background. Zero-age pits get no label.
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        if (!val) return '';
        if (val < axisMax * 0.25) return `${val}d`;
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
          <>
            <Chart key={theme} options={options} series={series} type="bar" height={350} />
            <div className="text-center pb-2" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)', marginTop: -8 }}>
              <i className="ri-cursor-line me-1"></i>Click a bar to see that pit's recent activity
            </div>
            {selected && selected.id && (
              <ActivityPanel key={selected.id} pit={selected} onClose={() => setSelected(null)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
