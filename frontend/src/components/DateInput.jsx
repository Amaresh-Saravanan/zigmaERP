import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default function DateInput({
  value,
  onChange,
  name,
  id,
  label,
  required,
  disabled,
  className = 'form-control',
  ...rest
}) {
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !pickerRef.current) {
      pickerRef.current = flatpickr(inputRef.current, {
        mode: 'single',
        dateFormat: 'Y-m-d',
        defaultValue: value || '',
        disableMobile: false,
        onChange: (selectedDates) => {
          const dateStr = selectedDates.length > 0
            ? selectedDates[0].toISOString().split('T')[0]
            : '';
          onChange({ target: { name, value: dateStr } });
        },
      });
    }

    return () => {
      if (pickerRef.current) {
        pickerRef.current.destroy();
        pickerRef.current = null;
      }
    };
  }, []);

  // Update picker value when prop changes
  useEffect(() => {
    if (pickerRef.current) {
      pickerRef.current.setDate(value || null);
    }
  }, [value]);

  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        ref={inputRef}
        type="text"
        name={name}
        id={id}
        className={className}
        required={required}
        disabled={disabled}
        placeholder="YYYY-MM-DD"
        {...rest}
      />
    </>
  );
}
