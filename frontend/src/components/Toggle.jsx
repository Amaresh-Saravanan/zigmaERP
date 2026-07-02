import React from 'react';

export default function Toggle({ name, label, value, onChange, disabled, helperText }) {
  const handleChange = (e) => {
    onChange({ target: { name, value: e.target.checked ? '1' : '0' } });
  };

  return (
    <div className="mb-3">
      {label && (
        <label className="form-label app-form-label d-block" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="form-check form-switch">
        <input
          type="checkbox"
          className="form-check-input"
          role="switch"
          id={name}
          name={name}
          checked={value === '1'}
          onChange={handleChange}
          disabled={disabled}
          style={{
            transition: 'all 0.25s ease-out',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        {helperText && (
          <label htmlFor={name} className="form-check-label">
            {helperText}
          </label>
        )}
      </div>
    </div>
  );
}
