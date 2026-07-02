import React from 'react';

export default function Select({
  name,
  label,
  value,
  onChange,
  options = [],
  required,
  disabled,
  placeholder,
  helperText,
  error,
  ...rest
}) {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="form-label app-form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`form-select app-form-control ${error ? 'is-invalid' : ''}`}
        required={required}
        disabled={disabled}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <div className="invalid-feedback d-block" style={{ animation: 'slideInError 0.3s ease-out' }}>{error}</div>}
      {helperText && !error && <small className="form-text text-muted d-block mt-1">{helperText}</small>}
    </div>
  );
}
