import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import djangoClient, { mapDjangoUser } from '../api/djangoClient';
import Swal from 'sweetalert2';
import heroBg from '../assets/images/auth-one-bg.jpg';
import zigflyLogo from '../assets/images/zigfly-logo-clean.png';

export default function Login() {
  const [form, setForm] = useState({ user: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showIncorrect = () => {
    setLoading(false);
    Swal.fire({
      title: 'Incorrect UserName and Password',
      icon: 'error',
      showConfirmButton: true,
      timer: 2000,
      timerProgressBar: true
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.user || !form.password) {
      Swal.fire({
        title: 'Enter Username and Password!',
        icon: 'warning',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true
      });
      return;
    }

    setLoading(true);
    const demoUser = {
      userId: 'demo001',
      userName: 'admin',
      userType: '5f97fc3257f2525529',
      userImage: 'img/user.jpg',
      companyName: 'Zigma Global Environ Solutions',
      mainScreens: [],
      sections: [],
      screens: []
    };

    try {
      // Django token auth is now the source of truth. Success → { status:1,
      // data:{ access_token, user } }; bad credentials → HTTP 401 (axios throws).
      const res = await djangoClient.post('/auth/login', {
        user_name: form.user, password: form.password
      }, { suppressError: true });

      if (res.data?.status === 1) {
        localStorage.setItem('django_token', res.data.data.access_token);
        login(mapDjangoUser(res.data.data.user));
        if (form.password === 'password') {
          navigate('/password/update?default=true');
          return;
        }
        navigate('/');
        return;
      }

      // 2xx but not a success payload — treat as bad credentials
      showIncorrect();
      return;
    } catch (err) {
      // Only a 401 means the server actually rejected these credentials.
      // Any other status (404 misrouted proxy, 500, etc.) is a real backend/
      // network problem and must not be shown as "incorrect password".
      if (err.response?.status === 401) {
        showIncorrect();
        return;
      }
    }

    // Backend unreachable — demo mode fallback
    if (form.user === 'admin' && form.password === 'admin123') {
      login(demoUser);
      navigate('/');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Database Offline / Network Error',
        html: 'The database is currently unavailable.<br><br>Please use the demo credentials to login:<br><strong>Username:</strong> admin<br><strong>Password:</strong> admin123',
        showConfirmButton: true,
        timer: 5000,
        timerProgressBar: true
      });
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="lp-root" onKeyUp={handleKey}>
      <div className="lp-split">

        {/* ── LEFT: Hero 45% ── */}
        <div className="lp-hero" style={{ backgroundImage: `url(${heroBg})` }}>
          {/* Dark green overlay over the larvae photo */}
          <div className="lp-hero-overlay" aria-hidden="true" />
          {/* Sunrise glow effect */}
          <div className="lp-hero-glow" aria-hidden="true" />

          {/* TOP: branding */}
          <div className="lp-brand">
            <img src={zigflyLogo} alt="Zigfly" height="120" className="lp-brand-logo-full" />
          </div>

          {/* CENTER: headline */}
          <div className="lp-headline-wrap">
            <div className="lp-accent-bar" aria-hidden="true" />
            <h1 className="lp-headline">
              Sustainable Solutions<br />
              for a <em>Better Tomorrow</em>
            </h1>
            <p className="lp-hero-desc">
              Transforming organic waste into value through black soldier fly innovation.
            </p>
          </div>

          {/* BOTTOM: copyright */}
          <p className="lp-copyright" style={{ position: 'relative', zIndex: 1 }}>
            <i className="ri-leaf-fill" aria-hidden="true" /> {new Date().getFullYear()} © Zigfly. All rights reserved.
          </p>
        </div>

        {/* ── RIGHT: Form 55% ── */}
        <div className="lp-form-side">

          {/* Theme toggle — sliding pill, top-right */}
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

          {/* Login card */}
          <div className="lp-card">
            {/* Dot grid decoration — top-right corner of card */}
            <svg className="lp-card-dots" aria-hidden="true" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              {Array.from({ length: 6 }, (_, row) =>
                Array.from({ length: 6 }, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 14 + 5} cy={row * 14 + 5} r="1.5" fill="#25a96b" opacity="0.18" />
                ))
              )}
            </svg>

            <h2 className="lp-card-title">
              Welcome Back, <span>Admin!</span>
            </h2>
            <p className="lp-card-sub">Sign in to continue to Zigfly Admin Dashboard.</p>
            <div className="lp-card-rule" aria-hidden="true" />

            <form onSubmit={handleSubmit} autoComplete="off" noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="lp_user">Username <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-user-line" aria-hidden="true" />
                  <input
                    className="form-control"
                    id="lp_user"
                    name="user"
                    type="text"
                    placeholder="Enter your username"
                    value={form.user}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="lp_pass">Password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    id="lp_pass"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="lp-pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lp_remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="lp_remember">Remember me</label>
                </div>
                <a href="#" className="lp-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>

              <button
                className="btn lp-submit w-100"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in…' : (
                  <><span>Sign In</span><i className="ri-arrow-right-line" aria-hidden="true" /></>
                )}
              </button>
            </form>

            <div className="lp-divider" aria-hidden="true">
              <span className="lp-divider-line" />
              <i className="ri-shield-check-line" />
              <span className="lp-divider-line" />
            </div>

            <p className="lp-footer-text">
              Don't have an account?{' '}
              <a href="#" className="lp-link" onClick={(e) => e.preventDefault()}>Contact Administrator</a>
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

        /* ── LEFT HERO (45%) ── */
        .lp-hero {
          flex: 0 0 45%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 52px;
          background-size: cover;
          background-position: center;
          overflow: hidden;
          clip-path: inset(0);
        }
        /* Dark overlay - logo is transparent so shows well on any background
           bottom vignette fully opaque for status card; upper section shows texture */
        .lp-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(2,8,5,0.98) 0%, rgba(3,14,8,0.65) 40%, rgba(8,28,16,0.25) 65%, transparent 75%),
            linear-gradient(135deg, rgba(6,18,11,0.75), rgba(12,32,20,0.8));
          pointer-events: none;
          z-index: 0;
        }
        /* Warmer, more saturated amber sunrise — creates drama */
        .lp-hero-glow {
          position: absolute;
          top: -15%;
          right: -8%;
          width: 65%;
          height: 60%;
          background: radial-gradient(ellipse at 75% 30%, rgba(255,200,80,0.22) 0%, rgba(255,170,40,0.08) 35%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .lp-brand {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          z-index: 1;
          margin-top: -69px;
        }
        .lp-brand-logo-full {
          display: block;
          height: auto;
          max-width: 280px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
        }

        .lp-headline-wrap {
          position: relative;
          z-index: 1;
          margin-top: -19px;
        }
        .lp-accent-bar {
          width: 72px;
          height: 6px;
          background: #25a96b;
          border-radius: 3px;
          margin-bottom: 30px;
          box-shadow: 0 0 16px rgba(37,169,107,0.4);
        }
        .lp-headline {
          color: #fff;
          font-size: clamp(2.475rem, 3.75vw, 3.15rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 24px;
          font-style: normal;
          text-shadow: 0 4px 16px rgba(0,0,0,0.5);
          letter-spacing: -0.015em;
          text-wrap: balance;
        }
        .lp-headline em {
          font-style: normal;
          color: #6dd9a0;
        }
        .lp-hero-desc {
          color: rgba(255,255,255,0.65);
          font-size: 1.365rem;
          line-height: 1.68;
          margin: 0;
          max-width: 480px;
          text-shadow: 0 1px 6px rgba(0,0,0,0.3);
        }

        /* Status card — enhanced glassmorphism with green tint */
        .lp-status-card {
          background: rgba(2,10,6,0.72);
          border: 1.5px solid rgba(37,169,107,0.25);
          border-radius: 16px;
          padding: 18px 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.3),
            inset 0 1px 1px rgba(255,255,255,0.1),
            0 0 24px rgba(37,169,107,0.12);
          max-width: 360px;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 600px) {
          .lp-status-card {
            max-width: 100%;
            padding: 14px 16px;
            font-size: 0.9rem;
          }
        }
        .lp-status-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .lp-status-live {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 600;
          color: #6dd9a0;
          letter-spacing: 0.03em;
        }
        .lp-live-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #25a96b;
          box-shadow: 0 0 0 2px rgba(37,169,107,0.3);
          animation: lpPulse 2s ease-in-out infinite;
        }
        @keyframes lpPulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(37,169,107,0.3); }
          50% { box-shadow: 0 0 0 5px rgba(37,169,107,0.08); }
        }
        .lp-status-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 0;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .lp-status-icon {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border-radius: 8px;
          background: rgba(37,169,107,0.2);
          color: #6dd9a0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.88rem;
        }
        .lp-status-meta {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 1px;
        }
        .lp-status-meta span:first-child {
          color: #fff;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .lp-status-meta span:last-child {
          color: rgba(255,255,255,0.5);
          font-size: 0.7rem;
        }
        .lp-status-pill {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(37,169,107,0.18);
          color: #6dd9a0;
          white-space: nowrap;
          letter-spacing: 0.06em;
        }
        .lp-pill-up { background: rgba(37,169,107,0.22); }

        .lp-copyright {
          color: rgba(255,255,255,0.38);
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 12px 0 0;
          position: relative;
          z-index: 1;
        }

        /* ── RIGHT FORM SIDE (55%) ── */
        .lp-form-side {
          flex: 0 0 55%;
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

        /* Theme toggle — sliding pill */
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

        /* Login card — elevated, dramatic shadow */
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

        /* Dot grid decoration — top-right */
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

        /* Input wrapper with inset icon */
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

        /* Submit button */
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

        .form-check-input {
          appearance: none;
          -webkit-appearance: none;
          width: 16px !important;
          height: 16px !important;
          min-width: 16px !important;
          min-height: 16px !important;
          max-width: 16px !important;
          max-height: 16px !important;
          padding: 0 !important;
          border: 1.5px solid #cbd5e1;
          border-radius: 50% !important;
          cursor: pointer;
          margin-top: 1px;
          flex-shrink: 0;
          display: grid;
          place-content: center;
          transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
          background-image: none !important;
          background-color: transparent !important;
        }
        [data-bs-theme='dark'] .form-check-input { border-color: #424752; }
        .form-check-input::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          background-color: #25a96b;
        }
        .form-check-input:checked {
          border-color: #25a96b !important;
        }
        .form-check-input:checked::before {
          transform: scale(1);
        }
        .form-check-input:focus-visible {
          box-shadow: 0 0 0 3px rgba(37,169,107,0.2) !important;
          border-color: #25a96b !important;
          outline: none;
        }
        .form-check {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .form-check-label {
          font-size: 0.84rem;
          color: #374151;
          cursor: pointer;
          user-select: none;
          margin-bottom: 0;
        }
        [data-bs-theme='dark'] .form-check-label { color: #8b949e; }

        /* ── Responsive ── */
        @media (max-width: 991px) {
          .lp-hero { display: none; }
          .lp-form-side {
            flex: 1 1 100%;
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
          .lp-live-dot { animation: none; }
          .lp-submit { transition: none; }
        }
      `}</style>
    </div>
  );
}