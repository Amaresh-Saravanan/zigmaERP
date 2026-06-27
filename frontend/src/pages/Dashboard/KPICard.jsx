import React from 'react';

export default function KPICard({ title, value, unit, icon, colorClass, onClick }) {
  return (
    <div className="col">
      <div
        className="py-3 px-3 h-100 border-end"
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}
      >
        <h6 className="text-muted text-uppercase fs-12 fw-semibold mb-2" style={{ letterSpacing: '0.5px' }}>
          {title}
        </h6>
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <i className={`${icon} ${colorClass}`} style={{ fontSize: '2rem' }}></i>
          </div>
          <div className="flex-grow-1 ms-3">
            <h3 className="mb-0 fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1.2 }}>
              {value ?? 0}
            </h3>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
