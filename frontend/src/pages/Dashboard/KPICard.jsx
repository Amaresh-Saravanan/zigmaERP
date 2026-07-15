import React from 'react';
import useCountUp from '../../hooks/useCountUp';

// Tiles are neutral by default — the One Signal Rule reserves green for
// active/correct/primary (the bioconversion hero), not per-topic tinting.
// Only the danger tile (rejects) keeps a semantic color, since coral is
// reserved for errors/negative states, which "Processing Rejects" is.
const ACCENT = {
  inward:      { bg: 'rgba(70,130,180,0.12)',  color: '#4682B4' },
  'inward-rejects': { bg: 'rgba(204,85,0,0.12)',   color: '#CC5500' },
  organic:     { bg: 'rgba(34,139,34,0.12)',   color: '#228B22' },
  purchasing:  { bg: 'rgba(218,165,32,0.12)',  color: '#DAA520' },
  hatching:    { bg: 'rgba(255,191,0,0.12)',   color: '#FFBF00' },
  larvae:      { bg: 'rgba(0,128,128,0.12)',   color: '#008080' },
  manure:      { bg: 'rgba(128,128,0,0.12)',   color: '#808000' },
  rejects:     { bg: 'rgba(220,20,60,0.12)',   color: '#DC143C' },
};
const NEUTRAL_ACCENT = { bg: 'var(--vz-tertiary-bg, rgba(139,148,158,0.12))', color: 'var(--vz-secondary-color)' };

export default function KPICard({ title, value, unit, icon, colorClass }) {
  const accent = ACCENT[colorClass] ?? NEUTRAL_ACCENT;
  const animatedValue = useCountUp(value || 0, 1500);

  // Format value to 1 decimal place if it's not an integer
  const displayValue = Number.isInteger(parseFloat(value))
    ? Math.round(animatedValue)
    : animatedValue.toFixed(1);

  return (
    <div className="col">
      <div className="py-3 px-3 h-100 border-end kpi-card">
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
