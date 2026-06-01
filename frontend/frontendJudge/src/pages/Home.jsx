import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Sub-second judging',
    desc: 'Submissions are evaluated in isolated sandboxes with CPU, memory, and time limits enforced at the kernel level.',
  },
  {
    icon: '🌐',
    title: '20+ languages',
    desc: 'C++17, Java 21, Python 3.12, Go, Rust, Kotlin and more — each with tuned time-limit multipliers.',
  },
  {
    icon: '🏆',
    title: 'Live contests',
    desc: 'ICPC-style and IOI-style contests with real-time scoreboards, penalty scoring, and editorial unlocks.',
  },
  {
    icon: '🔒',
    title: 'Secure sandbox',
    desc: 'Every run is containerised with seccomp filters, no network access, and ephemeral filesystems.',
  },
  {
    icon: '📊',
    title: 'Deep analytics',
    desc: 'Track acceptance rates, time complexity distributions, and your personal solving streak over time.',
  },
  {
    icon: '🤝',
    title: 'Team rooms',
    desc: 'Collaborate in shared workspaces during contests. Real-time cursors, shared notes, and split verdicts.',
  },
]

const STATS = [
  { value: '2.4M+', label: 'Submissions' },
  { value: '18K+',  label: 'Problems' },
  { value: '340K+', label: 'Coders' },
  { value: '99.9%', label: 'Uptime' },
]

const CODE_SNIPPET = `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;

    // Two-pointer approach O(n log n)
    sort(a.begin(), a.end());
    long long ans = 0;
    int l = 0, r = n - 1;
    while (l < r) {
        if (a[l] + a[r] == 0) ans++;
        a[l] > -a[r] ? r-- : l++;
    }
    cout << ans << "\\n";
}`

const VERDICTS = [
  { label: 'AC', color: '#22c55e', text: 'Accepted',        time: '0.04s', mem: '3.2 MB' },
  { label: 'WA', color: '#ef4444', text: 'Wrong Answer',    time: '0.03s', mem: '3.1 MB' },
  { label: 'TLE', color: '#f97316', text: 'Time Limit',     time: '2.00s', mem: '4.8 MB' },
  { label: 'AC', color: '#22c55e', text: 'Accepted',        time: '0.06s', mem: '3.4 MB' },
]

export default function Home() {
  const canvasRef = useRef(null)
  const [typed, setTyped] = useState('')
  const [visibleFeatures, setVisibleFeatures] = useState([])
  const featuresRef = useRef(null)

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`
        ctx.fill()
      })
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(91,110,245,${0.08 * (1 - dist/120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  // Typewriter for code snippet
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= CODE_SNIPPET.length) {
        setTyped(CODE_SNIPPET.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [])

  // Scroll-reveal features
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx)
            setVisibleFeatures(prev => [...new Set([...prev, idx])])
          }
        })
      },
      { threshold: 0.15 }
    )
    const cards = document.querySelectorAll('.feature-card')
    cards.forEach(c => observer.observe(c))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body, .landing-root {
          background: #0a0a0f;
          color: #e8e8f0;
          font-family: 'Syne', sans-serif;
          overflow-x: hidden;
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 60px;
          background: rgba(10,10,15,0.7);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-logo {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 16px;
          color: #f0f0f8;
          text-decoration: none;
          display: flex; align-items: center; gap: 8px;
        }
        .nav-logo-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #8b5cf6;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #c084fc; }
        .nav-cta {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
        }
        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── HERO ── */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 24px 80px;
          overflow: hidden;
        }
        .hero-canvas {
          position: absolute; inset: 0;
          pointer-events: none;
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .hero-glow {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .hero-content { position: relative; z-index: 1; max-width: 800px; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.28);
          border-radius: 999px;
          padding: 5px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #c084fc;
          letter-spacing: 0.06em;
          margin-bottom: 32px;
          animation: fadein 0.6s ease both;
        }
        .hero-badge-dot { width:6px;height:6px;border-radius:50%;background:#a855f7;animation:pulse 2s ease-in-out infinite; }

        .hero-title {
          font-size: clamp(48px, 8vw, 88px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: #f0f0f8;
          margin-bottom: 24px;
          animation: fadein 0.7s 0.1s ease both;
        }
        .hero-title .accent {
          background: linear-gradient(120deg, #c084fc 0%, #7b8ff7 50%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          line-height: 1.8;
          max-width: 520px;
          margin: 0 auto 40px;
          animation: fadein 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex; align-items: center; justify-content: center; gap: 14px;
          animation: fadein 0.7s 0.3s ease both;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #5b6ef5);
          border: none; border-radius: 10px;
          padding: 14px 28px;
          cursor: pointer; text-decoration: none;
          transition: transform 0.15s, opacity 0.2s;
          position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity:0; transition:opacity 0.2s;
        }
        .btn-primary:hover::after { opacity:1; }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.45);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 14px 24px;
          cursor: pointer; text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-secondary:hover { border-color: rgba(139,92,246,0.4); color: #c084fc; }

        @keyframes fadein {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── STATS ── */
        .stats-band {
          display: flex; justify-content: center; gap: 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.018);
        }
        .stat-item {
          flex: 1; max-width: 220px;
          padding: 36px 20px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .stat-item:last-child { border-right: none; }
        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 32px; font-weight: 600;
          color: #f0f0f8;
          background: linear-gradient(120deg, #c084fc, #7b8ff7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-top: 6px;
        }

        /* ── CODE DEMO ── */
        .demo-section {
          padding: 100px 60px;
          display: flex; align-items: center; gap: 64px;
          max-width: 1200px; margin: 0 auto;
        }
        .demo-text { flex: 1; }
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8b9cf7;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 40px; font-weight: 800;
          line-height: 1.1; letter-spacing: -0.02em;
          color: #f0f0f8;
          margin-bottom: 20px;
        }
        .section-title .acc {
          background: linear-gradient(120deg, #c084fc, #7b8ff7);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .section-body {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; line-height: 1.8;
          color: rgba(255,255,255,0.35);
          margin-bottom: 32px;
        }

        .demo-window { flex: 1.2; }
        .window-chrome {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
        }
        .window-titlebar {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .dot { width:10px;height:10px;border-radius:50%; }
        .dot-r { background:#ef4444; opacity:0.7; }
        .dot-y { background:#eab308; opacity:0.7; }
        .dot-g { background:#22c55e; opacity:0.7; }
        .window-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.2);
          margin-left: 8px;
        }
        .code-body {
          padding: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          line-height: 1.7;
          color: #a8b4d4;
          min-height: 280px;
          white-space: pre;
          overflow: hidden;
        }
        .cursor {
          display: inline-block;
          width: 7px; height: 14px;
          background: #c084fc;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* Verdict list */
        .verdict-list {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 12px 16px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .verdict-row {
          display: flex; align-items: center; gap: 12px;
          padding: 8px 10px;
          border-radius: 6px;
          background: rgba(255,255,255,0.02);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
        }
        .verdict-badge {
          font-size: 10px; font-weight: 600;
          padding: 2px 7px; border-radius: 4px;
          letter-spacing: 0.04em;
          min-width: 38px; text-align: center;
        }
        .verdict-label { flex: 1; color: rgba(255,255,255,0.4); }
        .verdict-meta { color: rgba(255,255,255,0.2); }

        /* ── FEATURES ── */
        .features-section {
          padding: 100px 60px;
          max-width: 1200px; margin: 0 auto;
          text-align: center;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 56px;
          text-align: left;
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 28px;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.2s;
        }
        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .feature-card:hover {
          border-color: rgba(139,92,246,0.3);
          background: rgba(139,92,246,0.05);
        }
        .feature-icon { font-size: 24px; margin-bottom: 14px; display: block; }
        .feature-title {
          font-size: 16px; font-weight: 700;
          color: #f0f0f8; margin-bottom: 10px;
        }
        .feature-desc {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; line-height: 1.8;
          color: rgba(255,255,255,0.3);
        }

        /* ── CTA SECTION ── */
        .cta-section {
          padding: 100px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-glow {
          position: absolute;
          width: 600px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .cta-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .cta-title {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f0f0f8;
          line-height: 1.05;
          margin-bottom: 20px;
        }
        .cta-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
          line-height: 1.8;
          margin-bottom: 40px;
        }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 40px 60px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.25);
        }
        .footer-links { display: flex; gap: 28px; }
        .footer-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: rgba(255,255,255,0.2);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #c084fc; }

        @media (max-width: 900px) {
          .nav { padding: 16px 24px; }
          .nav-links { display: none; }
          .demo-section { flex-direction: column; padding: 60px 24px; gap: 40px; }
          .features-grid { grid-template-columns: 1fr; }
          .features-section { padding: 60px 24px; }
          .cta-section { padding: 60px 24px; }
          .footer { flex-direction: column; gap: 20px; padding: 32px 24px; }
          .stats-band { flex-wrap: wrap; }
          .stat-item { min-width: 50%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
        }
      `}</style>

      <div className="landing-root">

        {/* NAV */}
        {/* <nav className="nav">
          <a href="#" className="nav-logo">
            <div className="nav-logo-dot" />
            JUDGE.IO
          </a>
          <div className="nav-links">
            <a href="#features" className="nav-link">features</a>
            <Link to="/questions" className="nav-link">problems</Link>
            <a href="#contests" className="nav-link">contests</a>
            <a href="#leaderboard" className="nav-link">leaderboard</a>
          </div>
          <Link to="/register" className="nav-cta">Start Coding →</Link>
        </nav> */}

        {/* HERO */}
        <section className="hero">
          <canvas ref={canvasRef} className="hero-canvas" />
          <div className="hero-grid" />
          <div className="hero-glow" />
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              COMPETITIVE PROGRAMMING PLATFORM
            </div>
            <h1 className="hero-title">
              Code.<br />
              <span className="accent">Compete.</span><br />
              Conquer.
            </h1>
            <p className="hero-sub">
              A blazing-fast online judge for competitive programmers.<br />
              Submit your solution. Get a verdict in milliseconds.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                Start Solving
                <span>→</span>
              </Link>
              <Link to="/questions" className="btn-secondary">
                View Problems
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats-band">
          {STATS.map(s => (
            <div className="stat-item" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CODE DEMO */}
        <section className="demo-section" id="demo">
          <div className="demo-text">
            <div className="section-label">// the experience</div>
            <h2 className="section-title">
              Write once.<br />
              Judge <span className="acc">instantly.</span>
            </h2>
            <p className="section-body">
              Your code runs in an isolated container the moment you hit submit.
              CPU cycles, memory, and wall time — all measured precisely.
              No waiting. No queuing during off-peak. Always instant.
            </p>
            <Link to="/register" className="btn-primary" style={{ display: 'inline-flex' }}>
              Try it free
            </Link>
          </div>
          <div className="demo-window">
            <div className="window-chrome">
              <div className="window-titlebar">
                <div className="dot dot-r" />
                <div className="dot dot-y" />
                <div className="dot dot-g" />
                <span className="window-title">solution.cpp — problem #1337</span>
              </div>
              <div className="code-body">
                {typed}<span className="cursor" />
              </div>
              <div className="verdict-list">
                {VERDICTS.map((v, i) => (
                  <div className="verdict-row" key={i}>
                    <span
                      className="verdict-badge"
                      style={{ background: v.color + '22', color: v.color }}
                    >
                      {v.label}
                    </span>
                    <span className="verdict-label">{v.text}</span>
                    <span className="verdict-meta">{v.time}</span>
                    <span className="verdict-meta">{v.mem}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div className="section-label" style={{ textAlign: 'center' }}>// why judge.io</div>
          <h2 className="section-title" style={{ fontSize: '40px' }}>
            Everything a competitive<br />
            programmer <span className="acc">needs.</span>
          </h2>
          <div className="features-grid" ref={featuresRef}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`feature-card ${visibleFeatures.includes(i) ? 'visible' : ''}`}
                data-idx={i}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-glow" />
          <div className="cta-inner">
            <div className="section-label">// ready?</div>
            <h2 className="cta-title">
              Your first<br />
              <span style={{
                background: 'linear-gradient(120deg, #c084fc, #7b8ff7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                AC
              </span>{' '}
              awaits.
            </h2>
            <p className="cta-sub">
              Join 340,000+ coders who submit, compete,<br />
              and climb the global leaderboard every day.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <Link to="/register" className="btn-primary">Create Free Account</Link>
              <Link to="/login" className="btn-secondary">Sign In</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">JUDGE.IO</div>
          <div className="footer-links">
            <a href="#" className="footer-link">about</a>
            <a href="#" className="footer-link">api</a>
            <a href="#" className="footer-link">blog</a>
            <a href="#" className="footer-link">discord</a>
            <a href="#" className="footer-link">github</a>
            <a href="#" className="footer-link">privacy</a>
          </div>
        </footer>

      </div>
    </>
  )
}