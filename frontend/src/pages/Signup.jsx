import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import djangoClient from '../api/djangoClient';
import Swal from 'sweetalert2';
import useTheme from '../hooks/useTheme';
import heroBg from '../assets/images/auth-one-bg.jpg';
import zigflyLogo from '../assets/images/zigfly-logo-clean.png';
import './auth.css';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  user_name: '', user_email: '', password: '', confirm_password: '',
  first_name: '', last_name: '',
};

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.user_name || form.user_name.length < 3) {
      errs.user_name = 'Username must be at least 3 characters.';
    } else if (!/^[A-Za-z0-9_]+$/.test(form.user_name)) {
      errs.user_name = 'Username may only contain letters, numbers, and underscores.';
    }
    if (!EMAIL_RULE.test(form.user_email)) {
      errs.user_email = 'Enter a valid email address.';
    }
    if (!PASSWORD_RULE.test(form.password)) {
      errs.password = 'Min 8 characters with uppercase, lowercase, number, and special character.';
    }
    if (form.confirm_password !== form.password) {
      errs.confirm_password = 'Passwords do not match.';
    }
    if (!form.first_name) errs.first_name = 'First name is required.';
    if (!form.last_name) errs.last_name = 'Last name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await djangoClient.post('/auth/signup', form, { suppressError: true });
      if (res.data?.status === 1) {
        await Swal.fire({
          icon: 'success',
          title: 'Account created',
          text: 'An administrator will review and activate your account before you can sign in.',
          confirmButtonText: 'Go to Sign In',
        });
        navigate('/login');
        return;
      }
      Swal.fire({ icon: 'error', title: 'Signup failed', text: res.data?.error || 'Please try again.' });
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to reach the server. Please try again later.';
      Swal.fire({ icon: 'error', title: 'Signup failed', text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      <div className="lp-split">
        <div className="lp-hero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="lp-hero-overlay" aria-hidden="true" />
          <div className="lp-hero-glow" aria-hidden="true" />
          <div className="lp-brand">
            <img src={zigflyLogo} alt="Zigfly" height="120" className="lp-brand-logo-full" />
          </div>
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
          <p className="lp-copyright" style={{ position: 'relative', zIndex: 1 }}>
            <i className="ri-leaf-fill" aria-hidden="true" /> {new Date().getFullYear()} © Zigfly. All rights reserved.
          </p>
        </div>

        <div className="lp-form-side">
          {/* Theme toggle — sliding pill, top-right (shared mechanism with Login) */}
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
              Create an <span>Account</span>
            </h2>
            <p className="lp-card-sub">Sign up to request access to Zigfly Admin Dashboard.</p>
            <div className="lp-card-rule" aria-hidden="true" />

            <form onSubmit={handleSubmit} autoComplete="on" noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="su_user">Username <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-user-line" aria-hidden="true" />
                  <input
                    className="form-control"
                    id="su_user"
                    name="user_name"
                    type="text"
                    placeholder="Choose a username"
                    value={form.user_name}
                    onChange={handleChange}
                    autoComplete="username"
                    aria-invalid={!!errors.user_name}
                    aria-describedby={errors.user_name ? 'su_user_err' : undefined}
                    autoFocus
                  />
                </div>
                {errors.user_name && <div className="lp-field-error" id="su_user_err" role="alert">{errors.user_name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_email">Email <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-mail-line" aria-hidden="true" />
                  <input
                    className="form-control"
                    id="su_email"
                    name="user_email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.user_email}
                    onChange={handleChange}
                    autoComplete="email"
                    aria-invalid={!!errors.user_email}
                    aria-describedby={errors.user_email ? 'su_email_err' : undefined}
                  />
                </div>
                {errors.user_email && <div className="lp-field-error" id="su_email_err" role="alert">{errors.user_email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_first">First name <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <input
                    className="form-control"
                    id="su_first"
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    value={form.first_name}
                    onChange={handleChange}
                    autoComplete="given-name"
                    aria-invalid={!!errors.first_name}
                    aria-describedby={errors.first_name ? 'su_first_err' : undefined}
                  />
                </div>
                {errors.first_name && <div className="lp-field-error" id="su_first_err" role="alert">{errors.first_name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_last">Last name <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <input
                    className="form-control"
                    id="su_last"
                    name="last_name"
                    type="text"
                    placeholder="Last name"
                    value={form.last_name}
                    onChange={handleChange}
                    autoComplete="family-name"
                    aria-invalid={!!errors.last_name}
                    aria-describedby={errors.last_name ? 'su_last_err' : undefined}
                  />
                </div>
                {errors.last_name && <div className="lp-field-error" id="su_last_err" role="alert">{errors.last_name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_pass">Password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    id="su_pass"
                    name="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby="su_pass_hint"
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
                {errors.password ? (
                  <div className="lp-field-error" id="su_pass_hint" role="alert">{errors.password}</div>
                ) : (
                  <div className="lp-field-hint" id="su_pass_hint">
                    Min 8 characters with uppercase, lowercase, number, and special character.
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_confirm">Confirm password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    id="su_confirm"
                    name="confirm_password"
                    placeholder="Re-enter your password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirm_password}
                    aria-describedby={errors.confirm_password ? 'su_confirm_err' : undefined}
                  />
                </div>
                {errors.confirm_password && <div className="lp-field-error" id="su_confirm_err" role="alert">{errors.confirm_password}</div>}
              </div>

              <button className="btn lp-submit w-100" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : (
                  <><span>Sign Up</span><i className="ri-arrow-right-line" aria-hidden="true" /></>
                )}
              </button>
            </form>

            <div className="lp-divider" aria-hidden="true">
              <span className="lp-divider-line" />
              <i className="ri-shield-check-line" />
              <span className="lp-divider-line" />
            </div>

            <p className="lp-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="lp-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
