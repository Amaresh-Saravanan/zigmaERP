import React from 'react';

// Age gradient: fresh (green) → aging (amber) → stale (red) — reads as urgency at a glance
const AGE_COLORS = ['#25a96b', '#25a96b', '#f7b84b', '#f7b84b', '#f06548', '#e5484d'];

export default function TrayStatusWidget({ data, unutilizedTrays }) {
  const getDayItems = () => {
    const items = [];
    for (let i = 1; i <= 5; i++) {
      const found = data?.find(item => item.tray_age === i);
      items.push({ label: `Day ${i}`, value: found?.tray_utilized || 0, color: AGE_COLORS[i - 1] });
    }
    return items;
  };

  const aboveFiveDays = data?.find(item => item.tray_age === 'Above 5 Days')?.tray_utilized || 0;

  const rows = [
    ...getDayItems(),
    { label: 'Above 5 Days', value: aboveFiveDays, color: AGE_COLORS[5] },
  ];

  return (
    <div className="card card-height-100">
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Age Wise Tray Status</h4>
        <span
          className="d-inline-flex align-items-center gap-1"
          style={{
            fontSize: '0.65rem', fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.08em', color: 'var(--vz-secondary-color)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#25a96b', boxShadow: '0 0 0 3px rgba(37,169,107,0.18)' }}></span>
          LIVE
        </span>
      </div>
      <div className="card-body">
        <ul className="list-unstyled mb-3">
          {rows.map((row, idx) => (
            <li
              key={idx}
              className="d-flex align-items-center justify-content-between py-2"
              style={{ cursor: 'default', borderBottom: idx < rows.length - 1 ? '1px solid var(--vz-border-color)' : 'none' }}
            >
              <span className="d-flex align-items-center gap-2">
                <span
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: `${row.color}26`, flexShrink: 0,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.color }}></span>
                </span>
                <span
                  className="text-uppercase fw-semibold"
                  style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--vz-secondary-color)' }}
                >
                  {row.label}
                </span>
              </span>
              <span
                className="fw-bold"
                style={{ fontSize: '1rem', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--vz-emphasis-color)' }}
              >
                {row.value}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="p-3 rounded"
          style={{ background: 'rgba(37,169,107,0.1)', border: '1px solid rgba(37,169,107,0.25)' }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--vz-secondary-color)' }}>
                Unutilized Trays
              </div>
              <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Total available capacity</div>
            </div>
            <div
              className="fw-bold"
              style={{ fontSize: '2.2rem', lineHeight: 1, fontFamily: "'IBM Plex Mono', monospace", color: '#25a96b', textShadow: '0 0 16px rgba(37,169,107,0.4)' }}
            >
              {unutilizedTrays || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
