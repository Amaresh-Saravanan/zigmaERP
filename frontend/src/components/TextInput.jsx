import React from 'react';

export default function TextInput({
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  pattern,
  disabled,
  readOnly,
  maxLength,
  helperText,
  error,
  children,
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
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-control app-form-control ${error ? 'is-invalid' : ''}`}
        required={required}
        pattern={pattern}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        {...rest}
      />
      {error && <div className="invalid-feedback d-block" style={{ animation: 'slideInError 0.3s ease-out' }}>{error}</div>}
      {helperText && !error && <small className="form-text text-muted d-block mt-1">{helperText}</small>}
      {children}
    </div>
  );
}
