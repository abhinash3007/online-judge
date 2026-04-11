import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from'react-router-dom';
const VITE_API_URL = import.meta.env.VITE_API_URL;
const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [focused, setFocused] = useState(null)
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      if(email === '' || password === '' || email.length>50 || password.length > 50) {
        setError('Please fill in all fields')
        return;
      }

      if (!isValidEmail(email)) {
        setError("Please enter a valid email");
        return;
      }

      const response = await axios.post(`${VITE_API_URL}/api/auth/login`, { email, password })
      console.log('Login successful:', response.data)
      if(response.status == 200) { 
        navigate('/');
      }
    } catch (err) {
      console.error('Login failed:', err)
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .judge-root {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Subtle grid background */
        .judge-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Glow blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.18;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: #5b6ef5;
          top: -120px; left: -120px;
          animation: blobdrift 14s ease-in-out infinite alternate;
        }
        .blob-2 {
          width: 380px; height: 380px;
          background: #a259ff;
          bottom: -80px; right: -80px;
          animation: blobdrift 18s ease-in-out infinite alternate-reverse;
        }
        @keyframes blobdrift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.06); }
        }

        .card {
          position: relative;
          z-index: 1;
          width: 440px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 48px 44px 44px;
          backdrop-filter: blur(24px);
          animation: cardin 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardin {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(91,110,245,0.15);
          border: 1px solid rgba(91,110,245,0.3);
          border-radius: 999px;
          padding: 4px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #8b9cf7;
          letter-spacing: 0.04em;
          margin-bottom: 28px;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #5b6ef5;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }

        .heading {
          font-size: 32px;
          font-weight: 800;
          color: #f0f0f8;
          line-height: 1.1;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }
        .heading span {
          background: linear-gradient(120deg, #7b8ff7, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subheading {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.28);
          margin-bottom: 36px;
          letter-spacing: 0.02em;
        }

        .field {
          margin-bottom: 16px;
        }
        .field-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
          transition: color 0.2s;
        }
        .field.is-focused .field-label {
          color: #8b9cf7;
        }

        .input-wrap {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          font-size: 14px;
          transition: color 0.2s;
          pointer-events: none;
          font-family: 'JetBrains Mono', monospace;
        }
        .field.is-focused .input-icon {
          color: #8b9cf7;
        }

        .input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 13px 14px 13px 40px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #e8e8f0;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          caret-color: #7b8ff7;
        }
        .input::placeholder { color: rgba(255,255,255,0.18); }
        .input:focus {
          border-color: rgba(91,110,245,0.5);
          background: rgba(91,110,245,0.06);
          box-shadow: 0 0 0 3px rgba(91,110,245,0.1);
        }

        .forgot {
          display: block;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          margin-top: 10px;
          margin-bottom: 28px;
          transition: color 0.2s;
        }
        .forgot:hover { color: #8b9cf7; }

        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #f87171;
          animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(3px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }

        .btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #5b6ef5, #8b5cf6);
          border: none;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
        }
        .btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn:hover:not(:disabled)::after { opacity: 1; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); }
        .btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .divider-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
        }

        .register-row {
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.3);
        }
        .register-link {
          color: #8b9cf7;
          text-decoration: none;
          font-weight: 600;
          margin-left: 6px;
          transition: color 0.2s;
        }
        .register-link:hover { color: #c084fc; }

        /* Bottom stats bar */
        .stats {
          display: flex;
          justify-content: space-between;
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .stat {
          text-align: center;
        }
        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          color: #f0f0f8;
        }
        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          margin-top: 2px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="judge-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        <div className="card">
          <div className="badge">
            <div className="badge-dot" />
            Clash of Coders
          </div>

          <h1 className="heading">
            Welcome<br />back, <span>coder.</span>
          </h1>
          <p className="subheading">$ authenticate --session new</p>

          <div className={`field ${focused === 'email' ? 'is-focused' : ''}`}>
            <label className="field-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon">@</span>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
              />
            </div>
          </div>

          <div className={`field ${focused === 'password' ? 'is-focused' : ''}`}>
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">#</span>
              <input
                type="password"
                className="input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-box">
              <span className='cursor-pointer' onClick={() => setError(null)}>✕</span>
              {error}
            </div>
          )}

          <button className="btn" onClick={handleLogin} disabled={loading}>
            <div className="btn-inner">
              {loading && <div className="spinner" />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </div>
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <div className="register-row">
            New here?
            <Link to="/register" className="register-link">
              Create account →
            </Link>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-value">2.4M+</div>
              <div className="stat-label">submissions</div>
            </div>
            <div className="stat">
              <div className="stat-value">18K+</div>
              <div className="stat-label">problems</div>
            </div>
            <div className="stat">
              <div className="stat-value">340K+</div>
              <div className="stat-label">coders</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login