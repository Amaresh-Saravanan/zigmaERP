import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import client from '../api/client';
import Swal from 'sweetalert2';
import logoImg from '../assets/images/logo-white.png';

import { useEffect } from 'react';

export default function Login() {
  // Load legacy scripts for layout and particle animations
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });
    };
    // Load scripts sequentially to ensure proper initialization order
    loadScript('/assets/js/layout.js')
      .then(() => loadScript('/assets/libs/particles.js/particles.js'))
      .then(() => loadScript('/assets/js/pages/particles.app.js'))
      .then(() => loadScript('/assets/js/pages/password-addon.init.js'))
      .catch(err => console.error('Failed to load script', err));
    // Cleanup on unmount
    return () => {
      // Remove injected scripts if needed (optional)
    };
  }, []);

  const [form, setForm] = useState({ user: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    try {
      const res = await client.post('folders/login/crud.php', new URLSearchParams({
        action: 'login', user: form.user, password: form.password
      }));
      if (res.data?.status === 1) {
        if (form.password === 'password') {
          navigate('/password/update?default=true');
          return;
        }
        login(res.data.user);
        navigate('/');
      } else {
        Swal.fire({
          title: 'Incorrect UserName and Password',
          imageUrl: 'img/emoji/invalid.webp',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Network Error Occured',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div className="auth-page-wrapper pt-5" onKeyUp={handleKey}>
      <div className="auth-one-bg-position auth-one-bg" id="auth-particles">
        <div className="bg-overlay"></div>
        <div className="shape">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 1440 120">
            <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
          </svg>
        </div>
      </div>

      <div className="auth-page-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <div>
                  <a href="/" className="d-inline-block auth-logo">
                    <img src={logoImg} alt="" height="100" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card mt-4 card-bg-fill">
                <div className="card-body p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Welcome Back !</h5>
                    <p className="text-muted">Sign in to continue to Zigfly.</p>
                  </div>
                  <div className="p-2 mt-4">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="user_name">Username</label>
                        <input
                          className="form-control"
                          id="user_name"
                          name="user"
                          type="text"
                          value={form.user}
                          onChange={handleChange}
                          autoFocus
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="password">Password</label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <input
                            type={showPass ? 'text' : 'password'}
                            className="form-control pe-5 password-input"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                          />
                          <button
                            type="button"
                            className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon material-shadow-none"
                            id="password-addon"
                            onClick={() => setShowPass(!showPass)}
                          >
                            <i className={showPass ? 'ri-eye-off-fill align-middle' : 'ri-eye-fill align-middle'}></i>
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          className="btn btn-success w-100"
                          type="submit"
                          id="login-submit"
                          disabled={loading}
                        >
                          {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`footer.footer { position: absolute; bottom: 0; left: 0; width: 100%; }`}</style>
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} Zigfly. Crafted with <i className="mdi mdi-heart text-danger"></i> to zigma</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}