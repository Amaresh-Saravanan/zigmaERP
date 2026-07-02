import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
}) {
  // 'primary' keeps the app-wide green save-button convention
  const variantClass = variant === 'primary' ? 'btn-success' : `btn-${variant}`;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${className}`.trim()}
      style={{
        minWidth: 'var(--min-touch-target)',
        minHeight: 'var(--min-touch-target)',
      }}
    >
      {children}
    </button>
  );
}
