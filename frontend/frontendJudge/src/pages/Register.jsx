import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const [step, setStep] = useState(0) // animate fields in sequence

  const VITE_API_URL = import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  const handleClick = async () => {
    if (!name || !email || !password) {
      setError('All fields are required.')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await axios.post(`${VITE_API_URL}/api/auth/register`, { name, email, password })
      if (response.status === 201) {
        console.log('Registration successful:', response.data)
        navigate('/')
      }
    } catch (err) {
      console.error('Registration failed:', err)
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleClick()
  }

  const strengthScore = (pw) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const strength = strengthScore(password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .reg-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          opacity: 0.16;
        }
        .blob-1 {
          width: 480px; height: 480px;
          background: #8b5cf6;
          top: -100px; right: -100px;
          animation: blobdrift 16s ease-in-out infinite alternate;
        }
        .blob-2 {
          width: 360px; height: 360px;
          background: #5b6ef5;
          bottom: -80px; left: -80px;
          animation: blobdrift 20s ease-in-out infinite alternate-reverse;
        }
        @keyframes blobdrift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(24px, 18px) scale(1.07); }
        }

        .card {
          position: relative;
          z-index: 1;
          width: 460px;
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

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 999px;
          padding: 4px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #c084fc;
          letter-spacing: 0.04em;
          margin-bottom: 28px;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #a855f7;
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
          background: linear-gradient(120deg, #c084fc, #7b8ff7);
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
        .field.is-focused .field-label { color: #c084fc; }

        .input-wrap { position: relative; }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          font-size: 13px;
          transition: color 0.2s;
          pointer-events: none;
          font-family: 'JetBrains Mono', monospace;
        }
        .field.is-focused .input-icon { color: #c084fc; }

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
          caret-color: #c084fc;
        }
        .input::placeholder { color: rgba(255,255,255,0.18); }
        .input:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }

        /* Password strength bar */
        .strength-wrap {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        .strength-bar {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: rgba(255,255,255,0.07);
          transition: background 0.3s;
        }
        .strength-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          min-width: 40px;
          text-align: right;
          transition: color 0.3s;
        }

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
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
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

        /* Terms line */
        .terms {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.18);
          text-align: center;
          margin-top: 14px;
          line-height: 1.6;
        }
        .terms a {
          color: rgba(192,132,252,0.6);
          text-decoration: none;
          transition: color 0.2s;
        }
        .terms a:hover { color: #c084fc; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 26px 0;
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

        .login-row {
          text-align: center;
          font-size: 14px;
          color: rgba(255,255,255,0.3);
        }
        .login-link {
          color: #8b9cf7;
          text-decoration: none;
          font-weight: 600;
          margin-left: 6px;
          transition: color 0.2s;
        }
        .login-link:hover { color: #c084fc; }

        /* Perks row */
        .perks {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .perk {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
        }
        .perk-icon {
          font-size: 12px;
        }
      `}</style>

      <div className="reg-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        <div className="card">
          <div className="badge">
            <div className="badge-dot" />
            NEW_ACCOUNT
          </div>

          <h1 className="heading">
            Join the<br /><span>arena.</span>
          </h1>
          <p className="subheading">$ create --user new --rank unranked</p>

          <div className={`field ${focused === 'name' ? 'is-focused' : ''}`}>
            <label className="field-label">Handle</label>
            <div className="input-wrap">
              <span className="input-icon">~/</span>
              <input
                type="text"
                className="input"
                placeholder="your_username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
              />
            </div>
            {password.length > 0 && (
              <div className="strength-wrap">
                <div className="strength-bars">
                  {[1,2,3,4].map(i => (
                    <div
                      key={i}
                      className="strength-bar"
                      style={{ background: i <= strength ? strengthColors[strength] : undefined }}
                    />
                  ))}
                </div>
                <span
                  className="strength-label"
                  style={{ color: strengthColors[strength] }}
                >
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="error-box">
              <span className='cursor-pointer' onClick={() => setError(null)}>✕</span>
              {error}
            </div>
          )}

          <button className="btn" onClick={handleClick} disabled={loading}>
            <div className="btn-inner">
              {loading && <div className="spinner" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </div>
          </button>

          <p className="terms">
            By registering you agree to our{' '}
            <a href="#">Terms of Service</a>
            {' '}and{' '}
            <a href="#">Privacy Policy</a>
          </p>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">already competing?</span>
            <div className="divider-line" />
          </div>

          <div className="login-row">
            Have an account?
            <Link to="/login" className="login-link">Sign in →</Link>
          </div>

          <div className="perks">
            <div className="perk"><span className="perk-icon">⚡</span>instant judge</div>
            <div className="perk"><span className="perk-icon">🔒</span>secure sandbox</div>
            <div className="perk"><span className="perk-icon">🏆</span>global rank</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register