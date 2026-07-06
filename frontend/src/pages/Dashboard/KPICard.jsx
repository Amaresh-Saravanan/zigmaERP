import React from 'react';
import useCountUp from '../../hooks/useCountUp';

// accent map — matches the icon coloring in Dashboard.jsx
const ACCENT = {
  'text-muted':    { bg: 'rgba(139,148,158,0.12)', color: '#8b949e', border: '#8b949e' },
  'text-success':  { bg: 'rgba(37,169,107,0.12)',  color: '#25a96b', border: '#25a96b' },
  'text-primary':  { bg: 'rgba(37,169,107,0.12)',  color: '#25a96b', border: '#25a96b' },
  'text-info':     { bg: 'rgba(41,182,246,0.12)',  color: '#29b6f6', border: '#29b6f6' },
  'text-warning':  { bg: 'rgba(247,184,75,0.12)',  color: '#f7b84b', border: '#f7b84b' },
  'text-danger':   { bg: 'rgba(240,101,72,0.12)',  color: '#f06548', border: '#f06548' },
};

export default function KPICard({ title, value, unit, icon, colorClass, onClick }) {
  const accent = ACCENT[colorClass] ?? ACCENT['text-muted'];
  const animatedValue = useCountUp(value || 0, 1500);

  // Format value to 1 decimal place if it's not an integer
  const displayValue = Number.isInteger(parseFloat(value)) 
    ? Math.round(animatedValue) 
    : animatedValue.toFixed(1);

  return (
    <div className="col">
      <div
        className="py-3 px-3 h-100 border-end kpi-card"
        style={{ cursor: onClick ? 'pointer' : 'default', borderLeft: `3px solid ${accent.border}` }}
        onClick={onClick}
      >
        <div className="d-flex align-items-start justify-content-between mb-2">
          <h6
            className="text-uppercase mb-0 fw-semibold"
            style={{ fontSize: '0.68rem', letterSpacing: '0.06em', color: 'var(--vz-secondary-color)' }}
          >
            {title}
          </h6>
          <span
            className="d-flex align-items-center justify-content-center rounded"
            style={{
              width: 32, height: 32,
              background: accent.bg,
              color: accent.color,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            <i className={icon}></i>
          </span>
        </div>

        <h3 className="mb-0 fw-bold" style={{ fontSize: '1.6rem', lineHeight: 1.1, color: 'var(--vz-emphasis-color)' }}>
          {displayValue}
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>{unit}</span>
      </div>
    </div>
  );
}
