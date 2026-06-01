import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DIFFICULTY_META = {
  easy:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'   },
  medium: { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)'  },
  hard:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   },
};

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all'); // all | easy | medium | hard
  const VITE_API_URL = import.meta.env.VITE_API_URL


  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await fetch(`${VITE_API_URL}/api/questions/all`);
      const data = await res.json();
      setQuestions(data.questions || []);   // ✅ fixed: data.questions
      console.log('Fetched questions:', data.questions); // ✅ debug log
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const filtered = questions.filter(q => {
    const matchDiff   = filter === 'all' || q.difficulty === filter;
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .qs-root {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'Syne', sans-serif;
          color: #e8e8f0;
          padding: 80px 0 60px;
          position: relative;
        }
        .qs-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* NAV */
        .qs-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          background: rgba(10,10,15,0.75);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .qs-nav-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px; font-weight: 600;
          color: #f0f0f8; text-decoration: none;
          display: flex; align-items: center; gap: 8px;
        }
        .logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #8b5cf6;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .qs-nav-right { display: flex; align-items: center; gap: 20px; }
        .nav-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: rgba(255,255,255,0.3);
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: #c084fc; }
        .nav-cta {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
          border: none; border-radius: 8px; padding: 8px 18px;
          text-decoration: none; cursor: pointer;
          transition: opacity .2s, transform .15s;
        }
        .nav-cta:hover { opacity: .88; transform: translateY(-1px); }

        /* CONTENT */
        .qs-wrap {
          position: relative; z-index: 1;
          max-width: 960px; margin: 0 auto;
          padding: 0 24px;
        }

        /* HEADER */
        .qs-header {
          margin-bottom: 36px;
          animation: fadein .5s ease both;
        }
        .qs-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.28);
          border-radius: 999px; padding: 4px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: #c084fc;
          letter-spacing: .06em; margin-bottom: 16px;
        }
        .badge-dot { width:6px;height:6px;border-radius:50%;background:#a855f7;animation:pulse 2s ease-in-out infinite; }
        .qs-title {
          font-size: 36px; font-weight: 800;
          letter-spacing: -0.02em; color: #f0f0f8;
          margin-bottom: 8px;
        }
        .qs-title span {
          background: linear-gradient(120deg, #c084fc, #7b8ff7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .qs-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: rgba(255,255,255,0.28);
        }

        /* TOOLBAR */
        .toolbar {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
          animation: fadein .5s .1s ease both;
          flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1; min-width: 200px;
          position: relative;
        }
        .search-icon {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: rgba(255,255,255,0.2);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 14px 11px 38px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: #e8e8f0;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          caret-color: #c084fc;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.18); }
        .search-input:focus {
          border-color: rgba(139,92,246,0.45);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.09);
        }
        .filter-btns { display: flex; gap: 8px; }
        .filter-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; font-weight: 500;
          padding: 9px 16px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: rgba(255,255,255,0.3);
          cursor: pointer; letter-spacing: .04em;
          transition: all .2s; text-transform: uppercase;
        }
        .filter-btn:hover { border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.6); }
        .filter-btn.active-all    { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.35); color: #c084fc; }
        .filter-btn.active-easy   { background: rgba(34,197,94,0.1);   border-color: rgba(34,197,94,0.3);   color: #22c55e; }
        .filter-btn.active-medium { background: rgba(249,115,22,0.1);  border-color: rgba(249,115,22,0.3);  color: #f97316; }
        .filter-btn.active-hard   { background: rgba(239,68,68,0.1);   border-color: rgba(239,68,68,0.3);   color: #ef4444; }

        /* TABLE HEADER */
        .table-head {
          display: grid;
          grid-template-columns: 56px 1fr 110px 120px 80px;
          padding: 10px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 4px;
        }

        /* QUESTION ROW */
        .q-row {
          display: grid;
          grid-template-columns: 56px 1fr 110px 120px 80px;
          align-items: center;
          padding: 0 20px;
          border-radius: 10px;
          border: 1px solid transparent;
          text-decoration: none;
          color: inherit;
          transition: background .18s, border-color .18s, transform .15s;
          animation: fadein .4s ease both;
          min-height: 60px;
        }
        .q-row:hover {
          background: rgba(139,92,246,0.06);
          border-color: rgba(139,92,246,0.2);
          transform: translateX(3px);
        }
        .q-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: rgba(255,255,255,0.18);
        }
        .q-title-text {
          font-size: 14px; font-weight: 600;
          color: #e8e8f0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          padding-right: 12px;
        }
        .q-row:hover .q-title-text { color: #c084fc; }
        .diff-badge {
          display: inline-flex;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; font-weight: 600;
          padding: 3px 10px; border-radius: 6px;
          letter-spacing: .04em; text-transform: capitalize;
          width: fit-content;
        }
        .q-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; padding: 3px 8px;
          border-radius: 5px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
        }
        .q-ac {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.2);
          text-align: right;
        }

        /* EMPTY / LOADING / ERROR */
        .state-box {
          text-align: center; padding: 80px 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; color: rgba(255,255,255,0.2);
          animation: fadein .4s ease both;
        }
        .state-box .big { font-size: 36px; margin-bottom: 14px; display: block; }
        .state-box.error-state { color: #f87171; }

        /* SKELETON */
        .skel-row {
          display: grid;
          grid-template-columns: 56px 1fr 110px 120px 80px;
          align-items: center;
          padding: 0 20px; min-height: 60px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.04);
          margin-bottom: 4px;
          overflow: hidden;
        }
        .skel {
          height: 14px; border-radius: 6px;
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        /* COUNT BAR */
        .count-bar {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.2);
          animation: fadein .5s .15s ease both;
        }
        .count-num { color: rgba(255,255,255,0.5); font-weight: 600; }

        @keyframes fadein {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="qs-root">
        {/* NAV */}
        {/* <nav className="qs-nav">
          <Link to="/" className="qs-nav-logo">
            <div className="logo-dot" />
            JUDGE.IO
          </Link>
          <div className="qs-nav-right">
            <Link to="/contests" className="nav-link">contests</Link>
            <Link to="/leaderboard" className="nav-link">leaderboard</Link>
            <Link to="/login" className="nav-cta">Sign In</Link>
          </div>
        </nav> */}

        <div className="qs-wrap">
          {/* HEADER */}
          <div className="qs-header">
            <div className="qs-badge">
              <div className="badge-dot" />
              PROBLEM SET
            </div>
            <h1 className="qs-title">
              Pick your <span>challenge.</span>
            </h1>
            <p className="qs-subtitle">$ problems --list all --sort by_difficulty</p>
          </div>

          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">/</span>
              <input
                className="search-input"
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-btns">
              {['all','easy','medium','hard'].map(d => (
                <button
                  key={d}
                  className={`filter-btn ${filter === d ? `active-${d}` : ''}`}
                  onClick={() => setFilter(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* COUNT */}
          {!loading && !error && (
            <div className="count-bar">
              <span><span className="count-num">{filtered.length}</span> problems</span>
              {filter !== 'all' && <span>filtered by <span className="count-num">{filter}</span></span>}
              {search && <span>matching <span className="count-num">"{search}"</span></span>}
            </div>
          )}

          {/* TABLE HEAD */}
          {!loading && !error && filtered.length > 0 && (
            <div className="table-head">
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Tags</span>
              <span style={{ textAlign: 'right' }}>AC Rate</span>
            </div>
          )}

          {/* LOADING SKELETONS */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div className="skel-row" key={i} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="skel" style={{ width: '28px' }} />
              <div className="skel" style={{ width: `${55 + Math.random() * 30}%` }} />
              <div className="skel" style={{ width: '64px' }} />
              <div className="skel" style={{ width: '80px' }} />
              <div className="skel" style={{ width: '40px', marginLeft: 'auto' }} />
            </div>
          ))}

          {/* ERROR */}
          {error && (
            <div className="state-box error-state">
              <span className="big">✕</span>
              {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && filtered.length === 0 && (
            <div className="state-box">
              <span className="big">◎</span>
              No problems match your search.
            </div>
          )}

          {/* ROWS */}
          {!loading && !error && filtered.map((q, i) => {
            const diff = DIFFICULTY_META[q.difficulty] || DIFFICULTY_META.easy;
            const tags  = q.topic || [];
            const acRate = q.acRate ? `${q.acRate}%` : '—';
            return (
              <Link
                to={`/problems/${q.slug}`}
                state={{ questionId: q._id }}
                className="q-row"
                key={q._id}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="q-num">{i + 1}</span>
                <span className="q-title-text">{q.title}</span>
                <span>
                  <span
                    className="diff-badge"
                    style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}
                  >
                    {q.difficulty}
                  </span>
                </span>
                <div className="q-tags">
                  {tags.slice(0, 2).map(t => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                  {tags.length > 2 && (
                    <span className="tag">+{tags.length - 2}</span>
                  )}
                </div>
                <span className="q-ac">{acRate}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Questions;