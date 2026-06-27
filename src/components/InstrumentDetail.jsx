import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Heatmap from './Heatmap.jsx'
import { currentYM, formatYM, formatDuration, formatDurationLong, calcStreak, getMonthGoal, toYM } from '../utils/dateUtils.js'
import { sumDuration, getCumulativeSeries } from '../utils/statsUtils.js'

export default function InstrumentDetail({ instrument, appState, records, onBack, onStartTimer, onDeleteRecord }) {
  const { goalHistory, settings } = appState
  const ym = currentYM()

  const instRecords = useMemo(() => records.filter(r => r.instrument === instrument.id), [records, instrument.id])
  const monthTotal = useMemo(() => sumDuration(instRecords, { ym }), [instRecords, ym])
  const allTotal = useMemo(() => sumDuration(instRecords), [instRecords])
  const streak = useMemo(() => calcStreak(records, instrument.id), [records, instrument.id])
  const goal = getMonthGoal(goalHistory, instrument.id, ym)
  const pct = goal ? Math.min(100, Math.round((monthTotal / 60 / goal) * 100)) : null
  const sortedRecords = useMemo(() => [...instRecords].sort((a, b) => b.date.localeCompare(a.date)), [instRecords])

  const chartData = useMemo(() => getCumulativeSeries(instRecords, [instrument.id]), [instRecords, instrument.id])

  return (
    <div className="page fade-in">
      {/* Back + header */}
      <button className="back-link" onClick={onBack}>
        <ChevronLeftIcon /> ホームに戻る
      </button>

      <div className="page-header">
        <div className="instrument-detail-header">
          <div className="instrument-color-bar" style={{ background: instrument.color }} />
          <div>
            <h1>{instrument.name}（{instrument.abbr}）</h1>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onStartTimer(instrument.id)}>
          <PlayIcon /> 練習開始
        </button>
      </div>

      {/* Goal progress */}
      <div className="card card-p" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{formatDurationLong(monthTotal)}</div>
            {goal && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>目標 {goal}h {pct !== null ? `（${pct}%）` : ''}</div>}
            {!goal && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>目標未設定</div>}
          </div>
          {pct !== null && (
            <div style={{ fontSize: 20, fontWeight: 700, color: instrument.color }}>{pct}%</div>
          )}
        </div>
        {pct !== null && (
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: instrument.color }} />
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card card-p" style={{ textAlign: 'center' }}>
          <div className="stat-value">{formatDuration(monthTotal)}</div>
          <div className="stat-label">今月の合計</div>
        </div>
        <div className="card card-p" style={{ textAlign: 'center' }}>
          <div className="stat-value">{Math.round(allTotal / 60)}h</div>
          <div className="stat-label">累計</div>
        </div>
        <div className="card card-p" style={{ textAlign: 'center' }}>
          <div className="stat-value">{streak}日</div>
          <div className="stat-label">🔥 連続日数</div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">芝生ヒートマップ</div>
        <div className="card card-p">
          <Heatmap
            records={records}
            instrumentId={instrument.id}
            thresholds={settings.heatmapThresholds}
            colors={settings.heatmapColors}
          />
        </div>
      </div>

      {/* Cumulative chart */}
      {chartData.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">累計成長曲線</div>
          <div className="card card-p">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="h" />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                  formatter={(v) => [`${v}h`, instrument.abbr]}
                />
                <Line
                  type="monotone"
                  dataKey={instrument.id}
                  stroke={instrument.color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Record list */}
      <div>
        <div className="section-title">練習記録一覧</div>
        {sortedRecords.length === 0 ? (
          <div className="empty-state">この楽器の記録はまだありません。</div>
        ) : (
          <div className="record-list">
            {sortedRecords.map(r => (
              <DetailRecordRow key={r.id} record={r} instrument={instrument} onDelete={onDeleteRecord} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRecordRow({ record, instrument, onDelete }) {
  const [showVideo, setShowVideo] = React.useState(false)

  return (
    <div className="record-row" style={{ flexWrap: 'wrap', gap: 8 }}>
      <span className="record-date">{record.date}</span>
      <span className="record-content">
        {record.memo || '—'}
        {record.piece && <span className="record-piece"> / {record.piece}</span>}
      </span>
      {record.video && (
        <button className="btn-icon" title="動画を見る" onClick={() => setShowVideo(v => !v)}>▶</button>
      )}
      <span className="record-duration">{formatDuration(record.duration)}</span>
      <button
        className="btn-icon"
        onClick={() => onDelete(record.id)}
        title="削除"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <TrashIcon />
      </button>
      {showVideo && record.videoBlob && (
        <div style={{ width: '100%', marginTop: 8 }}>
          <video controls style={{ maxWidth: 320, borderRadius: 4 }} src={URL.createObjectURL(record.videoBlob)} />
        </div>
      )}
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M4 2.5l8 4.5-8 4.5V2.5z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h10M5 4V2.5h4V4M5.5 4v6M8.5 4v6M3 4l.7 7.5h6.6L11 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
