import React, { useMemo, useState } from 'react'
import { getHeatmapDays } from '../utils/dateUtils.js'
import { getDailyTotals, getHeatmapLevel } from '../utils/statsUtils.js'

export default function Heatmap({ records, instrumentId, thresholds, colors }) {
  const [tooltip, setTooltip] = useState(null)

  const days = useMemo(() => getHeatmapDays(), [])
  const dailyTotals = useMemo(
    () => getDailyTotals(records, instrumentId),
    [records, instrumentId]
  )

  // Build week columns
  const weeks = useMemo(() => {
    const cols = []
    let col = []
    for (let i = 0; i < days.length; i++) {
      col.push(days[i])
      const dow = new Date(days[i] + 'T00:00:00').getDay()
      if (dow === 6 || i === days.length - 1) {
        cols.push(col)
        col = []
      }
    }
    return cols
  }, [days])

  // Month label positions
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = null
    weeks.forEach((week, colIdx) => {
      const month = week[0]?.slice(0, 7)
      if (month && month !== lastMonth) {
        labels.push({ colIdx, label: parseInt(week[0].slice(5, 7)) + '月' })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  const cellColor = (date) => {
    if (!date) return 'transparent'
    const minutes = dailyTotals[date] || 0
    const level = getHeatmapLevel(minutes, thresholds)
    if (level === 0) return 'var(--heatmap-empty)'
    return colors[level - 1]
  }

  return (
    <div>
      {/* Month labels */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 4, paddingLeft: 0 }}>
        {weeks.map((_, i) => {
          const lbl = monthLabels.find(l => l.colIdx === i)
          return (
            <div key={i} style={{ width: 14, flexShrink: 0, fontSize: 10, color: 'var(--text-secondary)' }}>
              {lbl ? lbl.label : ''}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* Weekday labels */}
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 14px)', gap: 3, marginRight: 2 }}>
          {['日','月','火','水','木','金','土'].map((d, i) => (
            <div key={i} style={{ height: 14, fontSize: 10, color: 'var(--text-secondary)', lineHeight: '14px' }}>
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="heatmap-wrap" style={{ position: 'relative' }}>
          <div className="heatmap-grid">
            {weeks.map((week, wIdx) =>
              Array.from({ length: 7 }, (_, rowIdx) => {
                const date = week[rowIdx] ?? null
                // check if this date is in future
                const isFuture = date && date > new Date().toISOString().slice(0, 10)
                return (
                  <div
                    key={`${wIdx}-${rowIdx}`}
                    className="heatmap-cell"
                    style={{ background: isFuture ? 'transparent' : cellColor(date) }}
                    title={date ? `${date}: ${dailyTotals[date] || 0}分` : ''}
                    onMouseEnter={(e) => date && setTooltip({ date, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })
            )}
          </div>

          {tooltip && (
            <div style={{
              position: 'fixed',
              left: tooltip.x + 8,
              top: tooltip.y - 28,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 11,
              color: 'var(--text)',
              zIndex: 200,
              pointerEvents: 'none',
              boxShadow: 'var(--shadow)',
            }}>
              {tooltip.date}: {dailyTotals[tooltip.date] || 0}分
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <div className="heatmap-legend">
          <span>少</span>
          <div className="heatmap-legend-cells">
            <div className="heatmap-cell" style={{ background: 'var(--heatmap-empty)' }} />
            {colors.map((c, i) => (
              <div key={i} className="heatmap-cell" style={{ background: c }} />
            ))}
          </div>
          <span>多</span>
        </div>
      </div>
    </div>
  )
}
