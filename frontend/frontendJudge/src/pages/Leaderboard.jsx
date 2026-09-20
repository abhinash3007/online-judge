import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/api'

// Both rankings come back already sorted, best first. Note the two endpoints use different keys.
const BOARDS = [
  {
    key: 'points',
    label: 'Most points',
    unit: 'pts',
    url: '/api/auth/mostPoints',
    pick: data => data.users,
    value: u => u.points ?? 0,
  },
  {
    key: 'correct',
    label: 'Most correct submissions',
    unit: 'correct',
    url: '/api/auth/correctSubmissions',
    pick: data => data.user,
    value: u => u.correctSubmissions ?? 0,
  },
]

const MEDALS = ['🥇', '🥈', '🥉']

// Competition ranking: users with the same score share a rank (1, 2, 2, 4, ...).
const withRanks = (list, value) => {
  let rank = 0
  return list.map((u, i) => {
    if (i === 0 || value(u) !== value(list[i - 1])) rank = i + 1
    return { ...u, rank }
  })
}

const Leaderboard = () => {
  const me = useSelector(s => s.auth.user)
  const myId = me?.id || me?._id

  const [tab, setTab] = useState(BOARDS[0].key)
  // One entry per board: { list } once loaded, { error } if it failed, absent while loading.
  const [boards, setBoards] = useState({})

  useEffect(() => {
    let cancelled = false
    BOARDS.forEach(b => {
      api.get(b.url)
        .then(({ data }) => {
          if (!cancelled) setBoards(prev => ({ ...prev, [b.key]: { list: b.pick(data) || [] } }))
        })
        .catch(err => {
          if (cancelled) return
          console.error(`leaderboard ${b.key} error:`, err)
          setBoards(prev => ({
            ...prev,
            [b.key]: { error: err.response?.data?.message || 'Failed to load the leaderboard. Is the server running?' },
          }))
        })
    })
    return () => { cancelled = true }
  }, [])

  const board = BOARDS.find(b => b.key === tab)
  const state = boards[tab]
  const rows = state?.list ? withRanks(state.list, board.value) : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

        .lb-root {
          min-height: calc(100vh - 52px);
          background: #0a0a0f;
          font-family: 'Syne', sans-serif;
          color: #e8e8f0;
          padding: 48px 20px 60px;
        }
        .lb-wrap { max-width: 720px; margin: 0 auto; }
        .lb-title { font-size: 30px; font-weight: 800; color: #f0f0f8; }
        .lb-sub {
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          color: rgba(255,255,255,0.35); margin: 6px 0 24px;
        }

        .lb-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .lb-tab {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; cursor: pointer;
          padding: 8px 16px; border-radius: 8px;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4); transition: all .2s;
        }
        .lb-tab:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.25); }
        .lb-tab.active { color: #c084fc; background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.4); }

        .lb-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden;
        }
        .lb-row {
          display: flex; align-items: center; gap: 16px;
          padding: 14px 20px; text-decoration: none; color: inherit;
          border-top: 1px solid rgba(255,255,255,0.05);
          transition: background .15s;
        }
        .lb-row:first-child { border-top: none; }
        .lb-row:hover { background: rgba(139,92,246,0.07); }
        .lb-row.me { background: rgba(139,92,246,0.1); }

        .lb-rank {
          width: 34px; flex-shrink: 0; text-align: center;
          font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.4);
        }
        .lb-rank.medal { font-size: 20px; }
        .lb-avatar {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #fff; user-select: none;
        }
        .lb-name {
          flex: 1; min-width: 0; font-size: 15px; font-weight: 700; color: #f0f0f8;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .lb-you {
          font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase; margin-left: 8px;
          padding: 2px 8px; border-radius: 999px;
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.35); color: #c084fc;
        }
        .lb-score { font-size: 20px; font-weight: 800; color: #c084fc; flex-shrink: 0; }
        .lb-unit {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: rgba(255,255,255,0.3); margin-left: 5px; font-weight: 400;
        }

        .lb-state {
          text-align: center; padding: 50px 0;
          font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.35);
        }
        .lb-state.error { color: #f87171; }
        .lb-spinner {
          width: 22px; height: 22px; margin: 0 auto 14px;
          border: 2px solid rgba(139,92,246,0.25); border-top-color: #8b5cf6;
          border-radius: 50%; animation: lb-spin .8s linear infinite;
        }
        @keyframes lb-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="lb-root">
        <div className="lb-wrap">
          <div className="lb-title">Leaderboard</div>
          <div className="lb-sub">Click a user to see their profile.</div>

          <div className="lb-tabs">
            {BOARDS.map(b => (
              <button
                key={b.key}
                type="button"
                className={`lb-tab ${tab === b.key ? 'active' : ''}`}
                onClick={() => setTab(b.key)}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="lb-card">
            {!state && (
              <div className="lb-state">
                <div className="lb-spinner" />
                loading leaderboard...
              </div>
            )}

            {state?.error && <div className="lb-state error">{state.error}</div>}

            {state?.list && rows.length === 0 && <div className="lb-state">No users yet.</div>}

            {rows.map(u => {
              const initials = u.name
                ? u.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                : '?'
              const isMe = Boolean(myId) && u._id === myId
              return (
                <Link key={u._id} to={`/profile/${u._id}`} className={`lb-row ${isMe ? 'me' : ''}`}>
                  <div className={`lb-rank ${u.rank <= 3 ? 'medal' : ''}`}>
                    {u.rank <= 3 ? MEDALS[u.rank - 1] : u.rank}
                  </div>
                  <div className="lb-avatar">{initials}</div>
                  <div className="lb-name">
                    {u.name}
                    {isMe && <span className="lb-you">you</span>}
                  </div>
                  <div className="lb-score">
                    {board.value(u)}
                    <span className="lb-unit">{board.unit}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Leaderboard
