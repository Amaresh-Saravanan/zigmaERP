import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FormHeader({ title, backTo }) {
  const navigate = useNavigate();
  return (
    <div className="card-header">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
        <h5>{title}</h5>
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="btn btn-sm d-flex align-items-center gap-1"
          style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)', border: '1px solid var(--vz-border-color)', borderRadius: 6 }}
        >
          <i className="ri-arrow-left-s-line"></i> Back to list
        </button>
      </div>
    </div>
  );
}
