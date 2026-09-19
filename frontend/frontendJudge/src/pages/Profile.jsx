import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/api'

// /profile        → the logged-in user's own profile
// /profile/:id    → any user's profile, loaded from GET /api/auth/getUser/:id
const Profile = () => {
  const { id: routeId } = useParams()
  const me = useSelector(s => s.auth.user)
  const myId = me?.id || me?._id
  const userId = routeId || myId
  const isOwn = Boolean(myId) && userId === myId

  // The last finished request, tagged with the id it was for. "Loading" is derived from it, so a
  // response for a previous id never shows up under a new one.
  const [result, setResult] = useState({ id: null, user: null, error: null })

  useEffect(() => {
    if (!userId) return

    let cancelled = false // ignore a slow response if the id changed meanwhile
    api.get(`/api/auth/getUser/${userId}`)
      .then(({ data }) => {
        if (!cancelled) setResult({ id: userId, user: data.user, error: null })
      })
      .catch(err => {
        if (cancelled) return
        console.error('getUser error:', err)
        setResult({
          id: userId,
          user: null,
          error: err.response?.status === 404
            ? 'User not found.'
            : err.response?.data?.message || 'Failed to load this profile. Is the server running?',
        })
      })
    return () => { cancelled = true }
  }, [userId])

  const loading = Boolean(userId) && result.id !== userId
  const user = result.id === userId ? result.user : null
  const error = userId ? (result.id === userId ? result.error : null) : 'No user selected.'

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const stats = user ? [
    { label: 'Points', value: user.points ?? 0, color: '#c084fc' },
    { label: 'Problems solved', value: user.solvedProblems?.length ?? 0, color: '#22c55e' },
    { label: 'Total submissions', value: user.totalSubmissions ?? 0, color: '#60a5fa' },
    { label: 'Correct submissions', value: user.correctSubmissions ?? 0, color: '#f97316' },
  ] : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

        .pf-root {
          min-height: calc(100vh - 52px);
          background: #0a0a0f;
          font-family: 'Syne', sans-serif;
          color: #e8e8f0;
          padding: 48px 20px 60px;
        }
        .pf-wrap { max-width: 760px; margin: 0 auto; }

        .pf-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px;
        }

        .pf-head { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .pf-avatar {
          width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: #fff; user-select: none;
          overflow: hidden;
        }
        .pf-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pf-name { font-size: 26px; font-weight: 800; color: #f0f0f8; word-break: break-word; }
        .pf-email {
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          color: rgba(255,255,255,0.35); margin-top: 4px; word-break: break-all;
        }
        .pf-badges { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .pf-badge {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 999px;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); color: #c084fc;
        }
        .pf-badge.admin { background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.25); color: #fbbf24; }

        .pf-stats {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px; margin-top: 24px;
        }
        .pf-stat {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 16px;
        }
        .pf-stat-value { font-size: 28px; font-weight: 800; line-height: 1.1; }
        .pf-stat-label {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(255,255,255,0.3); margin-top: 6px;
        }

        .pf-actions { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .pf-link {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; text-decoration: none;
          color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 8px 16px; transition: all .2s;
        }
        .pf-link:hover { color: #c084fc; border-color: rgba(139,92,246,0.4); background: rgba(139,92,246,0.07); }

        .pf-state {
          text-align: center; padding: 60px 0;
          font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.35);
        }
        .pf-state.error { color: #f87171; }
        .pf-spinner {
          width: 22px; height: 22px; margin: 0 auto 14px;
          border: 2px solid rgba(139,92,246,0.25); border-top-color: #8b5cf6;
          border-radius: 50%; animation: pf-spin .8s linear infinite;
        }
        @keyframes pf-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="pf-root">
        <div className="pf-wrap">
          {loading && (
            <div className="pf-state">
              <div className="pf-spinner" />
              loading profile...
            </div>
          )}

          {!loading && error && (
            <div className="pf-state error">
              {error}
              <div style={{ marginTop: 16 }}>
                <Link to="/questions" className="pf-link">← back to problems</Link>
              </div>
            </div>
          )}

          {!loading && !error && user && (
            <div className="pf-card">
              <div className="pf-head">
                <div className="pf-avatar">
                  {user.photoUrl ? <img src={user.photoUrl} alt={user.name} /> : initials}
                </div>
                <div>
                  <div className="pf-name">{user.name}</div>
                  {/* Email is shown only on your own profile */}
                  {isOwn && <div className="pf-email">{user.email}</div>}
                  <div className="pf-badges">
                    <span className={`pf-badge ${user.role === 'admin' ? 'admin' : ''}`}>{user.role}</span>
                    {isOwn && <span className="pf-badge">you</span>}
                  </div>
                </div>
              </div>

              <div className="pf-stats">
                {stats.map(s => (
                  <div className="pf-stat" key={s.label}>
                    <div className="pf-stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="pf-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="pf-actions">
                <Link to="/questions" className="pf-link">Browse problems</Link>
                {isOwn && <Link to="/submissions" className="pf-link">My submissions</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Profile
