import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useSelector } from "react-redux";

import axios from 'axios'
import Editor from '@monaco-editor/react'

const LANGUAGES = [
  { id: 'cpp', label: 'C++17', monaco: 'cpp' },
  { id: 'java', label: 'Java 21', monaco: 'java' },
  { id: 'python', label: 'Python 3', monaco: 'python' },
  { id: 'go', label: 'Go', monaco: 'go' },
]

const STARTERS = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // your code here
    return 0;
}`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // your code here
    }
}`,
  python: `import sys
input = sys.stdin.readline

def main():
    # your code here
    pass

main()`,
  go: `package main

import "fmt"

func main() {
    // your code here
}`,
}

const DIFF_META = {
  easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
  medium: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
  hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
}

const VERDICT_META = {
  AC: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Accepted' },
  WA: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Wrong Answer' },
  TLE: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: 'Time Limit Exceeded' },
  CE: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', label: 'Compile Error' },
  RE: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Runtime Error' },
}

// Convert JSON test case input → plain stdin
function toPlainInput(raw) {
  try {
    const parsed = JSON.parse(raw)
    return Object.values(parsed)
      .map(v => Array.isArray(v) ? v.join(' ') : String(v))
      .join('\n')
  } catch {
    return raw
  }
}

// Convert JSON output → plain string  e.g. "[0,1]" → "0 1"
function toPlainOutput(raw) {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.join(' ')
  } catch { }
  return raw
}

export default function Problems() {
  const { slug } = useParams()
  const location = useLocation()
  const id = location.state?.questionId
  const API = import.meta.env.VITE_API_URL

  // ── data ──
  const [problem, setProblem] = useState(null)
  const [testCases, setTestCases] = useState([])
  const [loading, setLoading] = useState(true)

  // ── editor ──
  const [lang, setLang] = useState('cpp')
  const [code, setCode] = useState(STARTERS.cpp)

  // ── tabs ──
  const [tab, setTab] = useState('description')
  const [activeTC, setActiveTC] = useState(0)

  // ── run / submit ──
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runOutput, setRunOutput] = useState(null)
  const [results, setResults] = useState(null)

  // ── custom I/O ──
  const [customInput, setCustomInput] = useState('')
  const [customOutput, setCustomOutput] = useState(null)
  const [customRunning, setCustomRunning] = useState(false)

  // ── AI review ──
  const [aiQuery, setAiQuery] = useState('')
  const [aiReview, setAiReview] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  // ── drag resize ──
  const [leftW, setLeftW] = useState(42)
  const dragging = useRef(false)
  const wrapRef = useRef(null)


const token = useSelector((state) => state.auth.token);

  // ── fetch problem + test cases ──
  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [pRes, tcRes] = await Promise.all([
          axios.get(`${API}/api/questions/${id}`),
          axios.get(`${API}/api/testcases/getTestCases/${id}`),
        ])
        setProblem(pRes?.data?.question || null)
        console.log("Token:", token);
        setTestCases(Array.isArray(tcRes?.data?.testCases) ? tcRes.data.testCases : [])
      } catch (err) {
        console.error('fetch error:', err)
        setProblem(null)
        setTestCases([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // reset code on language change
  useEffect(() => { setCode(STARTERS[lang]) }, [lang])

  // drag handler
  useEffect(() => {
    const onMove = e => {
      if (!dragging.current || !wrapRef.current) return
      const rect = wrapRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setLeftW(Math.min(70, Math.max(25, pct)))
    }
    const onUp = () => { dragging.current = false; document.body.style.cursor = '' }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ── RUN against visible test cases ──
  const handleRun = async () => {
    setRunning(true)
    setTab('results')
    setRunOutput(null)
    setResults(null)
    try {
      const cleanCode = code.replace(/`/g, '')
      const visible = testCases.filter(t => !t.isHidden).slice(0, 3)
      if (!visible.length) { setRunOutput([]); return }

      const outputs = await Promise.all(visible.map(async tc => {
        try {
          const plainIn = toPlainInput(tc.input)
          const plainOut = toPlainOutput(tc.output)

          const { data } = await axios.post(`${API}/api/code/run`, {
            language: lang,
            code: cleanCode,
            input: plainIn,
            expectedOutput: plainOut,
          },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

          const got = (data.output || '').trim()
          const isAccepted = data.verdict === 'AC' || got === plainOut.trim()

          return {
            verdict: isAccepted ? 'AC' : (data.error ? 'CE' : 'WA'),
            input: tc.input,
            expected: tc.output,
            got: got || data.error || 'No output',
            time: data.executionTime || '—',
            mem: data.memoryUsed || '—',
          }
        } catch (err) {
          return {
            verdict: 'CE',
            input: tc.input,
            expected: tc.output,
            got: err.response?.data?.error || err.message || 'Error',
            time: '—', mem: '—',
          }
        }
      }))
      setRunOutput(outputs)
    } catch (err) {
      console.error('run error:', err)
    } finally {
      setRunning(false)
    }
  }

  // ── SUBMIT ──
  const handleSubmit = async () => {
    setSubmitting(true)
    setTab('results')
    setResults(null)
    setRunOutput(null)
    try {
      const { data } = await axios.post(`${API}/api/code/submit`, {
        language: lang,
        code,
        questionId: id,
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      setResults(data.submissionResult || data)
    } catch (err) {
      console.error('submit error:', err)
      setResults({ verdict: 'CE', passed: 0, total: testCases.length })
    } finally {
      setSubmitting(false)
    }
  }

  // ── CUSTOM RUN ──
  const handleCustomRun = async () => {
    setCustomRunning(true)
    setCustomOutput(null)
    try {
      const cleanCode = code.replace(/`/g, '')
      const { data } = await axios.post(`${API}/api/code/run`, {
        language: lang,
        code: cleanCode,
        input: customInput,
        expectedOutput: '',
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      setCustomOutput({
        stdout: data.output || '',
        stderr: data.error || '',
        time: data.executionTime || '—',
        mem: data.memoryUsed || '—',
      })
    } catch (err) {
      setCustomOutput({
        stdout: '',
        stderr: err.response?.data?.error || err.message || 'Execution failed',
        time: '—', mem: '—',
      })
    } finally {
      setCustomRunning(false)
    }
  }

  // ── AI REVIEW ──
  const handleAiReview = async () => {
    setAiLoading(true)
    setAiReview(null)
    try {
      const { data } = await axios.post(`${API}/api/code/review`, {
        code,
        language: lang,
        questionId: id,
        query: aiQuery.trim() || null,
      },
    {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      setAiReview(data)
    } catch (err) {
      setAiReview({ error: err.response?.data?.message || err.message || 'Failed to get AI review' })
    } finally {
      setAiLoading(false)
    }
  }

  // ── loading screen ──
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'JetBrains Mono,monospace', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
        <span style={{ color: '#8b5cf6' }}>▶</span> loading problem...
      </div>
    </div>
  )

  const diff = DIFF_META[(problem?.difficulty || 'easy').toLowerCase()] || DIFF_META.easy
  const visibleTC = testCases.filter(t => !t.isHidden)
  const busy = running || submitting || customRunning || aiLoading

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        .cp-root {
          height: 100vh; display: flex; flex-direction: column;
          background: #0a0a0f; color: #e8e8f0;
          font-family: 'Syne', sans-serif; overflow: hidden;
        }

        /* TOP BAR */
        .topbar {
          height: 48px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px; background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; z-index: 10;
        }
        .topbar-left  { display: flex; align-items: center; gap: 16px; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .tb-logo {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600;
          color: #f0f0f8; text-decoration: none; display: flex; align-items: center; gap: 7px;
        }
        .tb-logo-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #8b5cf6;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .tb-sep   { color: rgba(255,255,255,0.1); font-size: 18px; }
        .tb-title {
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          color: rgba(255,255,255,0.35); max-width: 260px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* BUTTONS */
        .lang-select {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #c084fc;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.25);
          border-radius: 7px; padding: 5px 10px; outline: none; cursor: pointer;
          transition: border-color .2s;
        }
        .lang-select:hover { border-color: rgba(139,92,246,0.5); }
        .lang-select option { background: #1a1a2e; color: #e8e8f0; }

        .btn-run {
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          padding: 6px 16px; border-radius: 7px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6); cursor: pointer; transition: all .2s;
          display: flex; align-items: center; gap: 6px;
        }
        .btn-run:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-run:disabled { opacity: .45; cursor: not-allowed; }

        .btn-submit {
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          padding: 6px 18px; border-radius: 7px; border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: opacity .2s, transform .15s;
        }
        .btn-submit:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: .45; cursor: not-allowed; }

        /* SPLIT BODY */
        .cp-body { flex: 1; display: flex; overflow: hidden; position: relative; }

        /* LEFT PANEL */
        .left-panel {
          display: flex; flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.06);
          overflow: hidden; flex-shrink: 0;
        }
        .panel-tabs {
          display: flex; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02); flex-shrink: 0;
          overflow-x: auto; scrollbar-width: none;
        }
        .panel-tabs::-webkit-scrollbar { display: none; }
        .panel-tab {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          letter-spacing: .04em; text-transform: uppercase;
          padding: 11px 16px; color: rgba(255,255,255,0.28);
          cursor: pointer; border: none; background: transparent;
          border-bottom: 2px solid transparent;
          transition: color .2s, border-color .2s; white-space: nowrap; flex-shrink: 0;
        }
        .panel-tab.active { color: #c084fc; border-bottom-color: #c084fc; }
        .panel-tab:hover:not(.active) { color: rgba(255,255,255,0.5); }
        .panel-tab.ai-tab.active { color: #a78bfa; border-bottom-color: #a78bfa; }

        .panel-body {
          flex: 1; overflow-y: auto; padding: 24px;
          scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.3) transparent;
        }
        .panel-body::-webkit-scrollbar { width: 4px; }
        .panel-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }

        /* DESCRIPTION */
        .prob-title { font-size: 20px; font-weight: 800; color: #f0f0f8; margin-bottom: 12px; letter-spacing: -0.01em; }
        .prob-meta  { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .diff-badge {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600;
          padding: 3px 10px; border-radius: 6px; letter-spacing: .06em; text-transform: capitalize;
        }
        .topic-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 9px;
          border-radius: 5px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.35);
        }
        .prob-desc {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 2;
          color: rgba(255,255,255,0.55); margin-bottom: 24px; white-space: pre-wrap;
        }
        .prob-section-title {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,0.25);
          margin-bottom: 10px; margin-top: 24px;
        }
        .constraint-item {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.4);
          padding: 6px 12px; margin-bottom: 4px; background: rgba(255,255,255,0.03);
          border-left: 2px solid rgba(139,92,246,0.4); border-radius: 0 6px 6px 0;
        }

        /* TEST CASES */
        .tc-selector { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .tc-btn {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          padding: 6px 14px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: rgba(255,255,255,0.3); cursor: pointer; transition: all .2s;
        }
        .tc-btn.active { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.35); color: #c084fc; }
        .tc-block   { margin-bottom: 16px; }
        .tc-label {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 6px;
        }
        .tc-value {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #e8e8f0;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 10px 14px; white-space: pre-wrap; word-break: break-all;
        }

        /* CUSTOM I/O */
        .custom-section        { margin-bottom: 20px; }
        .custom-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .custom-textarea {
          width: 100%; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.6;
          color: #e8e8f0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 12px 14px; outline: none; resize: vertical; min-height: 120px;
          transition: border-color .2s; scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.2) transparent;
        }
        .custom-textarea:focus { border-color: rgba(139,92,246,0.4); background: rgba(139,92,246,0.04); }
        .custom-textarea::placeholder { color: rgba(255,255,255,0.15); }

        .btn-custom-run {
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
          padding: 6px 16px; border-radius: 7px;
          background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
          color: #c084fc; cursor: pointer; transition: all .2s;
          display: flex; align-items: center; gap: 6px;
        }
        .btn-custom-run:hover:not(:disabled) { background: rgba(139,92,246,0.25); border-color: rgba(139,92,246,0.5); }
        .btn-custom-run:disabled { opacity: .45; cursor: not-allowed; }

        .custom-output-box     { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; overflow: hidden; }
        .custom-output-header  {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 14px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .custom-output-title   { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .custom-output-meta    { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.2); display: flex; gap: 12px; }
        .custom-output-content {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.65;
          padding: 12px 14px; white-space: pre-wrap; word-break: break-all; min-height: 60px;
        }
        .custom-empty-hint { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.15); text-align: center; padding: 20px 0; }

        /* RESULTS */
        .result-verdict-box { border-radius: 12px; padding: 20px 22px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
        .verdict-icon  { font-size: 28px; }
        .verdict-label { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; }
        .verdict-sub   { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .perf-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .perf-card { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px; }
        .perf-val  { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 600; color: #f0f0f8; }
        .perf-lbl  { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-top: 4px; }
        .perf-pct  { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #22c55e; margin-top: 6px; }
        .run-result-row { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px; margin-bottom: 10px; }
        .run-result-row.pass { border-left: 3px solid #22c55e; }
        .run-result-row.fail { border-left: 3px solid #ef4444; }
        .rr-head   { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .rr-status { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: .04em; }
        .rr-meta   { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.25); }

        /* AI REVIEW */
        .ai-section        { margin-bottom: 16px; }
        .ai-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .btn-ai-review {
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
          padding: 6px 16px; border-radius: 7px;
          background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15));
          border: 1px solid rgba(139,92,246,0.4); color: #c084fc;
          cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 6px;
        }
        .btn-ai-review:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(139,92,246,0.4), rgba(168,85,247,0.25));
          border-color: rgba(139,92,246,0.6); box-shadow: 0 0 16px rgba(139,92,246,0.2);
        }
        .btn-ai-review:disabled { opacity: .4; cursor: not-allowed; }

        .ai-loading      { text-align: center; padding: 40px 0; }
        .ai-loading-dots { display: flex; justify-content: center; gap: 6px; }
        .ai-loading-dots span {
          width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6;
          animation: aiDot 1.2s ease-in-out infinite;
        }
        .ai-loading-dots span:nth-child(2) { animation-delay: .2s; }
        .ai-loading-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes aiDot { 0%,80%,100%{transform:scale(0.6);opacity:.3} 40%{transform:scale(1);opacity:1} }

        .ai-empty      { text-align: center; padding: 32px 16px; border: 1px dashed rgba(139,92,246,0.15); border-radius: 10px; background: rgba(139,92,246,0.03); }
        .ai-empty-icon { font-size: 24px; color: rgba(139,92,246,0.3); margin-bottom: 10px; }
        .ai-empty-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.8; color: rgba(255,255,255,0.2); }

        .ai-error-box  {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(239,68,68,0.7);
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15);
          border-radius: 8px; padding: 12px 14px; display: flex; gap: 8px;
        }
        .ai-review-box     { background: rgba(139,92,246,0.04); border: 1px solid rgba(139,92,246,0.15); border-radius: 10px; overflow: hidden; }
        .ai-review-header  {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px; background: rgba(139,92,246,0.08); border-bottom: 1px solid rgba(139,92,246,0.12);
        }
        .ai-review-badge   { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .08em; color: #a78bfa; font-weight: 600; }
        .ai-copy-btn {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 3px 10px; border-radius: 5px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.3); cursor: pointer; transition: all .15s;
        }
        .ai-copy-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .ai-review-content {
          padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.85;
          color: rgba(255,255,255,0.55); max-height: 480px; overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.2) transparent;
        }
        .ai-review-content::-webkit-scrollbar { width: 3px; }
        .ai-review-content::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 2px; }
        .ai-heading {
          font-size: 12px; font-weight: 600; color: #c084fc; letter-spacing: .05em; text-transform: uppercase;
          margin: 14px 0 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(139,92,246,0.15);
        }
        .ai-bullet { padding-left: 14px; position: relative; color: rgba(255,255,255,0.5); margin: 2px 0; }
        .ai-bullet::before { content: '›'; position: absolute; left: 0; color: #8b5cf6; }
        .ai-line   { margin: 2px 0; color: rgba(255,255,255,0.5); }
        .ai-line:empty { margin: 6px 0; }

        /* SPINNER */
        .spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2);
          border-top-color: currentColor; border-radius: 50%;
          animation: spin .7s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* DRAG BAR */
        .drag-bar { width: 4px; background: transparent; cursor: col-resize; flex-shrink: 0; position: relative; transition: background .2s; }
        .drag-bar:hover, .drag-bar:active { background: rgba(139,92,246,0.4); }
        .drag-bar::after {
          content: ''; position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%); width: 2px; height: 40px;
          border-radius: 1px; background: rgba(255,255,255,0.08);
        }

        /* RIGHT PANEL */
        .right-panel    { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .editor-topbar  {
          display: flex; align-items: center; gap: 8px; padding: 0 16px; height: 38px;
          background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }
        .editor-dot { width: 8px; height: 8px; border-radius: 50%; }

        /* STATUS BAR */
        .statusbar {
          height: 26px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px; background: rgba(139,92,246,0.12); border-top: 1px solid rgba(139,92,246,0.2);
          font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.3); flex-shrink: 0;
        }
        .statusbar-left { display: flex; gap: 16px; align-items: center; }
        .status-lang    { color: #c084fc; font-weight: 600; }
      `}</style>

      <div className="cp-root">

        {/* ── TOP BAR ── */}
        <div className="topbar">
          <div className="topbar-left">
            <Link to="/" className="tb-logo">
              <div className="tb-logo-dot" />
              JUDGE.IO
            </Link>
            <span className="tb-sep">/</span>
            <span className="tb-title">{problem?.title || 'Loading...'}</span>
          </div>
          <div className="topbar-right">
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <button className="btn-run" onClick={handleRun} disabled={busy}>
              {running ? <><span className="spinner" />Running</> : <>▶ Run</>}
            </button>
            <button className="btn-submit" onClick={handleSubmit} disabled={busy}>
              {submitting ? <><span className="spinner" />Judging</> : <>⚡ Submit</>}
            </button>
          </div>
        </div>

        {/* ── SPLIT BODY ── */}
        <div className="cp-body" ref={wrapRef}>

          {/* ── LEFT PANEL ── */}
          <div className="left-panel" style={{ width: `${leftW}%` }}>

            {/* Tab bar */}
            <div className="panel-tabs">
              {[
                { key: 'description', label: 'Problem' },
                { key: 'testcases', label: 'Test Cases' },
                { key: 'custom', label: 'Custom I/O' },
                { key: 'results', label: 'Results' },
                { key: 'ai', label: '✦ AI Review', cls: 'ai-tab' },
              ].map(t => (
                <button
                  key={t.key}
                  className={`panel-tab ${t.cls || ''} ${tab === t.key ? 'active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="panel-body">

              {/* ── DESCRIPTION ── */}
              {tab === 'description' && problem && (
                <>
                  <div className="prob-title">{problem.title}</div>
                  <div className="prob-meta">
                    <span className="diff-badge" style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}>
                      {problem.difficulty}
                    </span>
                    {(problem.topic || []).map(t => <span className="topic-tag" key={t}>{t}</span>)}
                  </div>
                  <div className="prob-desc">{problem.description}</div>

                  {visibleTC.length > 0 && (
                    <>
                      <div className="prob-section-title">Examples</div>
                      {visibleTC.map((tc, i) => (
                        <div key={tc._id} style={{ marginBottom: 16 }}>
                          <div className="tc-label">Example {i + 1}</div>
                          <div className="tc-value">
                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Input:  </span>{tc.input}{'\n'}
                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Output: </span>{tc.output}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {problem.constraints?.length > 0 && (
                    <>
                      <div className="prob-section-title">Constraints</div>
                      {problem.constraints.map((c, i) => <div className="constraint-item" key={i}>{c}</div>)}
                    </>
                  )}
                </>
              )}

              {/* ── TEST CASES ── */}
              {tab === 'testcases' && (
                <>
                  <div className="tc-selector">
                    {visibleTC.map((tc, i) => (
                      <button key={tc._id} className={`tc-btn ${activeTC === i ? 'active' : ''}`} onClick={() => setActiveTC(i)}>
                        Case {i + 1}
                      </button>
                    ))}
                  </div>
                  {visibleTC[activeTC] ? (
                    <>
                      <div className="tc-block">
                        <div className="tc-label">Input</div>
                        <div className="tc-value">{visibleTC[activeTC].input}</div>
                      </div>
                      <div className="tc-block">
                        <div className="tc-label">Expected Output</div>
                        <div className="tc-value">{visibleTC[activeTC].output}</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)', paddingTop: 20 }}>
                      No visible test cases.
                    </div>
                  )}
                </>
              )}

              {/* ── CUSTOM I/O ── */}
              {tab === 'custom' && (
                <>
                  <div className="custom-section">
                    <div className="custom-section-header">
                      <div className="tc-label" style={{ marginBottom: 0 }}>Custom Input</div>
                      <button className="btn-custom-run" onClick={handleCustomRun} disabled={busy}>
                        {customRunning ? <><span className="spinner" style={{ color: '#c084fc' }} />Running</> : <>▶ Run Code</>}
                      </button>
                    </div>
                    <textarea
                      className="custom-textarea"
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder={`Enter stdin directly:\n\n2 7 11 15\n9`}
                      spellCheck={false}
                    />
                  </div>

                  <div className="custom-section">
                    <div className="tc-label" style={{ marginBottom: 8 }}>Output</div>

                    {customRunning && (
                      <div style={{ textAlign: 'center', padding: '28px 0', fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                        <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2, margin: '0 auto 12px', color: '#8b5cf6' }} />
                        Executing...
                      </div>
                    )}

                    {!customRunning && !customOutput && (
                      <div className="custom-empty-hint">Run your code to see the output here.</div>
                    )}

                    {!customRunning && customOutput && (
                      <>
                        {customOutput.stdout ? (
                          <div className="custom-output-box" style={{ marginBottom: 10 }}>
                            <div className="custom-output-header">
                              <span className="custom-output-title">stdout</span>
                              <div className="custom-output-meta">
                                <span>{customOutput.time}</span>
                                <span>{customOutput.mem}</span>
                              </div>
                            </div>
                            <div className="custom-output-content" style={{ color: '#a8f0c0' }}>
                              {customOutput.stdout}
                            </div>
                          </div>
                        ) : null}

                        {customOutput.stderr ? (
                          <div className="custom-output-box">
                            <div className="custom-output-header">
                              <span className="custom-output-title" style={{ color: 'rgba(239,68,68,0.6)' }}>stderr</span>
                            </div>
                            <div className="custom-output-content" style={{ color: '#fca5a5' }}>
                              {customOutput.stderr}
                            </div>
                          </div>
                        ) : null}

                        {!customOutput.stdout && !customOutput.stderr && (
                          <div className="custom-output-box">
                            <div className="custom-output-header">
                              <span className="custom-output-title">stdout</span>
                              <div className="custom-output-meta">
                                <span>{customOutput.time}</span>
                                <span>{customOutput.mem}</span>
                              </div>
                            </div>
                            <div className="custom-output-content" style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                              (no output)
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ── RESULTS ── */}
              {tab === 'results' && (
                <>
                  {(submitting || running) && (
                    <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'JetBrains Mono,monospace', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                      <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3, margin: '0 auto 16px', color: '#8b5cf6' }} />
                      <div>{submitting ? 'Judging your solution...' : 'Running test cases...'}</div>
                    </div>
                  )}

                  {results && !submitting && (() => {
                    const vm = VERDICT_META[results.verdict] || VERDICT_META.WA
                    return (
                      <>
                        <div className="result-verdict-box" style={{ background: vm.bg, border: `1px solid ${vm.color}33` }}>
                          <span className="verdict-icon">{results.verdict === 'AC' ? '✓' : '✕'}</span>
                          <div>
                            <div className="verdict-label" style={{ color: vm.color }}>{vm.label}</div>
                            <div className="verdict-sub">{results.passed}/{results.total} test cases passed</div>
                          </div>
                        </div>
                        {results.runtime && (
                          <div className="perf-row">
                            <div className="perf-card">
                              <div className="perf-val">{results.runtime}</div>
                              <div className="perf-lbl">Runtime</div>
                              {results.runtimePct && <div className="perf-pct">Faster than {results.runtimePct}%</div>}
                            </div>
                            <div className="perf-card">
                              <div className="perf-val">{results.memory}</div>
                              <div className="perf-lbl">Memory</div>
                              {results.memoryPct && <div className="perf-pct">Less than {results.memoryPct}%</div>}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}

                  {runOutput && !running && runOutput.map((r, i) => {
                    const pass = r.verdict === 'AC'
                    return (
                      <div key={i} className={`run-result-row ${pass ? 'pass' : 'fail'}`}>
                        <div className="rr-head">
                          <span className="rr-status" style={{ color: pass ? '#22c55e' : '#ef4444' }}>
                            {pass ? '✓ Passed' : '✕ Failed'} — Case {i + 1}
                          </span>
                          <span className="rr-meta">{r.time} · {r.mem}</span>
                        </div>
                        <div className="tc-block">
                          <div className="tc-label">Input</div>
                          <div className="tc-value" style={{ fontSize: 12 }}>{r.input}</div>
                        </div>
                        <div className="tc-block">
                          <div className="tc-label">Expected</div>
                          <div className="tc-value" style={{ fontSize: 12 }}>{r.expected}</div>
                        </div>
                        {!pass && (
                          <div className="tc-block">
                            <div className="tc-label">Got</div>
                            <div className="tc-value" style={{ fontSize: 12, borderColor: 'rgba(239,68,68,0.3)' }}>{r.got}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {!results && !runOutput && !submitting && !running && (
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: 'rgba(255,255,255,0.2)', paddingTop: 20, textAlign: 'center' }}>
                      Run your code or submit to see results.
                    </div>
                  )}
                </>
              )}

              {/* ── AI REVIEW ── */}
              {tab === 'ai' && (
                <>
                  <div className="ai-section">
                    <div className="ai-section-header">
                      <div className="tc-label" style={{ marginBottom: 0 }}>
                        Ask AI <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optional)</span>
                      </div>
                      <button className="btn-ai-review" onClick={handleAiReview} disabled={aiLoading || !code.trim()}>
                        {aiLoading
                          ? <><span className="spinner" style={{ color: '#a78bfa' }} />Reviewing</>
                          : <>✦ Review Code</>}
                      </button>
                    </div>
                    <textarea
                      className="custom-textarea"
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      placeholder={`Leave blank for a general review, or ask something specific:\n\n• Why is my solution getting TLE?\n• Is there a more optimal approach?\n• Explain the time complexity`}
                      spellCheck={false}
                      style={{ minHeight: 90 }}
                    />
                  </div>

                  {aiLoading && (
                    <div className="ai-loading">
                      <div className="ai-loading-dots"><span /><span /><span /></div>
                      <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>
                        Analysing your code...
                      </div>
                    </div>
                  )}

                  {!aiLoading && !aiReview && (
                    <div className="ai-empty">
                      <div className="ai-empty-icon">✦</div>
                      <div className="ai-empty-text">
                        Get instant feedback — complexity analysis, bugs, optimisations, and hints.
                      </div>
                    </div>
                  )}

                  {!aiLoading && aiReview?.error && (
                    <div className="ai-error-box">
                      <span style={{ color: '#ef4444' }}>✕</span> {aiReview.error}
                    </div>
                  )}

                  {!aiLoading && aiReview && !aiReview.error && (
                    <div className="ai-review-box">
                      <div className="ai-review-header">
                        <span className="ai-review-badge">✦ AI Review</span>
                        <button className="ai-copy-btn" onClick={() => navigator.clipboard.writeText(aiReview.review || '')}>
                          Copy
                        </button>
                      </div>
                      <div className="ai-review-content">
                        {(aiReview.review || '').split('\n').map((line, i) => {
                          const parts = line.split(/(\*\*[^*]+\*\*)/)
                          const cls = line.startsWith('##') ? 'ai-heading'
                            : (line.startsWith('•') || line.startsWith('-')) ? 'ai-bullet'
                              : 'ai-line'
                          return (
                            <div key={i} className={cls}>
                              {parts.map((part, j) =>
                                part.startsWith('**') && part.endsWith('**')
                                  ? <strong key={j} style={{ color: '#e8e8f0', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
                                  : <span key={j}>{part.replace(/^##\s*/, '')}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>{/* end panel-body */}
          </div>{/* end left-panel */}

          {/* ── DRAG BAR ── */}
          <div
            className="drag-bar"
            onMouseDown={() => { dragging.current = true; document.body.style.cursor = 'col-resize' }}
          />

          {/* ── RIGHT PANEL (EDITOR) ── */}
          <div className="right-panel">
            <div className="editor-topbar">
              <div className="editor-dot" style={{ background: '#ef4444', opacity: .7 }} />
              <div className="editor-dot" style={{ background: '#eab308', opacity: .7 }} />
              <div className="editor-dot" style={{ background: '#22c55e', opacity: .7 }} />
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>
                solution.{lang === 'python' ? 'py' : lang === 'java' ? 'java' : lang === 'go' ? 'go' : 'cpp'}
              </span>
            </div>

            <Editor
              height="calc(100% - 64px)"
              language={lang}
              value={code}
              onChange={value => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 4,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                fontFamily: 'JetBrains Mono, monospace',
                fontLigatures: true,
              }}
            />

            <div className="statusbar">
              <div className="statusbar-left">
                <span className="status-lang">{LANGUAGES.find(l => l.id === lang)?.label}</span>
                <span>Spaces: 4</span>
              </div>
              <span>UTF-8</span>
            </div>
          </div>{/* end right-panel */}

        </div>{/* end cp-body */}
      </div>{/* end cp-root */}
    </>
  )
}