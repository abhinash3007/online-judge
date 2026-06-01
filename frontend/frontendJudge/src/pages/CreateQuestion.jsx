import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const DIFFICULTIES = ['easy', 'medium', 'hard']
const DIFF_META = {
  easy:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  medium: { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)' },
  hard:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)' },
}

const TOPIC_SUGGESTIONS = [
  'arrays', 'strings', 'linked-list', 'trees', 'graphs',
  'dynamic-programming', 'two-pointers', 'sliding-window',
  'binary-search', 'stack', 'queue', 'heap', 'hashing',
  'backtracking', 'greedy', 'math', 'bit-manipulation', 'recursion',
]

const STEPS = ['Question', 'Formats', 'Test Cases', 'Review']

const EMPTY_TC = () => ({ input: '', output: '', isHidden: false })

export default function CreateQuestion() {
  const navigate = useNavigate()
  const VITE_API_URL = import.meta.env.VITE_API_URL

  const [step, setStep]       = useState(0)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)
  const [createdId, setCreatedId] = useState(null)

  // Step 0 — Question fields
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [difficulty,  setDifficulty]  = useState('easy')
  const [topicInput,  setTopicInput]  = useState('')
  const [topics,      setTopics]      = useState([])
  const [constraints, setConstraints] = useState([''])

  // Step 1 — Formats
  const [inputFormat,  setInputFormat]  = useState('')
  const [outputFormat, setOutputFormat] = useState('')

  // Step 2 — Test cases
  const [testCases, setTestCases] = useState([EMPTY_TC(), EMPTY_TC()])

  // ── helpers ──────────────────────────────────────────────
  const addTopic = (t) => {
    const v = t.trim().toLowerCase().replace(/\s+/g, '-')
    if (v && !topics.includes(v)) setTopics([...topics, v])
    setTopicInput('')
  }
  const removeTopic = (t) => setTopics(topics.filter(x => x !== t))

  const addConstraint = () => setConstraints([...constraints, ''])
  const updateConstraint = (i, v) => setConstraints(constraints.map((c, idx) => idx === i ? v : c))
  const removeConstraint = (i) => setConstraints(constraints.filter((_, idx) => idx !== i))

  const addTC = () => setTestCases([...testCases, EMPTY_TC()])
  const removeTC = (i) => setTestCases(testCases.filter((_, idx) => idx !== i))
  const updateTC = (i, field, val) =>
    setTestCases(testCases.map((tc, idx) => idx === i ? { ...tc, [field]: val } : tc))

  const stepValid = () => {
    if (step === 0) return title.trim() && description.trim() && topics.length > 0 && constraints.filter(Boolean).length > 0
    if (step === 1) return inputFormat.trim() && outputFormat.trim()
    if (step === 2) return testCases.length >= 1 && testCases.every(tc => tc.input.trim() && tc.output.trim())
    return true
  }

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSaving(true); setError(null)
    try {
      // 1. Create question
      const qRes = await axios.post(`${VITE_API_URL}/api/questions/create`, {
        title,
        description,
        difficulty,
        constraints: constraints.filter(Boolean),
        topic: topics,
        inputFormat,
        outputFormat,
      }, { withCredentials: true })

      const qId = qRes.data.question._id
      setCreatedId(qId)

      // 2. Create test cases
      await axios.post(`${VITE_API_URL}/api/testcases/create/${qId}`, {
        testCases: testCases.map(tc => ({
          input:    tc.input.trim(),
          output:   tc.output.trim(),
          isHidden: tc.isHidden,
        }))
      }, { withCredentials: true })

      setSuccess('Problem created successfully!')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        .cq-root {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: 'Syne', sans-serif;
          color: #e8e8f0;
          position: relative;
          overflow-x: hidden;
        }
        .cq-root::before {
          content:'';
          position:fixed; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events:none; z-index:0;
        }
        .blob {
          position:fixed; border-radius:50%; filter:blur(100px);
          pointer-events:none; opacity:.12;
        }
        .blob-1 { width:500px;height:500px;background:#5b6ef5;top:-150px;left:-150px;animation:bd 16s ease-in-out infinite alternate; }
        .blob-2 { width:400px;height:400px;background:#8b5cf6;bottom:-100px;right:-100px;animation:bd 20s ease-in-out infinite alternate-reverse; }
        @keyframes bd { from{transform:translate(0,0) scale(1)} to{transform:translate(30px,20px) scale(1.06)} }

        /* NAV */
        .cq-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 48px;
          background:rgba(10,10,15,0.75);
          backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .nav-logo {
          font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:600;
          color:#f0f0f8; text-decoration:none;
          display:flex; align-items:center; gap:8px;
        }
        .nav-dot { width:7px;height:7px;border-radius:50%;background:#8b5cf6;animation:pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .nav-right { display:flex; align-items:center; gap:14px; }
        .nav-link {
          font-family:'JetBrains Mono',monospace; font-size:11px;
          color:rgba(255,255,255,0.3); text-decoration:none;
          transition:color .2s;
        }
        .nav-link:hover { color:#c084fc; }

        /* CONTENT */
        .cq-body {
          position:relative; z-index:1;
          max-width: 860px; margin: 0 auto;
          padding: 100px 24px 80px;
        }

        /* HEADER */
        .cq-header { margin-bottom:40px; animation:fadein .5s ease both; }
        .cq-badge {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(139,92,246,0.12);
          border:1px solid rgba(139,92,246,0.28);
          border-radius:999px; padding:4px 12px;
          font-family:'JetBrains Mono',monospace;
          font-size:11px; color:#c084fc; letter-spacing:.06em; margin-bottom:14px;
        }
        .badge-dot { width:6px;height:6px;border-radius:50%;background:#a855f7;animation:pulse 2s ease-in-out infinite; }
        .cq-title { font-size:34px;font-weight:800;letter-spacing:-0.02em;color:#f0f0f8;margin-bottom:6px; }
        .cq-title span {
          background:linear-gradient(120deg,#c084fc,#7b8ff7);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .cq-sub { font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.25); }

        /* STEPPER */
        .stepper {
          display:flex; align-items:center; gap:0;
          margin-bottom:40px;
          animation:fadein .5s .08s ease both;
        }
        .step-item {
          display:flex; align-items:center; gap:10px;
          font-family:'JetBrains Mono',monospace; font-size:12px;
          color:rgba(255,255,255,0.25);
          transition:color .3s;
        }
        .step-item.active { color:#c084fc; }
        .step-item.done   { color:#22c55e; }
        .step-num {
          width:28px;height:28px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          transition:all .3s; flex-shrink:0;
        }
        .step-item.active .step-num { background:rgba(139,92,246,0.2);border-color:#c084fc;color:#c084fc; }
        .step-item.done   .step-num { background:rgba(34,197,94,0.15);border-color:#22c55e;color:#22c55e; }
        .step-line { flex:1;height:1px;background:rgba(255,255,255,0.07);margin:0 12px; }

        /* CARD */
        .cq-card {
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:16px; padding:32px;
          animation:fadein .4s ease both;
        }
        @keyframes fadein { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .section-label {
          font-family:'JetBrains Mono',monospace;
          font-size:10px;letter-spacing:.12em;text-transform:uppercase;
          color:rgba(255,255,255,0.25); margin-bottom:10px; margin-top:24px;
        }
        .section-label:first-child { margin-top:0; }

        /* INPUTS */
        .cq-input, .cq-textarea, .cq-select {
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px;
          font-family:'JetBrains Mono',monospace;
          font-size:13px; color:#e8e8f0;
          outline:none;
          transition:border-color .2s, box-shadow .2s;
          caret-color:#c084fc;
        }
        .cq-input   { padding:11px 14px; }
        .cq-textarea { padding:13px 14px; resize:vertical; min-height:100px; line-height:1.7; }
        .cq-select  { padding:11px 14px; cursor:pointer; }
        .cq-input::placeholder, .cq-textarea::placeholder { color:rgba(255,255,255,0.18); }
        .cq-input:focus, .cq-textarea:focus, .cq-select:focus {
          border-color:rgba(139,92,246,0.5);
          box-shadow:0 0 0 3px rgba(139,92,246,0.09);
        }
        .cq-select option { background:#1a1a2e; color:#e8e8f0; }

        /* DIFFICULTY PICKER */
        .diff-pills { display:flex; gap:8px; }
        .diff-pill {
          font-family:'JetBrains Mono',monospace;
          font-size:11px;font-weight:600;
          padding:7px 18px; border-radius:8px;
          border:1px solid rgba(255,255,255,0.08);
          background:transparent; color:rgba(255,255,255,0.3);
          cursor:pointer; letter-spacing:.04em; text-transform:capitalize;
          transition:all .2s;
        }

        /* TOPIC TAGS */
        .topic-wrap { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px; }
        .topic-tag {
          display:inline-flex; align-items:center; gap:6px;
          font-family:'JetBrains Mono',monospace;
          font-size:11px; padding:5px 10px; border-radius:7px;
          background:rgba(139,92,246,0.12);
          border:1px solid rgba(139,92,246,0.28);
          color:#c084fc;
        }
        .topic-remove {
          background:none;border:none;cursor:pointer;
          color:rgba(192,132,252,0.5); font-size:13px; padding:0;
          line-height:1; transition:color .2s;
        }
        .topic-remove:hover { color:#ef4444; }
        .topic-suggestions { display:flex;gap:6px;flex-wrap:wrap;margin-top:8px; }
        .topic-sug {
          font-family:'JetBrains Mono',monospace;
          font-size:10px; padding:4px 9px; border-radius:5px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.07);
          color:rgba(255,255,255,0.3); cursor:pointer;
          transition:all .15s;
        }
        .topic-sug:hover { background:rgba(139,92,246,0.1);border-color:rgba(139,92,246,0.3);color:#c084fc; }

        /* CONSTRAINTS */
        .constraint-row { display:flex;gap:8px;margin-bottom:8px;align-items:center; }
        .constraint-num {
          font-family:'JetBrains Mono',monospace;
          font-size:11px; color:rgba(255,255,255,0.2);
          width:24px; flex-shrink:0; text-align:right;
        }
        .btn-icon {
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:7px; color:rgba(255,255,255,0.3);
          width:34px;height:34px; cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:15px; flex-shrink:0;
          transition:all .2s;
        }
        .btn-icon:hover { background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3);color:#ef4444; }
        .btn-add {
          display:inline-flex;align-items:center;gap:7px;
          font-family:'JetBrains Mono',monospace;
          font-size:11px; color:rgba(255,255,255,0.3);
          background:rgba(255,255,255,0.03);
          border:1px dashed rgba(255,255,255,0.1);
          border-radius:8px; padding:8px 14px; cursor:pointer;
          transition:all .2s; margin-top:4px;
        }
        .btn-add:hover { border-color:rgba(139,92,246,0.4);color:#c084fc;background:rgba(139,92,246,0.06); }

        /* TEST CASES */
        .tc-card {
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:12px; padding:20px; margin-bottom:12px;
          position:relative;
        }
        .tc-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
        .tc-num {
          font-family:'JetBrains Mono',monospace;
          font-size:11px;font-weight:600;color:rgba(255,255,255,0.3);
          letter-spacing:.06em;
        }
        .tc-actions { display:flex;gap:8px;align-items:center; }
        .tc-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        .toggle-wrap { display:flex;align-items:center;gap:8px; }
        .toggle {
          position:relative;width:36px;height:20px;
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:999px; cursor:pointer;
          transition:background .2s,border-color .2s; flex-shrink:0;
        }
        .toggle.on { background:rgba(239,68,68,0.3);border-color:rgba(239,68,68,0.5); }
        .toggle-knob {
          position:absolute;top:2px;left:2px;
          width:14px;height:14px;border-radius:50%;
          background:rgba(255,255,255,0.3);
          transition:transform .2s,background .2s;
        }
        .toggle.on .toggle-knob { transform:translateX(16px);background:#ef4444; }
        .toggle-label {
          font-family:'JetBrains Mono',monospace;
          font-size:10px;color:rgba(255,255,255,0.25);
          letter-spacing:.04em;
        }
        .toggle.on + .toggle-label { color:#f87171; }
        .hidden-badge {
          font-family:'JetBrains Mono',monospace;
          font-size:9px;font-weight:600;letter-spacing:.06em;
          padding:2px 7px;border-radius:4px;
          background:rgba(239,68,68,0.1);
          border:1px solid rgba(239,68,68,0.25);
          color:#f87171;
        }

        /* NAV BUTTONS */
        .btn-row { display:flex;align-items:center;justify-content:space-between;margin-top:28px; }
        .btn-back {
          font-family:'Syne',sans-serif;font-size:13px;font-weight:700;
          color:rgba(255,255,255,0.3);
          background:transparent;border:1px solid rgba(255,255,255,0.08);
          border-radius:9px;padding:10px 22px;cursor:pointer;
          transition:all .2s;
        }
        .btn-back:hover { border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.6); }
        .btn-next {
          font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
          color:#fff;
          background:linear-gradient(135deg,#8b5cf6,#5b6ef5);
          border:none;border-radius:9px;padding:11px 28px;cursor:pointer;
          display:flex;align-items:center;gap:8px;
          transition:opacity .2s,transform .15s;
          position:relative;overflow:hidden;
        }
        .btn-next::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.12),transparent);opacity:0;transition:opacity .2s; }
        .btn-next:hover:not(:disabled)::after { opacity:1; }
        .btn-next:hover:not(:disabled) { transform:translateY(-1px); }
        .btn-next:disabled { opacity:.45;cursor:not-allowed; }
        .btn-submit-final {
          font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
          color:#fff;
          background:linear-gradient(135deg,#22c55e,#16a34a);
          border:none;border-radius:9px;padding:11px 28px;cursor:pointer;
          display:flex;align-items:center;gap:8px;
          transition:opacity .2s,transform .15s;
        }
        .btn-submit-final:hover:not(:disabled) { opacity:.88;transform:translateY(-1px); }
        .btn-submit-final:disabled { opacity:.45;cursor:not-allowed; }

        .spinner { width:14px;height:14px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* ERROR */
        .error-box {
          display:flex;align-items:center;gap:8px;
          background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
          border-radius:8px;padding:10px 14px;margin-bottom:16px;
          font-family:'JetBrains Mono',monospace;font-size:12px;color:#f87171;
          animation:shake .35s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake { 10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(3px)} 30%,50%,70%{transform:translateX(-3px)} 40%,60%{transform:translateX(3px)} }

        /* REVIEW */
        .review-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px; }
        .review-item {
          background:rgba(255,255,255,0.025);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:10px;padding:14px 16px;
        }
        .review-lbl { font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:6px; }
        .review-val { font-family:'JetBrains Mono',monospace;font-size:13px;color:#e8e8f0;line-height:1.6; }
        .review-full { grid-column:span 2; }
        .review-tags { display:flex;gap:6px;flex-wrap:wrap; }
        .review-tag {
          font-family:'JetBrains Mono',monospace;font-size:10px;
          padding:3px 9px;border-radius:5px;
          background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);color:#c084fc;
        }
        .tc-summary {
          display:flex;gap:8px;flex-wrap:wrap;
        }
        .tc-pill {
          font-family:'JetBrains Mono',monospace;font-size:10px;
          padding:4px 10px;border-radius:6px;
          background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e;
        }
        .tc-pill.hidden {
          background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.2);color:#f87171;
        }

        /* SUCCESS */
        .success-card {
          text-align:center;padding:60px 32px;
        }
        .success-icon { font-size:56px;margin-bottom:20px;display:block;animation:popin .5s cubic-bezier(.22,1,.36,1) both; }
        @keyframes popin { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
        .success-title { font-size:28px;font-weight:800;color:#f0f0f8;margin-bottom:8px;letter-spacing:-0.01em; }
        .success-sub { font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,0.3);margin-bottom:32px;line-height:1.8; }
        .success-actions { display:flex;gap:10px;justify-content:center; }
      `}</style>

      <div className="cq-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* NAV */}
        <nav className="cq-nav">
          <Link to="/" className="nav-logo">
            <div className="nav-dot" />
            JUDGE.IO
          </Link>
          <div className="nav-right">
            <Link to="/questions" className="nav-link">problems</Link>
            <Link to="/contests" className="nav-link">contests</Link>
          </div>
        </nav>

        <div className="cq-body">

          {/* HEADER */}
          <div className="cq-header">
            <div className="cq-badge">
              <div className="badge-dot" />
              ADMIN PANEL
            </div>
            <h1 className="cq-title">Create a <span>problem.</span></h1>
            <p className="cq-sub">$ problem --create --mode guided</p>
          </div>

          {/* STEPPER */}
          {step < 3 && (
            <div className="stepper">
              {STEPS.slice(0,3).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`step-item ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                    <div className="step-num">{i < step ? '✓' : i + 1}</div>
                    {s}
                  </div>
                  {i < 2 && <div className="step-line" />}
                </React.Fragment>
              ))}
            </div>
          )}

          {error && <div className="error-box"><span>✕</span>{error}</div>}

          {/* ── STEP 0: QUESTION ── */}
          {step === 0 && (
            <div className="cq-card">
              <div className="section-label">Title</div>
              <input
                className="cq-input"
                placeholder="e.g. Trapping Rain Water"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              <div className="section-label" style={{marginTop:20}}>Description</div>
              <textarea
                className="cq-textarea"
                style={{minHeight:140}}
                placeholder="Describe the problem clearly. Include what the input represents and what to compute..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />

              <div className="section-label" style={{marginTop:20}}>Difficulty</div>
              <div className="diff-pills">
                {DIFFICULTIES.map(d => {
                  const m = DIFF_META[d]
                  return (
                    <button
                      key={d}
                      className="diff-pill"
                      style={difficulty === d ? { background: m.bg, borderColor: m.border, color: m.color } : {}}
                      onClick={() => setDifficulty(d)}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>

              <div className="section-label" style={{marginTop:20}}>Topics</div>
              <div className="topic-wrap">
                {topics.map(t => (
                  <span className="topic-tag" key={t}>
                    {t}
                    <button className="topic-remove" onClick={() => removeTopic(t)}>×</button>
                  </span>
                ))}
              </div>
              <input
                className="cq-input"
                placeholder="Type a topic and press Enter..."
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTopic(topicInput) } }}
              />
              <div className="topic-suggestions">
                {TOPIC_SUGGESTIONS.filter(s => !topics.includes(s)).slice(0, 12).map(s => (
                  <button key={s} className="topic-sug" onClick={() => addTopic(s)}>{s}</button>
                ))}
              </div>

              <div className="section-label" style={{marginTop:24}}>Constraints</div>
              {constraints.map((c, i) => (
                <div className="constraint-row" key={i}>
                  <span className="constraint-num">{i + 1}.</span>
                  <input
                    className="cq-input"
                    placeholder={`e.g. 1 <= nums.length <= 10^4`}
                    value={c}
                    onChange={e => updateConstraint(i, e.target.value)}
                  />
                  {constraints.length > 1 && (
                    <button className="btn-icon" onClick={() => removeConstraint(i)}>×</button>
                  )}
                </div>
              ))}
              <button className="btn-add" onClick={addConstraint}>+ Add constraint</button>

              <div className="btn-row">
                <div />
                <button className="btn-next" disabled={!stepValid()} onClick={() => setStep(1)}>
                  Next: Formats →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 1: FORMATS ── */}
          {step === 1 && (
            <div className="cq-card">
              <div className="section-label">Input Format</div>
              <textarea
                className="cq-textarea"
                style={{minHeight:120}}
                placeholder={`Describe the input format.\ne.g. "First line contains N — the number of elements.\nSecond line contains N space-separated integers."`}
                value={inputFormat}
                onChange={e => setInputFormat(e.target.value)}
              />

              <div className="section-label" style={{marginTop:20}}>Output Format</div>
              <textarea
                className="cq-textarea"
                style={{minHeight:100}}
                placeholder={`Describe the expected output.\ne.g. "Print a single integer — the maximum water trapped."`}
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value)}
              />

              <div
                style={{
                  marginTop:20, padding:'14px 16px',
                  background:'rgba(91,110,245,0.06)',
                  border:'1px solid rgba(91,110,245,0.18)',
                  borderRadius:10,
                  fontFamily:'JetBrains Mono,monospace',
                  fontSize:12, color:'rgba(255,255,255,0.4)',
                  lineHeight:1.8,
                }}
              >
                <span style={{color:'#8b9cf7'}}>ℹ</span> These formats are shown to users on the problem page so they know exactly how to structure their input/output.
              </div>

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-next" disabled={!stepValid()} onClick={() => setStep(2)}>
                  Next: Test Cases →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: TEST CASES ── */}
          {step === 2 && (
            <div className="cq-card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                <div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:4}}>
                    Test Cases
                  </div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'rgba(255,255,255,0.2)'}}>
                    {testCases.filter(t=>!t.isHidden).length} public · {testCases.filter(t=>t.isHidden).length} hidden
                  </div>
                </div>
                <button className="btn-add" style={{margin:0}} onClick={addTC}>+ Add case</button>
              </div>

              {testCases.map((tc, i) => (
                <div className="tc-card" key={i}>
                  <div className="tc-header">
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span className="tc-num">CASE {i + 1}</span>
                      {tc.isHidden && <span className="hidden-badge">HIDDEN</span>}
                    </div>
                    <div className="tc-actions">
                      <div className="toggle-wrap">
                        <div
                          className={`toggle ${tc.isHidden ? 'on' : ''}`}
                          onClick={() => updateTC(i, 'isHidden', !tc.isHidden)}
                        >
                          <div className="toggle-knob" />
                        </div>
                        <span className={`toggle-label`}>{tc.isHidden ? 'hidden' : 'visible'}</span>
                      </div>
                      {testCases.length > 1 && (
                        <button className="btn-icon" onClick={() => removeTC(i)}>×</button>
                      )}
                    </div>
                  </div>
                  <div className="tc-grid">
                    <div>
                      <div className="section-label" style={{marginTop:0}}>Input</div>
                      <textarea
                        className="cq-textarea"
                        style={{minHeight:80,fontFamily:'JetBrains Mono,monospace',fontSize:12}}
                        placeholder={`{"height": [4, 2, 0, 3, 2, 5]}`}
                        value={tc.input}
                        onChange={e => updateTC(i, 'input', e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="section-label" style={{marginTop:0}}>Expected Output</div>
                      <textarea
                        className="cq-textarea"
                        style={{minHeight:80,fontFamily:'JetBrains Mono,monospace',fontSize:12}}
                        placeholder={`9`}
                        value={tc.output}
                        onChange={e => updateTC(i, 'output', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-next" disabled={!stepValid()} onClick={() => setStep('review')}>
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* ── REVIEW ── */}
          {step === 'review' && (
            <div className="cq-card">
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:20}}>
                Review before publishing
              </div>

              <div className="review-grid">
                <div className="review-item review-full">
                  <div className="review-lbl">Title</div>
                  <div className="review-val" style={{fontSize:16,fontFamily:'Syne,sans-serif',fontWeight:700}}>{title}</div>
                </div>
                <div className="review-item">
                  <div className="review-lbl">Difficulty</div>
                  <div className="review-val">
                    <span style={{
                      fontFamily:'JetBrains Mono,monospace',fontSize:12,fontWeight:600,
                      padding:'3px 10px',borderRadius:6,
                      background:DIFF_META[difficulty].bg,
                      border:`1px solid ${DIFF_META[difficulty].border}`,
                      color:DIFF_META[difficulty].color,
                    }}>{difficulty}</span>
                  </div>
                </div>
                <div className="review-item">
                  <div className="review-lbl">Topics</div>
                  <div className="review-tags">
                    {topics.map(t => <span className="review-tag" key={t}>{t}</span>)}
                  </div>
                </div>
                <div className="review-item review-full">
                  <div className="review-lbl">Description</div>
                  <div className="review-val" style={{fontSize:12,color:'rgba(255,255,255,0.45)'}}>{description}</div>
                </div>
                <div className="review-item">
                  <div className="review-lbl">Input Format</div>
                  <div className="review-val" style={{fontSize:12,color:'rgba(255,255,255,0.45)',whiteSpace:'pre-wrap'}}>{inputFormat}</div>
                </div>
                <div className="review-item">
                  <div className="review-lbl">Output Format</div>
                  <div className="review-val" style={{fontSize:12,color:'rgba(255,255,255,0.45)',whiteSpace:'pre-wrap'}}>{outputFormat}</div>
                </div>
                <div className="review-item review-full">
                  <div className="review-lbl">Constraints</div>
                  {constraints.filter(Boolean).map((c,i) => (
                    <div key={i} style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'rgba(255,255,255,0.4)',borderLeft:'2px solid rgba(139,92,246,0.4)',paddingLeft:10,marginBottom:4}}>{c}</div>
                  ))}
                </div>
                <div className="review-item review-full">
                  <div className="review-lbl">Test Cases ({testCases.length})</div>
                  <div className="tc-summary">
                    {testCases.map((tc, i) => (
                      <span key={i} className={`tc-pill ${tc.isHidden ? 'hidden' : ''}`}>
                        Case {i+1} {tc.isHidden ? '🔒' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="btn-submit-final"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving
                    ? <><span className="spinner"/>Publishing...</>
                    : <>⚡ Publish Problem</>}
                </button>
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === 3 && (
            <div className="cq-card">
              <div className="success-card">
                <span className="success-icon">🎯</span>
                <div className="success-title">Problem Published!</div>
                <div className="success-sub">
                  <span style={{color:'#c084fc',fontWeight:600}}>{title}</span> is now live on the platform.<br/>
                  {testCases.length} test cases · {testCases.filter(t=>t.isHidden).length} hidden
                </div>
                <div className="success-actions">
                  <Link
                    to={`/questions/${createdId}`}
                    style={{
                      fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,
                      color:'#fff',background:'linear-gradient(135deg,#8b5cf6,#5b6ef5)',
                      border:'none',borderRadius:9,padding:'11px 24px',
                      textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,
                    }}
                  >
                    View Problem →
                  </Link>
                  <button
                    onClick={() => {
                      setStep(0); setTitle(''); setDescription(''); setDifficulty('easy');
                      setTopics([]); setConstraints(['']); setInputFormat(''); setOutputFormat('');
                      setTestCases([EMPTY_TC(), EMPTY_TC()]); setCreatedId(null); setSuccess(null);
                    }}
                    style={{
                      fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,
                      color:'rgba(255,255,255,0.4)',
                      background:'transparent',border:'1px solid rgba(255,255,255,0.1)',
                      borderRadius:9,padding:'11px 24px',cursor:'pointer',
                    }}
                  >
                    + Create Another
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}