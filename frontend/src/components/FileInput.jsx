import React from 'react';

export default function FileInput({
  name,
  label,
  onFilesChange,
  required,
  multiple = true,
  accept,
  disabled,
}) {
  return (
    <div className="mb-3">
      {label && <label htmlFor={name} className="form-label app-form-label">{label}</label>}
      <input
        type="file"
        name={name}
        id={name}
        onChange={(e) => onFilesChange(e.target.files)}
        className="form-control app-form-control"
        required={required}
        multiple={multiple}
        accept={accept}
        disabled={disabled}
      />
    </div>
  );
}
