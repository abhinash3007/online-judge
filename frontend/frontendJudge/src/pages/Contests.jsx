import { Link } from 'react-router-dom'

// Placeholder for the contests feature, which is not built yet. It shows no fake contests or data.
// TODO(feature): replace this page with the real contest list once the contest API exists.

const FEATURES = [
  {
    icon: '⏱',
    title: 'Timed rounds',
    text: 'Solve a set of problems against the clock, at the same time as everyone else.',
  },
  {
    icon: '🏆',
    title: 'Live leaderboard',
    text: 'Watch the standings change in real time as accepted solutions come in.',
  },
  {
    icon: '📈',
    title: 'Ratings',
    text: 'Earn a rating from your contest performance and see your progress over time.',
  },
  {
    icon: '🧩',
    title: 'Weekly problem sets',
    text: 'Fresh problems every round, from easy warm-ups to hard finishers.',
  },
]

const Contests = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

      .cs-root {
        position: relative; overflow: hidden;
        min-height: calc(100vh - 52px);
        background: #0a0a0f;
        font-family: 'Syne', sans-serif;
        color: #e8e8f0;
        padding: 72px 20px 80px;
      }
      /* faint grid */
      .cs-root::before {
        content: ''; position: absolute; inset: 0; pointer-events: none;
        background-image:
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%);
        -webkit-mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%);
      }
      /* glowing orbs */
      .cs-orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; opacity: .5; }
      .cs-orb.a { width: 420px; height: 420px; background: #8b5cf6; top: -120px; left: 8%; animation: cs-float 9s ease-in-out infinite; }
      .cs-orb.b { width: 360px; height: 360px; background: #5b6ef5; top: 60px; right: 6%; animation: cs-float 11s ease-in-out infinite reverse; }
      .cs-orb.c { width: 260px; height: 260px; background: #ec4899; top: 320px; left: 42%; opacity: .22; animation: cs-float 13s ease-in-out infinite; }
      @keyframes cs-float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,-28px); } }

      .cs-wrap { position: relative; max-width: 960px; margin: 0 auto; text-align: center; }

      .cs-badge {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
        letter-spacing: .16em; text-transform: uppercase; color: #c084fc;
        padding: 7px 16px; border-radius: 999px;
        background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.35);
      }
      .cs-dot { width: 7px; height: 7px; border-radius: 50%; background: #c084fc; animation: cs-pulse 1.8s ease-in-out infinite; }
      @keyframes cs-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.75); } }

      .cs-title {
        font-size: clamp(44px, 9vw, 92px); font-weight: 800; line-height: 1.02; letter-spacing: -0.03em;
        margin: 26px 0 18px; color: #f5f5fb;
      }
      .cs-grad {
        background: linear-gradient(120deg, #a78bfa 0%, #8b5cf6 35%, #60a5fa 70%, #f472b6 100%);
        background-size: 200% 200%; animation: cs-shift 6s ease-in-out infinite;
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      @keyframes cs-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

      .cs-lead {
        max-width: 620px; margin: 0 auto;
        font-size: 17px; line-height: 1.65; color: rgba(255,255,255,0.55);
      }

      .cs-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 34px; }
      .cs-btn {
        font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; text-decoration: none;
        padding: 12px 26px; border-radius: 10px; transition: transform .15s, opacity .2s, border-color .2s, color .2s;
      }
      .cs-btn:hover { transform: translateY(-2px); }
      .cs-btn.primary {
        color: #fff; background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
        box-shadow: 0 10px 40px rgba(139,92,246,0.35);
      }
      .cs-btn.primary:hover { opacity: .92; }
      .cs-btn.ghost { color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.03); }
      .cs-btn.ghost:hover { color: #c084fc; border-color: rgba(139,92,246,0.5); }

      .cs-label {
        font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
        color: rgba(255,255,255,0.3); margin: 84px 0 22px;
      }
      .cs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; text-align: left; }
      .cs-card {
        position: relative; padding: 22px; border-radius: 16px;
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(6px);
        transition: transform .25s, border-color .25s, background .25s;
      }
      .cs-card:hover { transform: translateY(-4px); border-color: rgba(139,92,246,0.4); background: rgba(139,92,246,0.06); }
      .cs-icon {
        width: 44px; height: 44px; border-radius: 12px; font-size: 22px;
        display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
        background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(91,110,245,0.15));
        border: 1px solid rgba(139,92,246,0.3);
      }
      .cs-card-title { font-size: 16px; font-weight: 800; color: #f0f0f8; }
      .cs-card-text { font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.45); margin-top: 6px; }

      .cs-foot {
        margin-top: 64px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.3);
      }
      .cs-foot a { color: #c084fc; text-decoration: none; }
      .cs-foot a:hover { text-decoration: underline; }

      @media (prefers-reduced-motion: reduce) {
        .cs-orb, .cs-grad, .cs-dot { animation: none; }
      }
    `}</style>

    <div className="cs-root">
      <div className="cs-orb a" />
      <div className="cs-orb b" />
      <div className="cs-orb c" />

      <div className="cs-wrap">
        <span className="cs-badge"><span className="cs-dot" />Coming soon</span>

        <h1 className="cs-title">
          Code. Compete.<br />
          <span className="cs-grad">Rise.</span>
        </h1>

        <p className="cs-lead">
          Contests are on the way: timed rounds, a live leaderboard and ratings.
          We're building them now. In the meantime, keep sharpening your skills.
        </p>

        <div className="cs-actions">
          <Link to="/questions" className="cs-btn primary">Practice problems</Link>
          <Link to="/leaderboard" className="cs-btn ghost">View leaderboard</Link>
        </div>

        <div className="cs-label">What's coming</div>
        <div className="cs-grid">
          {FEATURES.map(f => (
            <div className="cs-card" key={f.title}>
              <div className="cs-icon">{f.icon}</div>
              <div className="cs-card-title">{f.title}</div>
              <div className="cs-card-text">{f.text}</div>
            </div>
          ))}
        </div>

        <div className="cs-foot">
          Solving problems now earns you points on the <Link to="/leaderboard">leaderboard</Link>.
        </div>
      </div>
    </div>
  </>
)

export default Contests
