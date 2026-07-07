import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import djangoClient from '../api/djangoClient';
import Swal from 'sweetalert2';

export default function PasswordUpdate() {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDefault = searchParams.get('default') === 'true';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!form.current_password || !form.new_password || !form.confirm_password) {
      Swal.fire({
        title: 'Please fill all required fields!',
        icon: 'warning',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (form.new_password !== form.confirm_password) {
      Swal.fire({
        title: 'Passwords do not match!',
        icon: 'error',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    if (form.new_password.length < 6) {
      Swal.fire({
        title: 'Password must be at least 6 characters long.',
        icon: 'warning',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await djangoClient.post('/auth/change-password', {
        old_password: form.current_password,
        new_password: form.new_password,
      }, { suppressError: true });

      if (res.data?.status === 1) {
        Swal.fire({
          title: 'Password Updated',
          text: 'Your password has been changed successfully.',
          icon: 'success',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          navigate('/');
        });
        return;
      }

      Swal.fire({
        title: 'Failed',
        text: res.data?.error || 'Something went wrong. Please try again.',
        icon: 'error',
        showConfirmButton: true,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error;
      if (status === 400) {
        Swal.fire({
          title: msg || 'Invalid request.',
          icon: 'warning',
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: status
            ? `The server returned an unexpected error (HTTP ${status}). Please contact your administrator.`
            : 'Could not reach the server. Check your connection and try again.',
          showConfirmButton: true,
          timer: 6000,
          timerProgressBar: true,
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="lp-root">
      <div className="lp-split">
        <div className="lp-form-side" style={{ flex: '1 1 100%' }}>
          <div
            className="lp-theme-toggle"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTheme(isDark ? 'light' : 'dark'); } }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="lp-theme-pill">
              <div className={`lp-theme-thumb${isDark ? '' : ' light'}`}>
                {isDark ? (
                  <i className="ri-moon-line" aria-hidden="true" />
                ) : (
                  <i className="ri-sun-line" aria-hidden="true" />
                )}
              </div>
            </div>
          </div>

          <div className="lp-card">
            <svg className="lp-card-dots" aria-hidden="true" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              {Array.from({ length: 6 }, (_, row) =>
                Array.from({ length: 6 }, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 14 + 5} cy={row * 14 + 5} r="1.5" fill="#25a96b" opacity="0.18" />
                ))
              )}
            </svg>

            <h2 className="lp-card-title">
              {isDefault ? 'Set Your Password' : 'Update Password'}
            </h2>
            <p className="lp-card-sub">
              {isDefault
                ? 'Please set a new password before continuing to the dashboard.'
                : 'Enter your current and new password.'}
            </p>
            <div className="lp-card-rule" aria-hidden="true" />

            <form onSubmit={handleSubmit} autoComplete="off" noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="pu_current">Current Password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className="form-control"
                    id="pu_current"
                    name="current_password"
                    placeholder="Enter current password"
                    value={form.current_password}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="lp-pass-toggle"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    <i className={showCurrent ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="pu_new">New Password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    className="form-control"
                    id="pu_new"
                    name="new_password"
                    placeholder="Enter new password"
                    value={form.new_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="lp-pass-toggle"
                    onClick={() => setShowNew(!showNew)}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    <i className={showNew ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="pu_confirm">Confirm New Password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control"
                    id="pu_confirm"
                    name="confirm_password"
                    placeholder="Confirm new password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="lp-pass-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <i className={showConfirm ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <button
                className="btn lp-submit w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Updating…' : (
                  <><span>Update Password</span><i className="ri-arrow-right-line" aria-hidden="true" /></>
                )}
              </button>
            </form>

            <div className="lp-divider" aria-hidden="true">
              <span className="lp-divider-line" />
              <i className="ri-shield-check-line" />
              <span className="lp-divider-line" />
            </div>

            <p className="lp-footer-text">
              <a href="/" className="lp-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Back to Dashboard</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .lp-root {
          min-height: 100vh;
          background: #e8edf2;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }
        [data-bs-theme='dark'] .lp-root {
          background: #0d1117;
        }
        [data-bs-theme='dark'] body {
          background: #0d1117;
        }
        .lp-split {
          display: flex;
          min-height: 100vh;
          overflow: hidden;
        }

        .lp-form-side {
          flex: 1 1 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 48px;
          background: #e8edf2;
          overflow: hidden;
        }
        [data-bs-theme='dark'] .lp-form-side {
          background: #0d1117;
        }

        .lp-theme-toggle {
          position: absolute;
          top: 24px;
          right: 28px;
          z-index: 10;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .lp-theme-pill {
          width: 64px;
          height: 32px;
          padding: 4px;
          border-radius: 999px;
          background: #0f172a;
          border: 1px solid #1e293b;
          transition: background 0.3s, border-color 0.3s;
          display: flex;
          align-items: center;
        }
        [data-bs-theme='light'] .lp-theme-pill {
          background: #f1f5f9;
          border-color: #e2e8f0;
        }
        .lp-theme-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
          color: #e2e8f0;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, color 0.3s;
          transform: translateX(0);
          font-size: 0.85rem;
        }
        .lp-theme-thumb.light {
          transform: translateX(32px);
          background: #e2e8f0;
          color: #f59e0b;
        }
        .lp-theme-toggle:focus-visible .lp-theme-pill {
          outline: 2px solid #25a96b;
          outline-offset: 2px;
        }

        .lp-card {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 28px;
          padding: 32px 48px;
          box-shadow:
            0 2px 4px rgba(15,23,42,0.08),
            0 8px 24px rgba(15,23,42,0.12),
            0 20px 60px rgba(15,23,42,0.16),
            0 0 1px rgba(15,23,42,0.05);
          overflow: hidden;
        }
        [data-bs-theme='dark'] .lp-card {
          background: #161b22;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.4),
            0 4px 16px rgba(0,0,0,0.4),
            0 16px 48px rgba(0,0,0,0.5);
        }

        .lp-card-dots {
          position: absolute;
          top: 0;
          right: 0;
          width: 90px;
          height: 90px;
          pointer-events: none;
        }

        .lp-card {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .lp-card .form-label {
          font-weight: 500;
          font-size: 0.83rem;
          color: #374151;
          letter-spacing: 0.01em;
        }
        .lp-card .form-label span {
          color: #ef4444;
          margin-left: 2px;
          font-weight: 600;
        }
        [data-bs-theme='dark'] .lp-card .form-label { color: #8b949e; }
        [data-bs-theme='dark'] .lp-card .form-label span { color: #ff6b6b; }
        .lp-card-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
          line-height: 1.2;
          position: relative;
          z-index: 1;
          letter-spacing: -0.02em;
          text-wrap: balance;
        }
        [data-bs-theme='dark'] .lp-card-title { color: #f0f6fc; }
        .lp-card-title span { color: #25a96b; }

        .lp-card-sub {
          color: #64748b;
          font-size: 0.87rem;
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }
        [data-bs-theme='dark'] .lp-card-sub { color: #8b949e; }

        .lp-card-rule {
          width: 36px;
          height: 3px;
          background: #25a96b;
          border-radius: 2px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .lp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lp-input-wrap > i:first-child {
          position: absolute;
          left: 14px;
          color: #94a3b8;
          font-size: 1rem;
          pointer-events: none;
          z-index: 1;
        }
        .lp-input-wrap .form-control {
          padding-left: 42px;
          height: 46px;
          border-radius: 10px;
          font-size: 0.92rem;
          border: 1px solid #e5e7eb;
          transition: border-color 0.2s, box-shadow 0.2s, background-color 0.15s;
          background-color: #fff;
        }
        .lp-input-wrap .form-control:invalid {
          border-color: #e5e7eb !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .lp-input-wrap .form-control::placeholder {
          color: #9ca3af;
          opacity: 1;
        }
        .lp-input-wrap .form-control:hover {
          border-color: #d1d5db;
        }
        .lp-input-wrap .form-control:focus {
          border-color: #d1d5db;
          box-shadow: 0 0 0 3px rgba(37,169,107,0.15);
          background-color: #fafbfc;
        }
        [data-bs-theme='dark'] .lp-input-wrap .form-control {
          border-color: #30363d;
          background-color: #0d1117;
          color: #f0f6fc;
        }
        [data-bs-theme='dark'] .lp-input-wrap .form-control:invalid {
          border-color: #30363d;
          box-shadow: none;
        }
        [data-bs-theme='dark'] .lp-input-wrap .form-control::placeholder {
          color: #6e7681;
          opacity: 1;
        }
        [data-bs-theme='dark'] .lp-input-wrap .form-control:hover {
          border-color: #424752;
        }
        [data-bs-theme='dark'] .lp-input-wrap .form-control:focus {
          border-color: #30363d;
          box-shadow: 0 0 0 3px rgba(37,169,107,0.2);
          background-color: #161b22;
        }
        .lp-pass-toggle {
          position: absolute;
          right: 12px;
          background: rgba(37,169,107,0);
          border: none;
          color: #94a3b8;
          font-size: 1rem;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          z-index: 1;
          transition: all 0.15s;
          border-radius: 6px;
        }
        .lp-pass-toggle:hover {
          color: #25a96b;
          background: rgba(37,169,107,0.08);
        }
        .lp-pass-toggle:active {
          transform: scale(0.95);
        }
        .lp-pass-toggle:focus-visible {
          outline: 2px solid #25a96b;
          outline-offset: 2px;
          background: rgba(37,169,107,0.12);
        }

        .lp-link {
          color: #25a96b;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s;
          position: relative;
        }
        .lp-link:hover {
          color: #1d8a56;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
        }
        .lp-link:focus-visible {
          outline: 2px solid #25a96b;
          outline-offset: 3px;
          border-radius: 2px;
        }

        .lp-submit {
          height: 48px;
          background: linear-gradient(135deg, #1e7a4a 0%, #145c38 100%);
          border: none;
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.01em;
          position: relative;
        }
        .lp-submit:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(20,92,56,0.45);
        }
        .lp-submit:active:not(:disabled) {
          transform: translateY(-1px);
        }
        .lp-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .lp-submit:focus-visible {
          outline: 3px solid rgba(37,169,107,0.6);
          outline-offset: 2px;
        }

        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0 12px;
          color: #cbd5e1;
          font-size: 1rem;
        }
        [data-bs-theme='dark'] .lp-divider { color: #30363d; }
        .lp-divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        [data-bs-theme='dark'] .lp-divider-line { background: #30363d; }

        .lp-footer-text {
          text-align: center;
          color: #64748b;
          font-size: 0.84rem;
          margin: 0;
        }
        [data-bs-theme='dark'] .lp-footer-text { color: #8b949e; }

        @media (max-width: 991px) {
          .lp-form-side {
            padding: 32px 20px;
          }
          .lp-card {
            max-width: 440px;
            padding: 36px 28px;
            border-radius: 20px;
          }
        }
        @media (max-width: 480px) {
          .lp-card { padding: 28px 20px; border-radius: 16px; }
          .lp-card-title { font-size: 1.4rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lp-submit { transition: none; }
        }
      `}</style>
    </div>
  );
}
