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
        className="form-control app-form-control"
        required={required}
        pattern={pattern}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        {...rest}
      />
      {children}
    </div>
  );
}
