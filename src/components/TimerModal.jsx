import React, { useState, useEffect, useRef } from 'react'
import { today, formatSeconds, formatDuration } from '../utils/dateUtils.js'

export default function TimerModal({ instruments, defaultInstrument, onSave, onClose }) {
  const [mode, setMode] = useState('timer') // 'timer' | 'manual'
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  const [instrument, setInstrument] = useState(defaultInstrument || instruments[0]?.id || '')
  const [date, setDate] = useState(today())
  const [manualMinutes, setManualMinutes] = useState('')
  const [memo, setMemo] = useState('')
  const [piece, setPiece] = useState('')
  const [videoFile, setVideoFile] = useState(null)

  const visibleInstruments = instruments.filter(i => i.visible)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function handleStartPause() {
    setRunning(r => !r)
  }

  function handleStop() {
    setRunning(false)
  }

  function handleSave() {
    const duration = mode === 'timer'
      ? Math.max(1, Math.round(elapsed / 60))
      : parseInt(manualMinutes) || 0

    if (duration <= 0) return

    const record = {
      date,
      instrument,
      duration,
      memo: memo.trim(),
      piece: piece.trim(),
      video: videoFile ? videoFile.name : null,
      videoBlob: videoFile || null,
    }
    onSave(record)
  }

  const timerDuration = Math.max(1, Math.round(elapsed / 60))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2>{mode === 'timer' ? 'タイマー' : '手入力'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {/* Mode tabs */}
          <div className="tabs">
            <button className={`tab ${mode === 'timer' ? 'active' : ''}`} onClick={() => { setMode('timer'); setRunning(false); setElapsed(0) }}>
              タイマー
            </button>
            <button className={`tab ${mode === 'manual' ? 'active' : ''}`} onClick={() => { setMode('manual'); setRunning(false) }}>
              手入力
            </button>
          </div>

          {mode === 'timer' && (
            <>
              <div className="timer-display">{formatSeconds(elapsed)}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                <button className="btn btn-secondary" onClick={handleStartPause}>
                  {running ? '一時停止' : elapsed > 0 ? '再開' : '開始'}
                </button>
                {elapsed > 0 && (
                  <button className="btn btn-secondary" onClick={handleStop}>停止</button>
                )}
              </div>
            </>
          )}

          {/* Form */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">楽器</label>
              <select className="form-select" value={instrument} onChange={e => setInstrument(e.target.value)}>
                {visibleInstruments.map(i => (
                  <option key={i.id} value={i.id}>{i.name}（{i.abbr}）</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">日付</label>
              <input
                type="date"
                className="form-input"
                value={date}
                max={today()}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          {mode === 'manual' && (
            <div className="form-group">
              <label className="form-label">練習時間（分）</label>
              <input
                type="number"
                className="form-input"
                value={manualMinutes}
                min="1"
                placeholder="例: 45"
                onChange={e => setManualMinutes(e.target.value)}
                style={{ width: 120 }}
              />
            </div>
          )}

          {mode === 'timer' && elapsed > 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              記録される時間: <strong>{formatDuration(timerDuration)}</strong>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">練習内容メモ（任意）</label>
            <textarea
              className="form-textarea"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="スラップ基礎、リズム練習など..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">曲名・教材名（任意）</label>
            <input
              type="text"
              className="form-input"
              value={piece}
              onChange={e => setPiece(e.target.value)}
              placeholder="Fly Me to the Moon..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">動画添付（任意）</label>
            <div className="file-input-wrap">
              <button className="btn btn-secondary btn-sm">
                {videoFile ? videoFile.name : 'ファイルを選択'}
              </button>
              <input
                type="file"
                accept="video/*"
                onChange={e => setVideoFile(e.target.files[0] || null)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>破棄</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={mode === 'timer' ? elapsed === 0 : !manualMinutes}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round"/>
    </svg>
  )
}
