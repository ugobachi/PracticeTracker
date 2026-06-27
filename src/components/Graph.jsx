import React, { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'
import { addMonths, currentYM, toYM } from '../utils/dateUtils.js'
import { getCumulativeSeries } from '../utils/statsUtils.js'

const RANGE_OPTIONS = [
  { label: '1ヶ月', months: 1 },
  { label: '3ヶ月', months: 3 },
  { label: '6ヶ月', months: 6 },
  { label: '1年', months: 12 },
  { label: '全期間', months: null },
]

export default function Graph({ appState, records }) {
  const { instruments } = appState
  const visibleInstruments = instruments.filter(i => i.visible)

  const [chartType, setChartType] = useState('cumulative') // cumulative | monthly | weekly
  const [rangeIdx, setRangeIdx] = useState(2) // default 6 months
  const [filterInst, setFilterInst] = useState('all')

  const selectedInstruments = filterInst === 'all'
    ? visibleInstruments
    : visibleInstruments.filter(i => i.id === filterInst)

  const instIds = selectedInstruments.map(i => i.id)

  const ym = currentYM()
  const rangeMonths = RANGE_OPTIONS[rangeIdx].months

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    if (!rangeMonths) return records
    const cutoff = addMonths(ym, -rangeMonths + 1)
    return records.filter(r => toYM(r.date) >= cutoff)
  }, [records, rangeMonths, ym])

  // Cumulative data
  const cumulativeData = useMemo(() => {
    const allIds = visibleInstruments.map(i => i.id)
    return getCumulativeSeries(filteredRecords, allIds)
  }, [filteredRecords, visibleInstruments])

  // Monthly data
  const monthlyData = useMemo(() => {
    const months = getMonthRange(ym, rangeMonths)
    const map = {}
    for (const r of filteredRecords) {
      const m = toYM(r.date)
      if (!map[m]) map[m] = { month: m }
      map[m][r.instrument] = (map[m][r.instrument] || 0) + r.duration
    }
    return months.map(m => ({
      month: parseInt(m.slice(5)) + '月',
      ...Object.fromEntries(instIds.map(id => [id, Math.round((map[m]?.[id] || 0) / 60 * 10) / 10])),
    }))
  }, [filteredRecords, ym, rangeMonths, instIds])

  // Weekly data
  const weeklyData = useMemo(() => {
    const weeks = getWeekRange(ym, rangeMonths)
    return weeks.map(({ label, start, end }) => {
      const point = { week: label }
      for (const id of instIds) {
        const sum = filteredRecords
          .filter(r => r.instrument === id && r.date >= start && r.date <= end)
          .reduce((s, r) => s + r.duration, 0)
        point[id] = Math.round(sum / 60 * 10) / 10
      }
      return point
    })
  }, [filteredRecords, ym, rangeMonths, instIds])

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>グラフ</h1>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="tabs" style={{ marginBottom: 0, flex: 'none' }}>
          {[
            { id: 'cumulative', label: '累計' },
            { id: 'monthly',    label: '月別' },
            { id: 'weekly',     label: '週別' },
          ].map(t => (
            <button key={t.id} className={`tab ${chartType === t.id ? 'active' : ''}`} onClick={() => setChartType(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {RANGE_OPTIONS.map((o, i) => (
            <button
              key={i}
              className={`btn btn-secondary btn-sm ${rangeIdx === i ? '' : ''}`}
              style={rangeIdx === i ? { background: 'var(--text)', color: 'var(--bg)' } : {}}
              onClick={() => setRangeIdx(i)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instrument filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          className={`btn btn-secondary btn-sm`}
          style={filterInst === 'all' ? { background: 'var(--text)', color: 'var(--bg)' } : {}}
          onClick={() => setFilterInst('all')}
        >
          全て
        </button>
        {visibleInstruments.map(i => (
          <button
            key={i.id}
            className="btn btn-sm"
            style={filterInst === i.id
              ? { background: i.color, color: '#fff', border: 'none' }
              : { background: i.color + '22', color: i.color, border: `1px solid ${i.color}44` }
            }
            onClick={() => setFilterInst(i.id)}
          >
            {i.abbr}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="card card-p">
        {chartType === 'cumulative' && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={cumulativeData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="h" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                formatter={(v, name) => [`${v}h`, visibleInstruments.find(i => i.id === name)?.abbr || name]}
              />
              {filterInst === 'all' ? (
                <>
                  {visibleInstruments.map(i => (
                    <Line key={i.id} type="monotone" dataKey={i.id} stroke={i.color} strokeWidth={2} dot={false} />
                  ))}
                  <Line type="monotone" dataKey="total" stroke="var(--text-secondary)" strokeWidth={1.5} strokeOpacity={0.5} dot={false} strokeDasharray="0" />
                </>
              ) : (
                selectedInstruments.map(i => (
                  <Line key={i.id} type="monotone" dataKey={i.id} stroke={i.color} strokeWidth={2} dot={false} />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        )}

        {(chartType === 'monthly' || chartType === 'weekly') && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartType === 'monthly' ? monthlyData : weeklyData}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey={chartType === 'monthly' ? 'month' : 'week'}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="h" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 }}
                formatter={(v, name) => [`${v}h`, visibleInstruments.find(i => i.id === name)?.abbr || name]}
              />
              {selectedInstruments.map(i => (
                <Bar key={i.id} dataKey={i.id} fill={i.color} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {visibleInstruments.map(i => (
          <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 12, height: 3, background: i.color, borderRadius: 2 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{i.name}（{i.abbr}）</span>
          </div>
        ))}
        {filterInst === 'all' && chartType === 'cumulative' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 12, height: 3, background: 'var(--text-secondary)', borderRadius: 2, opacity: 0.5 }} />
            <span style={{ color: 'var(--text-secondary)' }}>合計</span>
          </div>
        )}
      </div>
    </div>
  )
}

function getMonthRange(ym, rangeMonths) {
  if (!rangeMonths) {
    // return all months from earliest record — caller must handle
    return [ym]
  }
  const months = []
  for (let i = rangeMonths - 1; i >= 0; i--) {
    months.push(addMonths(ym, -i))
  }
  return months
}

function getWeekRange(ym, rangeMonths) {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const totalWeeks = rangeMonths ? rangeMonths * 4 : 52
  const weeks = []
  for (let i = totalWeeks - 1; i >= 0; i--) {
    const wEnd = new Date(end)
    wEnd.setDate(end.getDate() - i * 7)
    const wStart = new Date(wEnd)
    wStart.setDate(wEnd.getDate() - 6)
    const label = `${wStart.getMonth() + 1}/${wStart.getDate()}`
    weeks.push({
      label,
      start: wStart.toISOString().slice(0, 10),
      end: wEnd.toISOString().slice(0, 10),
    })
  }
  return weeks
}
