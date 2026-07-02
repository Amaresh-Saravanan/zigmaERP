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
  ...rest
}) {
  return (
    <div className="mb-3">
      {label && <label htmlFor={name} className="form-label app-form-label">{label}</label>}
      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="form-control app-form-control"
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
    </div>
  );
}
