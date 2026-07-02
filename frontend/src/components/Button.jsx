import React, { useState, useEffect } from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
  loading = false,
  success = false,
}) {
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-dismiss success state after 1.5s
  useEffect(() => {
    if (success) {
      setIsSuccess(true);
      const timer = setTimeout(() => setIsSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // 'primary' keeps the app-wide green save-button convention
  const variantClass = variant === 'primary' ? 'btn-success' : `btn-${variant}`;
  const isDisabled = disabled || loading || isSuccess;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`btn ${variantClass} ${className} ${loading ? 'btn-loading' : ''} ${isSuccess ? 'btn-success-state' : ''}`.trim()}
      style={{
        minWidth: 'var(--min-touch-target)',
        minHeight: 'var(--min-touch-target)',
        opacity: loading ? 0.8 : 1,
      }}
    >
      {loading && (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span style={{ opacity: 0.7 }}>Loading...</span>
        </>
      )}
      {isSuccess && (
        <>
          <i className="ri-check-line me-2" style={{ fontSize: '1.1em' }}></i>
          <span>Saved!</span>
        </>
      )}
      {!loading && !isSuccess && children}
    </button>
  );
}
