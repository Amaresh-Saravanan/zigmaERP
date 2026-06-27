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
      .then(() => {
        if (window.particlesJS) {
          // ponytail: load particle config directly here rather than fetching external particles.app.js
          window.particlesJS("auth-particles", {
            particles: {
              number: { value: 90, density: { enable: true, value_area: 800 } },
              color: { value: "#ffffff" },
              shape: {
                type: "circle",
                stroke: { width: 0, color: "#000000" },
                polygon: { nb_sides: 5 },
                image: { src: "img/github.svg", width: 100, height: 100 }
              },
              opacity: {
                value: 0.8,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0, sync: false }
              },
              size: {
                value: 4,
                random: true,
                anim: { enable: false, speed: 4, size_min: 0.2, sync: false }
              },
              line_linked: {
                enable: false,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
              },
              move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
              }
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: { enable: true, mode: "bubble" },
                onclick: { enable: true, mode: "repulse" },
                resize: true
              },
              modes: {
                grab: { distance: 400, line_linked: { opacity: 1 } },
                bubble: { distance: 400, size: 4, duration: 2, opacity: 0.8, speed: 3 },
                repulse: { distance: 200 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 }
              }
            },
            retina_detect: true,
            config_demo: {
              hide_card: false,
              background_color: "#b61924",
              background_image: "",
              background_position: "50% 50%",
              background_repeat: "no-repeat",
              background_size: "cover"
            }
          });
        }
      })
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
        action: 'login', user_name: form.user, password: form.password
      }), { suppressError: true });
      if (res.data?.status === 1) {
        if (form.password === 'password') {
          navigate('/password/update?default=true');
          return;
        }
        login(res.data.user);
        navigate('/');
      } else if (res.data?.msg === 'incorrect') {
        Swal.fire({
          title: 'Incorrect UserName and Password',
          imageUrl: 'img/emoji/invalid.webp',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        // ponytail: activate demo mode on API/DB failure
        throw new Error('Database connection failed');
      }
    } catch {
      // Demo mode: bypass API when database is not connected
      const demoCredentials = { user: 'admin', password: 'admin123' };
      if (form.user === demoCredentials.user && form.password === demoCredentials.password) {
        const demoUser = {
          userId: 'demo001',
          userName: form.user,
          userType: '5f97fc3257f2525529',
          userImage: 'img/user.jpg',
          companyName: 'Zigma Global Environ Solutions',
          mainScreens: [],
          sections: [],
          screens: []
        };
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
                  <a href="/" className="d-inline-block auth-logo" aria-label="Zigfly home">
                    <img src={logoImg} alt="" aria-hidden="true" height="100" />
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
                            aria-label={showPass ? 'Hide password' : 'Show password'}
                          >
                            <i className={showPass ? 'ri-eye-off-fill align-middle' : 'ri-eye-fill align-middle'} aria-hidden="true"></i>
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

      <style>{`
        .auth-page-wrapper .card-bg-fill {
          background-color: #05192f !important;
          border: 1px solid #2a4562 !important;
          box-shadow: 0 5px 10px rgba(30, 32, 37, 0.3) !important;
          font-family: "Poppins", sans-serif !important;
        }
        footer.footer {
          background-color: #fff !important;
          border-top: 1px solid #e2e8f0 !important;
          font-family: inherit !important;
          display: flex !important;
          align-items: center !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        footer.footer .container,
        footer.footer .row {
          width: 100%;
          height: 100%;
          min-height: 100%;
        }
        footer.footer .row {
          align-items: center;
        }
      `}</style>
      <footer className="footer">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-6">
              <p className="mb-0 text-muted">{new Date().getFullYear()} © Zigfly.</p>
            </div>
            <div className="col-sm-6">
              <div className="text-sm-end d-none d-sm-block text-muted">
                Design & Develop by Zigma
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}