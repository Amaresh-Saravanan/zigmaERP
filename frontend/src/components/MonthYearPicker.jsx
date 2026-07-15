import { useState, useRef, useEffect } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MonthYearPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(() => parseInt(value?.split('-')[0]) || new Date().getFullYear());
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedMonth = value ? parseInt(value.split('-')[1]) - 1 : new Date().getMonth();

  useEffect(() => {
    if (!isOpen) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Move focus into the dropdown when it opens so keyboard users land somewhere useful.
  useEffect(() => {
    if (isOpen) dropdownRef.current?.querySelector('button')?.focus();
  }, [isOpen]);

  const pick = (m) => {
    onChange(`${year}-${String(m + 1).padStart(2, '0')}`);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const pillStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px',
    background: 'var(--vz-secondary-bg)', border: '1px solid var(--vz-border-color)',
    borderRadius: 999, cursor: 'pointer', userSelect: 'none',
  };
  const dropdownStyle = {
    position: 'absolute', top: '110%', right: 0, zIndex: 50, width: 280,
    background: 'var(--vz-secondary-bg)', border: '1px solid var(--vz-border-color)',
    borderRadius: 14, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  };
  const yearBtn = {
    background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer',
    color: 'var(--vz-emphasis-color)', padding: '4px 10px', borderRadius: 6,
  };
  const monthBtn = (active) => ({
    padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500,
    fontSize: '0.82rem', transition: 'all 0.15s',
    background: active ? 'var(--primary-green)' : 'transparent',
    color: active ? '#fff' : 'var(--vz-emphasis-color)',
  });

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        ref={triggerRef}
        style={pillStyle}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <i className="ri-calendar-line" style={{ fontSize: '0.9rem', color: 'var(--vz-secondary-color)' }} />
        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--vz-emphasis-color)' }}>
          {MONTHS[selectedMonth]} {year}
        </span>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line`} style={{ fontSize: '1rem', color: 'var(--vz-secondary-color)' }} />
      </div>

      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button type="button" aria-label="Previous year" style={yearBtn} onClick={() => setYear(y => y - 1)}>&#9664;</button>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--vz-emphasis-color)' }}>{year}</span>
            <button type="button" aria-label="Next year" style={yearBtn} onClick={() => setYear(y => y + 1)}>&#9654;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {MONTHS.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                style={monthBtn(i === selectedMonth)}
                aria-current={i === selectedMonth ? 'true' : undefined}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
