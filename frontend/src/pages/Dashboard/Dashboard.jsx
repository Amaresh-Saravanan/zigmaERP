import React, { useState, useEffect, useCallback } from 'react';
import djangoClient from '../../api/djangoClient';
import KPICard from './KPICard';
import PitStatusChart from './PitStatusChart';
import TrayStatusWidget from './TrayStatusWidget';
import OverallStatusChart from './OverallStatusChart';
import MonthYearPicker from '../../components/MonthYearPicker';

// BSF bioconversion strip — the facility's core performance thesis at a glance
function EfficiencyStrip({ kpi, month }) {
  const waste = parseFloat(kpi.organic_waste) || 0;
  const larvae = parseFloat(kpi.larvae_harvested) || 0;
  const manure = parseFloat(kpi.manure) || 0;
  const rate = waste > 0 ? ((larvae / waste) * 100).toFixed(1) : null;

  const statStyle = {
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '0 20px',
    borderLeft: '1px solid var(--vz-border-color)',
  };
  const labelStyle = {
    fontSize: '0.68rem',
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--vz-secondary-color)',
  };
  const valueStyle = {
    fontSize: '1.25rem', fontVariantNumeric: 'tabular-nums',
    fontWeight: 700, color: 'var(--vz-emphasis-color)', lineHeight: 1,
  };
  // was --vz-tertiary-color (~3.5:1, fails AA) — bumped to secondary (~4.6:1) and sized up from 0.6rem
  const unitStyle = { fontSize: '0.7rem', color: 'var(--vz-secondary-color)', marginTop: 2 };

  return (
    <div
      className="mb-4"
      style={{
        display: 'flex', alignItems: 'stretch', flexWrap: 'wrap', gap: 0,
        background: 'var(--vz-secondary-bg)',
        border: '1px solid var(--vz-border-color)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Hero: bioconversion rate */}
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 160 }}>
        <div style={labelStyle}>Bioconversion Rate</div>
        <div style={{ fontSize: '2.6rem', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: rate ? 'var(--primary-green)' : 'var(--vz-secondary-color)', lineHeight: 1.05 }}>
          {rate ? `${rate}%` : '—'}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--vz-secondary-color)', marginTop: 4 }}>
          organic waste → larvae · {month}
        </div>
      </div>

      {/* Supporting flux metrics */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', flex: 1, padding: '14px 4px' }}>
        <div className="efficiency-stat" style={statStyle}>
          <span style={labelStyle}>Organic Input</span>
          <span style={valueStyle}>{waste ?? '—'}</span>
          <span style={unitStyle}>Metric-Tons</span>
        </div>
        <div className="efficiency-stat" style={statStyle}>
          <span style={labelStyle}>Larvae Output</span>
          <span style={valueStyle}>{larvae ?? '—'}</span>
          <span style={unitStyle}>Metric-Tons</span>
        </div>
        <div className="efficiency-stat" style={statStyle}>
          <span style={labelStyle}>Manure</span>
          <span style={valueStyle}>{manure ?? '—'}</span>
          <span style={unitStyle}>Metric-Tons</span>
        </div>
      </div>
    </div>
  );
}

// Layout-preserving placeholder for the initial load only — refetches (month
// change) keep showing real (dimmed) data instead of tearing down to this.
function DashboardSkeleton() {
  return (
    <>
      <div className="skeleton mb-4" style={{ height: 96, borderRadius: 10 }}></div>
      <div className="row row-cols-xxl-6 row-cols-md-3 row-cols-2 g-3 mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="col" key={i}>
            <div className="skeleton" style={{ height: 104, borderRadius: 8 }}></div>
          </div>
        ))}
      </div>
      <div className="row g-3 mb-3">
        <div className="col-xl-7">
          <div className="skeleton" style={{ height: 350, borderRadius: 8 }}></div>
        </div>
        <div className="col-xl-5">
          <div className="skeleton" style={{ height: 350, borderRadius: 8 }}></div>
        </div>
      </div>
      <div className="skeleton" style={{ height: 320, borderRadius: 8 }}></div>
    </>
  );
}

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const CURRENT_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

export default function Dashboard() {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [data, setData] = useState({
    kpi: {},
    overall: {},
    pit_chart: { categories: [], data: [], feed_qty: [], batch_ids: [] },
    tray_status: [],
    unutilized_trays: 0,
  });
  const [isLoading, setIsLoading] = useState(true); // initial load only
  const [isRefetching, setIsRefetching] = useState(false); // month-change refetch
  const [error, setError] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null); // real fetch-completion time, not render time

  const fetchDashboardData = useCallback(async () => {
    if (hasLoadedOnce) setIsRefetching(true);
    setError(null);
    try {
      const res = await djangoClient.get('/dashboard', { params: { month } });
      if (res.data?.data) {
        setData(res.data.data);
        setLastUpdated(new Date());
      }
      setHasLoadedOnce(true);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setError('Could not load dashboard data.');
      // keep previous data/lastUpdated visible — don't blank the page on a failed refetch
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const [year, monthNum] = month.split('-').map(Number);

  return (
    <div className="container-fluid px-0">
      <div className="row align-items-center mb-3">
        <div className="col">
          <span
            className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
            style={{
              background: 'var(--vz-secondary-bg)',
              border: '1px solid var(--vz-border-color)',
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--vz-secondary-color)',
            }}
          >
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Loading…'}
          </span>
        </div>
        <div className="col-auto">
          <MonthYearPicker value={month} onChange={setMonth} />
        </div>
      </div>

      {error && (
        <div className="alert d-flex align-items-center justify-content-between mb-3" role="alert" style={{ background: 'rgba(240,101,72,0.1)', border: '1px solid rgba(240,101,72,0.35)', color: 'var(--vz-emphasis-color)' }}>
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-danger" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div style={{ opacity: isRefetching ? 0.5 : 1, transition: 'opacity var(--anim-duration-normal, 200ms) var(--anim-ease-out, ease)' }}>
          <EfficiencyStrip kpi={data.kpi} month={month} />

          <div className="card crm-widget mb-4">
            <div className="card-body p-0">
              <div className="row row-cols-xxl-6 row-cols-md-3 row-cols-2 g-0">
                {[
                  { title: 'Inward', value: data.kpi.inward, unit: 'Metric-Tons', icon: 'ri-truck-line', colorClass: 'inward', key: 'inward' },
                  { title: 'Inward Rejects', value: data.kpi.inward_rejects, unit: 'Metric-Tons', icon: 'ri-close-circle-line', colorClass: 'inward-rejects', key: 'inward-rejects' },
                  { title: 'Organic Waste in Pit', value: data.kpi.organic_waste, unit: 'Metric-Tons', icon: 'ri-leaf-fill', colorClass: 'organic', key: 'organic' },
                  { title: 'Egg Purchasing', value: data.kpi.egg_purchasing, unit: 'Kilo-Gram', icon: 'ri-coins-line', colorClass: 'purchasing', key: 'purchasing' },
                  { title: 'Egg Hatching', value: data.kpi.egg_hatching, unit: 'Kilo-Gram', icon: 'ri-temp-hot-line', colorClass: 'hatching', key: 'hatching' },
                  { title: 'Larvae Harvested', value: data.kpi.larvae_harvested, unit: 'Metric-Tons', icon: 'ri-scales-3-line', colorClass: 'larvae', key: 'larvae' },
                  { title: 'Manure', value: data.kpi.manure, unit: 'Metric-Tons', icon: 'ri-recycle-line', colorClass: 'manure', key: 'manure' },
                  { title: 'Processing Rejects', value: data.kpi.processing_rejects, unit: 'Metric-Tons', icon: 'ri-alert-line', colorClass: 'rejects', key: 'rejects' },
                ].map((kpi, idx) => (
                  <div key={kpi.key} style={{ '--index': idx }}>
                    <KPICard
                      title={kpi.title}
                      value={kpi.value}
                      unit={kpi.unit}
                      icon={kpi.icon}
                      colorClass={kpi.colorClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-xl-7">
              <PitStatusChart data={data.pit_chart} />
            </div>
            <div className="col-xl-5">
              <TrayStatusWidget data={data.tray_status} unutilizedTrays={data.unutilized_trays} />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12">
              <OverallStatusChart data={data.overall} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
