import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import djangoClient, { mapDjangoUser } from '../api/djangoClient';
import Swal from 'sweetalert2';
import heroBg from '../assets/images/auth-one-bg.jpg';
import zigflyLogo from '../assets/images/zigfly-logo-clean.png';
import './auth.css';

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
              <Link to="/signup" className="lp-link">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

