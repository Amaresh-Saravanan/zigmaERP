import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import client from '../api/client';
import Swal from 'sweetalert2';
import heroBg from '../assets/images/auth-one-bg.jpg';
import flyIcon from '../assets/images/favi-icon.png';

export default function Login() {
  const [form, setForm] = useState({ user: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.user || !form.password) {
      Swal.fire({
        title: 'Enter Username and Password!',
        imageUrl: 'img/emoji/form_fill.webp',
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
      const res = await client.post('folders/login/crud.php', new URLSearchParams({
        action: 'login', user_name: form.user, password: form.password
      }), { suppressError: true });

      if (res.data?.status === 1) {
        if (form.password === 'password') {
          navigate('/password/update?default=true');
          return;
        }
        login(res.data.user);
        navigate('/');
        return;
      }

      // API returned but not a success — fall through to demo mode check below
      if (res.data?.msg === 'incorrect') {
        Swal.fire({
          title: 'Incorrect UserName and Password',
          imageUrl: 'img/emoji/invalid.webp',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true
        });
        return;
      }
    } catch (err) {
      console.error('Login API error:', err);
    }

    // API failed or no valid response — demo mode fallback
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
            <div className="lp-brand-logo">
              <img src={flyIcon} alt="" height="38" className="lp-fly-icon" />
              <span className="lp-brand-name">Zigfly</span>
            </div>
            <span className="lp-tagline">Sustaining for Circularity</span>
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

          {/* BOTTOM: status card + copyright */}
          <div>
            <div className="lp-status-card">
              <div className="lp-status-head">
                <span>System Status</span>
                <span className="lp-status-live">
                  <i className="lp-live-dot" aria-hidden="true" /> Operational
                </span>
              </div>
              <div className="lp-status-row">
                <div className="lp-status-icon"><i className="ri-refresh-line" aria-hidden="true" /></div>
                <div className="lp-status-meta">
                  <span>Live Sync</span>
                  <span>Last sync: just now</span>
                </div>
                <span className="lp-status-pill">LIVE</span>
              </div>
              <div className="lp-status-row">
                <div className="lp-status-icon"><i className="ri-stack-line" aria-hidden="true" /></div>
                <div className="lp-status-meta">
                  <span>Active Farms</span>
                  <span>24 online</span>
                </div>
                <span className="lp-status-pill">ONLINE</span>
              </div>
              <div className="lp-status-row">
                <div className="lp-status-icon"><i className="ri-line-chart-line" aria-hidden="true" /></div>
                <div className="lp-status-meta">
                  <span>Conversion Rate</span>
                  <span>96.45%</span>
                </div>
                <span className="lp-status-pill lp-pill-up">↑ 3.4%</span>
              </div>
            </div>
            <p className="lp-copyright">
              <i className="ri-leaf-fill" aria-hidden="true" /> {new Date().getFullYear()} © Zigfly. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Form 55% ── */}
        <div className="lp-form-side">

          {/* Organic wave — overlaps left panel's right edge, green stroke visible */}
          <svg
            className="lp-wave"
            viewBox="0 0 80 800"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              className="lp-wave-fill"
              d="M80,0 C48,0 22,80 44,220 C66,360 18,450 46,570 C74,690 34,740 80,800 L80,0 Z"
            />
            <path
              className="lp-wave-stroke"
              d="M80,0 C48,0 22,80 44,220 C66,360 18,450 46,570 C74,690 34,740 80,800"
              fill="none"
              stroke="#25a96b"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.95"
            />
          </svg>

          {/* Theme toggle — top-right */}
          <div className="lp-theme-toggle" role="group" aria-label="Theme">
            <button
              type="button"
              className={`lp-theme-btn${!isDark ? ' active' : ''}`}
              onClick={() => setTheme('light')}
              aria-label="Light mode"
              title="Light mode"
            >
              <i className="ri-sun-line" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`lp-theme-btn lp-theme-btn--moon${isDark ? ' active' : ''}`}
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
              title="Dark mode"
            >
              <i className="ri-moon-line" aria-hidden="true" />
            </button>
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

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-3">
                <label className="form-label" htmlFor="lp_user">Username</label>
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
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="lp_pass">Password</label>
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

              <div className="d-flex align-items-center justify-content-between mb-4">
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
        }
        .lp-split {
          display: flex;
          min-height: 100vh;
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
        }
        /* Two-layer overlay: deeper, more saturated greens for bolder look
           bottom vignette fully opaque for readability; upper section shows texture */
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
          gap: 8px;
          position: relative;
          z-index: 1;
        }
        .lp-brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-fly-icon {
          display: block;
          mix-blend-mode: screen;
          flex-shrink: 0;
        }
        .lp-brand-name {
          color: #fff;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .lp-tagline {
          color: rgba(255,255,255,0.48);
          font-size: 0.67rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 500;
          padding-left: 2px;
        }

        .lp-headline-wrap {
          position: relative;
          z-index: 1;
        }
        .lp-accent-bar {
          width: 48px;
          height: 4px;
          background: #25a96b;
          border-radius: 2px;
          margin-bottom: 20px;
          box-shadow: 0 0 16px rgba(37,169,107,0.4);
        }
        .lp-headline {
          color: #fff;
          font-size: clamp(1.65rem, 2.5vw, 2.1rem);
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
          font-style: normal;
          text-shadow: 0 4px 16px rgba(0,0,0,0.5);
          letter-spacing: -0.015em;
          overflow-wrap: break-word;
        }
        .lp-headline em {
          font-style: normal;
          color: #6dd9a0;
        }
        .lp-hero-desc {
          color: rgba(255,255,255,0.65);
          font-size: 0.91rem;
          line-height: 1.68;
          margin: 0;
          max-width: 320px;
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

        /* Organic wave — fill matches panel bg, green stroke is the divider */
        .lp-wave {
          position: absolute;
          left: -52px;
          top: 0;
          width: 76px;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }
        .lp-wave-fill { fill: #e8edf2; }
        [data-bs-theme='dark'] .lp-wave-fill { fill: #0d1117; }

        /* Theme toggle */
        .lp-theme-toggle {
          position: absolute;
          top: 24px;
          right: 28px;
          z-index: 10;
          display: flex;
          gap: 3px;
          padding: 4px;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        [data-bs-theme='dark'] .lp-theme-toggle {
          background: #161b22;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        }
        .lp-theme-btn {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: #94a3b8;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .lp-theme-btn.active {
          background: #f1f5f9;
          color: #1e293b;
        }
        .lp-theme-btn--moon.active {
          background: #25a96b;
          color: #fff;
        }
        .lp-theme-btn:focus-visible {
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
          padding: 44px 48px;
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
        [data-bs-theme='dark'] .lp-card .form-label { color: #8b949e; }
        .lp-card-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
          line-height: 1.2;
          position: relative;
          z-index: 1;
          letter-spacing: -0.02em;
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
          margin-bottom: 26px;
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
        }
        .lp-input-wrap .form-control:focus {
          border-color: #25a96b;
          box-shadow: 0 0 0 3px rgba(37,169,107,0.14);
        }
        .lp-pass-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1rem;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          z-index: 1;
          transition: color 0.15s;
        }
        .lp-pass-toggle:hover { color: #475569; }
        .lp-pass-toggle:focus-visible {
          outline: 2px solid #25a96b;
          outline-offset: 2px;
          border-radius: 4px;
        }

        .lp-link {
          color: #25a96b;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
        }
        .lp-link:hover { text-decoration: underline; color: #1d8a56; }

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
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .lp-submit:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(20,92,56,0.4);
          color: #fff;
        }
        .lp-submit:active:not(:disabled) { transform: translateY(0); }
        .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .lp-submit:focus-visible {
          outline: 3px solid rgba(37,169,107,0.5);
          outline-offset: 2px;
        }

        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 18px;
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

        /* ── Responsive ── */
        @media (max-width: 991px) {
          .lp-hero { display: none; }
          .lp-form-side {
            flex: 1 1 100%;
            padding: 32px 20px;
          }
          .lp-wave { display: none; }
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
