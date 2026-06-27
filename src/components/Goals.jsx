import React, { useState, useEffect } from 'react'
import { addMonths, currentYM, formatYM } from '../utils/dateUtils.js'

export default function Goals({ appState, onSaveGoals }) {
  const { instruments, goals } = appState
  const visibleInstruments = instruments.filter(i => i.visible)

  const [localGoals, setLocalGoals] = useState(() => {
    const init = {}
    for (const i of visibleInstruments) {
      init[i.id] = { monthly: goals[i.id]?.monthly ?? '' }
    }
    return init
  })

  useEffect(() => {
    const updated = {}
    for (const i of visibleInstruments) {
      updated[i.id] = { monthly: goals[i.id]?.monthly ?? '' }
    }
    setLocalGoals(updated)
  }, [instruments])

  const nextYM = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()

  function handleSave() {
    const parsed = {}
    for (const [id, g] of Object.entries(localGoals)) {
      const m = parseInt(g.monthly)
      if (!isNaN(m) && m > 0) parsed[id] = { monthly: m }
    }
    onSaveGoals(parsed)
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>目標設定</h1>
          <div className="subtitle">楽器ごとの時間練習目標を設定します。</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>保存</button>
      </div>

      <div className="info-box">
        <InfoIcon />
        <span>目標を変更すると翌月から適用されます。過去の月の目標には影響しません。</span>
      </div>

      {visibleInstruments.length === 0 ? (
        <div className="empty-state">表示中の楽器がありません。設定画面で楽器を追加・表示してください。</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleInstruments.map(inst => (
            <div key={inst.id} className="card card-p">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div className="color-dot" style={{ background: inst.color, width: 10, height: 10 }} />
                <span style={{ fontWeight: 600, fontSize: 15 }}>{inst.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{inst.abbr}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <div className="form-label">現在の目標</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 90 }}
                      min="0"
                      value={localGoals[inst.id]?.monthly ?? ''}
                      onChange={e => setLocalGoals(prev => ({
                        ...prev,
                        [inst.id]: { ...prev[inst.id], monthly: e.target.value },
                      }))}
                      placeholder="0"
                    />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>時間 / 月</span>
                  </div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 16 }}>
                  {nextYM && `${formatYM(nextYM)} 適用予定`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="7" cy="7" r="5.5"/>
      <path d="M7 6v4M7 4.5v.5" strokeLinecap="round"/>
    </svg>
  )
}
