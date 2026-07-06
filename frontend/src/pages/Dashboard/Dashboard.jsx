import React, { useState, useEffect } from 'react';
import djangoClient from '../../api/djangoClient';
import KPICard from './KPICard';
import PitStatusChart from './PitStatusChart';
import TrayStatusWidget from './TrayStatusWidget';
import OverallStatusChart from './OverallStatusChart';

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
    fontSize: '0.6rem', fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--vz-secondary-color)',
  };
  const valueStyle = {
    fontSize: '1.25rem', fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700, color: 'var(--vz-emphasis-color)', lineHeight: 1,
  };
  const unitStyle = { fontSize: '0.6rem', color: 'var(--vz-tertiary-color)', marginTop: 1 };

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
        <div style={{ fontSize: '2.6rem', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: rate ? '#25a96b' : 'var(--vz-secondary-color)', lineHeight: 1.05 }}>
          {rate ? `${rate}%` : '—'}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--vz-secondary-color)', marginTop: 4 }}>
          organic waste → larvae · {month}
        </div>
      </div>

      {/* Supporting flux metrics */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', flex: 1, padding: '14px 4px' }}>
        <div className="efficiency-stat" style={statStyle}>
          <span style={labelStyle}>Organic Input</span>
          <span style={valueStyle}>{waste || '—'}</span>
          <span style={unitStyle}>Metric-Tons</span>
        </div>
        <div className="efficiency-stat" style={statStyle}>
          <span style={labelStyle}>Larvae Output</span>
          <span style={{ ...valueStyle, color: larvae > 0 ? '#25a96b' : 'var(--vz-emphasis-color)' }}>{larvae || '—'}</span>
          <span style={unitStyle}>Metric-Tons</span>
        </div>
        <div className="efficiency-stat" style={statStyle}>
          <span style={labelStyle}>Manure</span>
          <span style={valueStyle}>{manure || '—'}</span>
          <span style={unitStyle}>Metric-Tons</span>
        </div>
      </div>
    </div>
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [month]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get('/dashboard', { params: { month } });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ponytail: legacy PHP drill-down removed; will be a React page in future
  const openDrillDown = () => {};

  const syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [year, monthNum] = month.split('-').map(Number);
  const monthStart = new Date(year, monthNum - 1, 1);
  const monthEnd = new Date(year, monthNum, 0);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const rangeLabel = `${fmt(monthStart)} — ${fmt(monthEnd)}`;

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
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#25a96b',
            }}
          >
            <span
              style={{
                width: 7, height: 7, borderRadius: '50%', background: '#25a96b',
                display: 'inline-block', boxShadow: '0 0 0 3px rgba(37,169,107,0.18)',
              }}
            ></span>
            Live · Last Sync {syncTime}
          </span>
        </div>
        <div className="col-auto">
          <label
            className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill position-relative"
            style={{
              background: 'var(--vz-secondary-bg)',
              border: '1px solid var(--vz-border-color)',
              cursor: 'pointer',
            }}
          >
            <i className="ri-calendar-line" style={{ fontSize: '0.9rem', color: 'var(--vz-secondary-color)' }}></i>
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--vz-emphasis-color)' }}>
              {rangeLabel}
            </span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <EfficiencyStrip kpi={data.kpi} month={month} />

          <div className="card crm-widget mb-4">
            <div className="card-body p-0">
              <div className="row row-cols-xxl-6 row-cols-md-3 row-cols-2 g-0">
                {[
                  { title: 'Inward', value: data.kpi.inward, unit: 'Metric-Tons', icon: 'ri-truck-line', colorClass: 'text-info', key: 'inward' },
                  { title: 'Inward Rejects', value: data.kpi.inward_rejects, unit: 'Metric-Tons', icon: 'ri-close-circle-line', colorClass: 'text-warning', key: 'inward-rejects' },
                  { title: 'Organic Waste in Pit', value: data.kpi.organic_waste, unit: 'Metric-Tons', icon: 'ri-leaf-fill', colorClass: 'text-success', key: 'organic' },
                  { title: 'Egg Purchasing', value: data.kpi.egg_purchasing, unit: 'Kilo-Gram', icon: 'ri-coins-line', colorClass: 'text-primary', key: 'purchasing' },
                  { title: 'Egg Hatching', value: data.kpi.egg_hatching, unit: 'Kilo-Gram', icon: 'ri-temp-hot-line', colorClass: 'text-warning', key: 'hatching' },
                  { title: 'Larvae Harvested', value: data.kpi.larvae_harvested, unit: 'Metric-Tons', icon: 'ri-scales-3-line', colorClass: 'text-success', key: 'larvae' },
                  { title: 'Manure', value: data.kpi.manure, unit: 'Metric-Tons', icon: 'ri-recycle-line', colorClass: 'text-info', key: 'manure' },
                  { title: 'Processing Rejects', value: data.kpi.processing_rejects, unit: 'Metric-Tons', icon: 'ri-alert-line', colorClass: 'text-danger', key: 'rejects' },
                ].map((kpi, idx) => (
                  <div key={kpi.key} style={{ '--index': idx }}>
                    <KPICard
                      title={kpi.title}
                      value={kpi.value}
                      unit={kpi.unit}
                      icon={kpi.icon}
                      colorClass={kpi.colorClass}
                      onClick={() => openDrillDown(kpi.key)}
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
        </>
      )}
    </div>
  );
}
