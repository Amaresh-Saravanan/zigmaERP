import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName || !password) {
      setError('Please fill in both fields.');
      return;
    }

    // Mock authentication
    const mockUser = {
      user_id: '123',
      userName: userName,
      roleName: userName.toLowerCase() === 'admin' ? 'Administrator' : 'Operator',
      sess_user_type: userName.toLowerCase() === 'admin' ? '6213273aa04b228161' : 'operator',
    };

    onLogin(mockUser);
    navigate('/dashboard');
  };

  return (
    <div className="auth-page-wrapper d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="auth-page-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div className="card mt-4 shadow-lg border-0">
                <div className="card-body p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary font-weight-bold">Welcome Back!</h5>
                    <p className="text-muted">Sign in to continue to Zigma ERP.</p>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="p-2 mt-4">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                          Username
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="username"
                          placeholder="Enter username (e.g., admin)"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="password-input">
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password-input"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div className="mt-4">
                        <button className="btn btn-success w-100" type="submit">
                          Sign In
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
    </div>
  );
}
