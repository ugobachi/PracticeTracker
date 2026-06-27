import React, { useMemo } from 'react'
import Heatmap from './Heatmap.jsx'
import { currentYM, formatYM, formatDuration, formatDurationLong, calcStreak, getMonthGoal } from '../utils/dateUtils.js'
import { sumDuration } from '../utils/statsUtils.js'

export default function Home({ appState, records, onStartTimer, onNavigateDetail }) {
  const { instruments, goalHistory, settings } = appState
  const ym = currentYM()
  const visibleInstruments = instruments.filter(i => i.visible)

  const monthTotal = useMemo(() => sumDuration(records, { ym }), [records, ym])
  const allTotal = useMemo(() => sumDuration(records), [records])
  const streak = useMemo(() => calcStreak(records), [records])
  const recentRecords = useMemo(() =>
    [...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 10),
    [records]
  )

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>{formatYM(ym)}</h1>
          <div className="subtitle">今月の練習状況</div>
        </div>
        <button className="btn btn-primary" onClick={() => onStartTimer(null)}>
          <PlayIcon /> 練習開始
        </button>
      </div>

      {/* Instrument goal cards */}
      {visibleInstruments.length > 0 && (
        <>
          <div className="section-title">楽器別 月間目標</div>
          <div className={visibleInstruments.length >= 3 ? 'grid-2' : 'grid-2'} style={{ gridTemplateColumns: visibleInstruments.length === 1 ? '1fr' : 'repeat(2, 1fr)' }}>
            {visibleInstruments.map(inst => (
              <InstrumentCard
                key={inst.id}
                instrument={inst}
                records={records}
                ym={ym}
                goalHistory={goalHistory}
                onClick={() => onNavigateDetail(inst.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Summary cards */}
      <div style={{ marginTop: 20 }}>
        <div className="section-title">今月のサマリー</div>
        <div className="grid-3">
          <SummaryCard
            label="今月の合計"
            value={formatDurationLong(monthTotal)}
          />
          <SummaryCard
            label="累計（全楽器）"
            value={formatDuration(Math.round(allTotal / 60)) + (allTotal >= 60 ? '' : '')}
            valueRaw={`${Math.round(allTotal / 60)}h`}
          />
          <SummaryCard
            label={<><span className="streak-fire">🔥</span> 連続日数</>}
            value={`${streak}日`}
          />
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ marginTop: 24 }}>
        <div className="section-title" style={{ marginBottom: 8 }}>芝生ヒートマップ（過去6ヶ月）</div>
        <div className="card card-p">
          <Heatmap
            records={records}
            instrumentId={null}
            thresholds={settings.heatmapThresholds}
            colors={settings.heatmapColors}
          />
        </div>
      </div>

      {/* Recent records */}
      <div style={{ marginTop: 24 }}>
        <div className="section-title">最近の練習記録</div>
        {recentRecords.length === 0 ? (
          <div className="empty-state">まだ記録がありません。練習開始ボタンで記録しましょう！</div>
        ) : (
          <div className="record-list">
            {recentRecords.map(r => (
              <RecordRow key={r.id} record={r} instruments={instruments} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InstrumentCard({ instrument, records, ym, goalHistory, onClick }) {
  const actual = useMemo(() => sumDuration(records, { ym, instrument: instrument.id }), [records, ym, instrument.id])
  const goal = getMonthGoal(goalHistory, instrument.id, ym)
  const pct = goal ? Math.min(100, Math.round((actual / 60 / goal) * 100)) : null

  return (
    <div className="card card-p" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div className="color-dot" style={{ background: instrument.color, width: 10, height: 10 }} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>{instrument.name}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{instrument.abbr}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatDurationLong(actual)}</div>
          {goal && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>目標 {goal}h</div>}
        </div>
        {pct !== null && (
          <div style={{ fontSize: 13, fontWeight: 600, color: instrument.color }}>{pct}%</div>
        )}
      </div>
      {pct !== null && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: instrument.color }} />
        </div>
      )}
      {pct === null && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>目標未設定</div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, valueRaw }) {
  return (
    <div className="card card-p" style={{ textAlign: 'center' }}>
      <div className="stat-value">{valueRaw || value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function RecordRow({ record, instruments }) {
  const inst = instruments.find(i => i.id === record.instrument)
  return (
    <div className="record-row">
      <span className="record-date">{record.date.slice(5).replace('-', '/')}</span>
      {inst && (
        <span
          className="instrument-badge"
          style={{ background: inst.color + '33', color: inst.color }}
        >
          <span className="color-dot" style={{ background: inst.color }} />
          {inst.abbr}
        </span>
      )}
      <span className="record-content">
        {record.memo || record.piece || '—'}
        {record.piece && record.memo && <span className="record-piece"> / {record.piece}</span>}
      </span>
      {record.video && <span title="動画あり" style={{ fontSize: 12 }}>▶</span>}
      <span className="record-duration">{formatDuration(record.duration)}</span>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M4 2.5l8 4.5-8 4.5V2.5z"/>
    </svg>
  )
}
