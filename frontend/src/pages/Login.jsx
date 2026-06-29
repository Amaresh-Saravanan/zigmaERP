import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import client from '../api/client';
import Swal from 'sweetalert2';
// We'll use the specific logo that matches the screenshot (green bug, white text)
import logoImg from '../assets/images/zig-fly-logo.png';
import bgImg from '../assets/images/auth-one-bg.jpg';

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
          window.particlesJS("auth-particles", {
            particles: {
              number: { value: 90, density: { enable: true, value_area: 800 } },
              color: { value: "#ffffff" },
              shape: {
                type: "circle",
                stroke: { width: 0, color: "#000000" },
                polygon: { nb_sides: 5 }
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
            retina_detect: true
          });
        }
      })
      .then(() => loadScript('/assets/js/pages/password-addon.init.js'))
      .catch(err => console.error('Failed to load script', err));
      
    return () => {};
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
        icon: 'warning',
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
          icon: 'error',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        throw new Error('Database connection failed');
      }
    } catch {
      // Demo mode fallback
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

  // Fallback if logo fails to load to a known good one
  const handleLogoError = (e) => {
    // If the primary zig-fly-logo.png fails, fallback to logo-white.png
    if (e.target.src.includes('zig-fly-logo.png')) {
      e.target.src = '../assets/images/logo-white.png';
    }
  };

  return (
    <div className="auth-page-wrapper pt-5" onKeyUp={handleKey}>
      {/* Background Particles & Shape */}
      <div 
        className="auth-one-bg-position auth-one-bg" 
        id="auth-particles" 
        style={{ backgroundImage: `url(${bgImg})` }}
      >
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
                    <img src={logoImg} onError={handleLogoError} alt="Zigfly Logo" height="85" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card mt-4 glass-card">
                <div className="card-body p-4 p-sm-5">
                  <div className="text-center mt-2 mb-4">
                    <h5 className="welcome-title">Welcome Back !</h5>
                    <p className="welcome-subtitle">Sign in to continue to Zigfly.</p>
                  </div>
                  <div className="p-2">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label custom-label" htmlFor="user_name">Username</label>
                        <input
                          className="form-control custom-input"
                          id="user_name"
                          name="user"
                          type="text"
                          value={form.user}
                          onChange={handleChange}
                          autoFocus
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label custom-label" htmlFor="password">Password</label>
                        <div className="position-relative auth-pass-inputgroup">
                          <input
                            type={showPass ? 'text' : 'password'}
                            className="form-control custom-input pe-5 password-input"
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
                            <i className={showPass ? 'ri-eye-off-fill align-middle fs-5' : 'ri-eye-fill align-middle fs-5'} aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-5">
                        <button
                          className="btn custom-btn w-100"
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
        body {
          font-family: "Inter", sans-serif !important;
          background-color: #ffffff;
        }
        
        .auth-one-bg {
          height: 380px;
          background-position: center;
          background-size: cover;
          position: relative;
        }
        
        .auth-one-bg .bg-overlay {
          background: linear-gradient(to right, rgba(14, 25, 34, 0.5), rgba(18, 38, 51, 0.4));
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 1;
        }
        
        .auth-one-bg .shape {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          z-index: 1;
          pointer-events: none;
        }
        
        .auth-one-bg .shape > svg {
          width: 100%;
          height: auto;
          fill: #ffffff;
        }

        /* Glassmorphism Card styling matching the reference image */
        .glass-card {
          background: rgba(255, 255, 255, 0.25) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(132, 199, 169, 0.6) !important;
          border-radius: 16px !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
          overflow: hidden;
        }

        .welcome-title {
          color: #ffffff !important;
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          color: #e2e8f0 !important;
          font-size: 0.95rem;
        }

        .custom-label {
          color: #1e293b !important;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        /* Inputs styled exactly like the screenshot */
        .custom-input {
          background-color: rgba(220, 237, 230, 0.8) !important;
          border: 1px solid #73bda1 !important;
          border-radius: 8px !important;
          padding: 0.65rem 1rem !important;
          color: #0f172a !important;
          font-weight: 500;
          height: 45px;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.02) !important;
          transition: all 0.2s ease;
        }

        .custom-input:focus {
          background-color: #ffffff !important;
          border-color: #27a87c !important;
          box-shadow: 0 0 0 3px rgba(39, 168, 124, 0.25) !important;
        }

        .password-addon {
          height: 45px;
          padding: 0 1rem;
          color: #64748b !important;
          z-index: 10;
        }

        /* Submit Button */
        .custom-btn {
          background-color: #2da97f !important;
          border-color: #2da97f !important;
          color: white !important;
          border-radius: 30px !important; /* Pill shape */
          height: 45px;
          font-weight: 500;
          font-size: 1rem;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 10px rgba(45, 169, 127, 0.3) !important;
          transition: all 0.2s ease;
        }

        .custom-btn:hover {
          background-color: #24906b !important;
          border-color: #24906b !important;
          transform: translateY(-1px);
        }

        /* Footer */
        footer.footer {
          background-color: transparent !important;
          border-top: none !important;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px 0 !important;
          font-family: inherit !important;
          color: #64748b;
        }
        
        .footer-border {
          border-top: 1px solid rgba(0,0,0,0.05);
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
      
      <footer className="footer">
        <div className="footer-border"></div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-6 text-sm-start text-center">
              <p className="mb-0 text-muted">{new Date().getFullYear()} © Zigfly.</p>
            </div>
            <div className="col-sm-6 text-sm-end text-center">
              <p className="mb-0 text-muted">Design & Develop by <span style={{color: '#2da97f'}}>Zigma</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}