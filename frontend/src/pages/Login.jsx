import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import client from '../api/client';

export default function Login() {
  const [form, setForm] = useState({ user_name: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.user_name || !form.password) {
      import('sweetalert2').then(({ default: Swal }) =>
        Swal.fire({ title: 'Enter Username and Password!', icon: 'info', timer: 2000 })
      );
      return;
    }
    setLoading(true);
    try {
      const res = await client.post('folders/login/crud.php', new URLSearchParams({
        action: 'login', user_name: form.user_name, password: form.password
      }));
      if (res.data?.status === 1) {
        if (form.password === 'password') {
          navigate('/password/update?default=true');
          return;
        }
        login(res.data.user);
        navigate('/');
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
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1440 120">
            <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
          </svg>
        </div>
      </div>

      <div className="auth-page-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <a href="/" className="d-inline-block auth-logo">
                  <img src="/assets/images/logo-white.png" alt="Zigfly" height="100" />
                </a>
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
                          name="user_name"
                          type="text"
                          value={form.user_name}
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

      <footer className="footer" style={{left:0}}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0 text-muted">
                  &copy; {new Date().getFullYear()} Zigfly. Crafted with{' '}
                  <i className="mdi mdi-heart text-danger"></i> by Zigma
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}