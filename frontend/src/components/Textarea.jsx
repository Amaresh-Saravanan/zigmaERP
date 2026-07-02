import React from 'react';

export default function Textarea({
  name,
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  required,
  disabled,
  readOnly,
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
      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`form-control app-form-control ${error ? 'is-invalid' : ''}`}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
      {error && <div className="invalid-feedback d-block" style={{ animation: 'slideInError 0.3s ease-out' }}>{error}</div>}
      {helperText && !error && <small className="form-text text-muted d-block mt-1">{helperText}</small>}
    </div>
  );
}
