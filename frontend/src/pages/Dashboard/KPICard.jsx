import React from 'react';

export default function KPICard({ title, value, unit, icon, colorClass, onClick }) {
  return (
    <div className="col">
      <div className="py-4 px-3 h-100" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
        <h5 className="text-muted text-uppercase fs-13">{title}</h5>
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <i className={`${icon} display-6 ${colorClass} fs-2`}></i>
          </div>
          <div className="flex-grow-1 ms-3 text-center">
            <h2 className="mb-0 fs-3">{value ?? 0}</h2>
            <span className="text-muted opacity-75" style={{ fontSize: '0.85em' }}>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
