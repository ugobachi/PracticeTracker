import React, { useState, useMemo } from 'react'
import HolidayJP from '@holiday-jp/holiday_jp'
import { currentYM, formatYM, addMonths, getCalendarDays, formatDuration, today } from '../utils/dateUtils.js'
import { sumDuration } from '../utils/statsUtils.js'

const DOW_LABELS = ['日','月','火','水','木','金','土']
const DOW_COLORS = {
  0: 'var(--sunday)',
  6: 'var(--saturday)',
}

export default function Calendar({ appState, records, onStartTimer }) {
  const { instruments, settings } = appState
  const [ym, setYm] = useState(currentYM())
  const [selectedDate, setSelectedDate] = useState(null)

  const cells = useMemo(() => getCalendarDays(ym), [ym])

  const visibleInstruments = instruments.filter(i => i.visible)

  // Build daily map: date -> [{abbr, color, duration}]
  const dailyMap = useMemo(() => {
    const map = {}
    for (const r of records) {
      if (!r.date.startsWith(ym)) continue
      if (!map[r.date]) map[r.date] = {}
      map[r.date][r.instrument] = (map[r.date][r.instrument] || 0) + r.duration
    }
    return map
  }, [records, ym])

  // Holidays
  const holidays = useMemo(() => {
    const [y, m] = ym.split('-').map(Number)
    try {
      const h = HolidayJP.between(new Date(y, m - 1, 1), new Date(y, m, 0))
      const map = {}
      for (const hd of h) {
        const key = hd.date.toISOString().slice(0, 10)
        map[key] = hd.name
      }
      return map
    } catch {
      return {}
    }
  }, [ym])

  const todayStr = today()

  const selectedDayRecords = useMemo(() => {
    if (!selectedDate) return []
    return records.filter(r => r.date === selectedDate)
      .sort((a, b) => a.id.localeCompare(b.id))
  }, [records, selectedDate])

  function getDateColor(dateStr, dow) {
    if (holidays[dateStr]) return 'var(--sunday)'
    if (dow === 0) return 'var(--sunday)'
    if (dow === 6) return 'var(--saturday)'
    return 'var(--text)'
  }

  return (
    <div className="page fade-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => setYm(m => addMonths(m, -1))}>
            <ChevronLeftIcon />
          </button>
          <h1 style={{ minWidth: 120, textAlign: 'center' }}>{formatYM(ym)}</h1>
          <button className="btn-icon" onClick={() => setYm(m => addMonths(m, 1))}>
            <ChevronRightIcon />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {visibleInstruments.map(i => (
            <span
              key={i.id}
              className="instrument-badge"
              style={{ background: i.color + '33', color: i.color }}
            >
              {i.abbr}
            </span>
          ))}
        </div>
      </div>

      {/* Goal bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {visibleInstruments.map(i => {
          const total = sumDuration(records, { ym, instrument: i.id })
          return (
            <span key={i.id} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ color: i.color, fontWeight: 600 }}>{i.abbr}</span> {formatDuration(total)}
            </span>
          )
        })}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {DOW_LABELS.map((d, i) => (
          <div
            key={i}
            className="calendar-day-header"
            style={{ color: DOW_COLORS[i] || 'var(--text-secondary)' }}
          >
            {d}
          </div>
        ))}

        {cells.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={idx} className="calendar-cell empty" />
          }

          const dow = new Date(dateStr + 'T00:00:00').getDay()
          const isToday = dateStr === todayStr
          const dayRecords = dailyMap[dateStr] || {}
          const holidayName = holidays[dateStr]
          const dayNum = parseInt(dateStr.slice(8))

          return (
            <div
              key={dateStr}
              className={`calendar-cell ${isToday ? 'today' : ''} ${selectedDate === dateStr ? 'selected' : ''}`}
              style={selectedDate === dateStr ? { background: 'var(--bg-hover)', outline: '2px solid var(--info)' } : {}}
              onClick={() => setSelectedDate(d => d === dateStr ? null : dateStr)}
            >
              <div className="calendar-date" style={{ color: getDateColor(dateStr, dow) }}>
                {dayNum}
                {holidayName && (
                  <span style={{ fontSize: 9, marginLeft: 3, color: 'var(--sunday)' }} title={holidayName}>祝</span>
                )}
              </div>
              <div className="calendar-tags">
                {Object.entries(dayRecords).map(([instId, dur]) => {
                  const inst = instruments.find(i => i.id === instId)
                  if (!inst) return null
                  return (
                    <span
                      key={instId}
                      className="calendar-tag"
                      style={{ background: inst.color + '33', color: inst.color }}
                    >
                      {inst.abbr} {formatDuration(dur)}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Day detail panel */}
      {selectedDate && (
        <div className="day-detail-panel fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>
              {selectedDate.replace(/-/g, '/')} &nbsp;
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                合計 {formatDuration(selectedDayRecords.reduce((s, r) => s + r.duration, 0))}
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onStartTimer(null)}>
              + 追加
            </button>
          </div>
          {selectedDayRecords.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>この日の記録はありません。</div>
          ) : (
            selectedDayRecords.map(r => {
              const inst = instruments.find(i => i.id === r.instrument)
              return (
                <div key={r.id} className="record-row" style={{ border: 'none', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  {inst && (
                    <span className="instrument-badge" style={{ background: inst.color + '33', color: inst.color }}>
                      {inst.abbr}
                    </span>
                  )}
                  <span className="record-content">{r.memo || '—'}{r.piece && ` / ${r.piece}`}</span>
                  {r.video && <span style={{ fontSize: 12 }}>▶</span>}
                  <span className="record-duration">{formatDuration(r.duration)}</span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
