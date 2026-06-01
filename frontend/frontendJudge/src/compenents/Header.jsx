import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../utils/authSlice' // adjust path to your slice
const NAV_LINKS = [
    { label: 'problems', to: '/questions' },
    { label: 'contests', to: '/contests' },
    { label: 'leaderboard', to: '/leaderboard' },
]

export default function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector(s => s.auth)

    const [dropOpen, setDropOpen] = useState(false)
    const dropRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setDropOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Close dropdown on route change
    useEffect(() => { setDropOpen(false) }, [location.pathname])

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    // Derived state
    const isCodingPage = location.pathname.startsWith('/questions/') &&
        location.pathname !== '/questions'
    const isAdminPage = location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/create')
    const isAuthPage = ['/login', '/register'].includes(location.pathname)

    // Avatar initials from name
    const initials = user?.name
        ? user.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?'

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

        .hdr {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 52px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          background: rgba(10,10,15,0.8);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-family: 'Syne', sans-serif;
        }

        /* ── LEFT ── */
        .hdr-left { display: flex; align-items: center; gap: 32px; }
        .hdr-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 600;
          color: #f0f0f8; text-decoration: none;
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }
        .hdr-logo-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #8b5cf6;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }

        .hdr-nav { display: flex; align-items: center; gap: 4px; }
        .hdr-nav-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: .04em;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          padding: 5px 10px; border-radius: 6px;
          transition: color .2s, background .2s;
        }
        .hdr-nav-link:hover  { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }
        .hdr-nav-link.active { color: #c084fc; background: rgba(139,92,246,0.1); }

        /* Admin badge */
        .admin-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 600; letter-spacing: .08em;
          padding: 3px 10px; border-radius: 999px;
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.25);
          color: #fbbf24;
        }

        /* Breadcrumb for coding page */
        .hdr-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.25);
        }
        .hdr-breadcrumb a { color: rgba(255,255,255,0.3); text-decoration: none; transition: color .2s; }
        .hdr-breadcrumb a:hover { color: #c084fc; }
        .hdr-breadcrumb-sep { opacity: .3; }

        /* ── RIGHT ── */
        .hdr-right { display: flex; align-items: center; gap: 10px; }

        /* Sign in / Register buttons */
        .btn-ghost {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: rgba(255,255,255,0.4);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 7px 16px;
          text-decoration: none; cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); }

        .btn-cta {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
          border: none; border-radius: 8px; padding: 7px 18px;
          text-decoration: none; cursor: pointer;
          transition: opacity .2s, transform .15s;
          white-space: nowrap;
        }
        .btn-cta:hover { opacity: .88; transform: translateY(-1px); }

        /* ── USER AVATAR + DROPDOWN ── */
        .hdr-user { position: relative; }

        .avatar-btn {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 4px 14px 4px 4px;
          cursor: pointer;
          transition: border-color .2s, background .2s;
        }
        .avatar-btn:hover {
          border-color: rgba(139,92,246,0.4);
          background: rgba(139,92,246,0.07);
        }
        .avatar-btn.open {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.1);
        }

        .avatar-circle {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 800;
          color: #fff; flex-shrink: 0;
          user-select: none;
        }

        .avatar-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: rgba(255,255,255,0.7);
          max-width: 120px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .avatar-chevron {
          font-size: 10px; color: rgba(255,255,255,0.3);
          transition: transform .2s;
          margin-left: 2px;
        }
        .avatar-btn.open .avatar-chevron { transform: rotate(180deg); }

        /* Dropdown */
        .hdr-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          min-width: 220px;
          background: rgba(18,18,28,0.97);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 6px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: dropin .18s cubic-bezier(.22,1,.36,1) both;
          z-index: 300;
        }
        @keyframes dropin {
          from { opacity:0; transform:translateY(-8px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .drop-header {
          padding: 10px 12px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 4px;
        }
        .drop-user-name {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700; color: #f0f0f8;
        }
        .drop-user-email {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: rgba(255,255,255,0.28);
          margin-top: 2px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        .drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: rgba(255,255,255,0.45);
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          transition: background .15s, color .15s;
        }
        .drop-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .drop-item.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }
        .drop-item-icon { font-size: 13px; width: 18px; text-align: center; flex-shrink: 0; }

        .drop-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 4px 6px;
        }

        /* Spacer so page content clears the fixed header */
        .hdr-spacer { height: 52px; }
      `}</style>

            <header className="hdr">
                {/* ── LEFT ── */}
                <div className="hdr-left">
                    <Link to="/" className="hdr-logo">
                        <div className="hdr-logo-dot" />
                        JUDGE.IO
                    </Link>

                    {/* Admin badge */}
                    {isAdminPage && (
                        <span className="admin-badge">ADMIN</span>
                    )}

                    {/* Breadcrumb on coding page */}
                    {isCodingPage && (
                        <div className="hdr-breadcrumb">
                            <Link to="/questions">problems</Link>
                            <span className="hdr-breadcrumb-sep">/</span>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>solving</span>
                        </div>
                    )}

                    {/* Nav links — hide on auth pages and coding page */}
                    {!isAuthPage && !isCodingPage && (
                        <nav className="hdr-nav">
                            {NAV_LINKS.map(({ label, to }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`hdr-nav-link ${location.pathname === to ? 'active' : ''}`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>

                {/* ── RIGHT ── */}
                <div className="hdr-right">
                    {!(isAuthenticated && user) ? (
                        <>
                            {/* Don't show Sign In on the login page, don't show Register on register page */}
                            {location.pathname !== '/login' && (
                                <Link to="/login" className="btn-ghost">Sign In</Link>
                            )}
                            {location.pathname !== '/register' && (
                                <Link to="/register" className="btn-cta">Start Coding</Link>
                            )}
                        </>
                    ) : (
                        <div className="hdr-user" ref={dropRef}>
                            {/* Avatar button */}
                            <button
                                className={`avatar-btn ${dropOpen ? 'open' : ''}`}
                                onClick={() => setDropOpen(o => !o)}
                            >
                                <div className="avatar-circle">{initials}</div>
                                <span className="avatar-name">{user.name}</span>
                                <span className="avatar-chevron">▼</span>
                            </button>

                            {/* Dropdown */}
                            {dropOpen && (
                                <div className="hdr-dropdown">
                                    <div className="drop-header">
                                        <div className="drop-user-name">{user.name}</div>
                                        <div className="drop-user-email">{user.email}</div>
                                    </div>

                                    <Link to="/profile" className="drop-item">
                                        <span className="drop-item-icon">◎</span>
                                        Profile
                                    </Link>
                                    <Link to="/submissions" className="drop-item">
                                        <span className="drop-item-icon">⚡</span>
                                        My Submissions
                                    </Link>
                                    <Link to="/create-question" className="drop-item">
                                        <span className="drop-item-icon">+</span>
                                        Create Problem
                                    </Link>

                                    <div className="drop-divider" />

                                    <button className="drop-item danger" onClick={handleLogout}>
                                        <span className="drop-item-icon">→</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Pushes page content below fixed header */}
            <div className="hdr-spacer" />
        </>
    )
}