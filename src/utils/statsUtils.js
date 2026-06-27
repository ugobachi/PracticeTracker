import { toYM } from './dateUtils.js'

export function sumDuration(records, filters = {}) {
  return records
    .filter(r => {
      if (filters.ym && toYM(r.date) !== filters.ym) return false
      if (filters.instrument && r.instrument !== filters.instrument) return false
      if (filters.date && r.date !== filters.date) return false
      return true
    })
    .reduce((acc, r) => acc + r.duration, 0)
}

export function getDailyTotals(records, instrumentId = null) {
  const map = {}
  for (const r of records) {
    if (instrumentId && r.instrument !== instrumentId) continue
    map[r.date] = (map[r.date] || 0) + r.duration
  }
  return map
}

export function getHeatmapLevel(minutes, thresholds) {
  if (minutes === 0) return 0
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (minutes > thresholds[i]) return i + 1
  }
  return 1
}

// Returns monthly totals per instrument for bar chart
export function getMonthlyTotals(records, months) {
  const result = {}
  for (const ym of months) {
    result[ym] = {}
    for (const r of records) {
      if (toYM(r.date) !== ym) continue
      result[ym][r.instrument] = (result[ym][r.instrument] || 0) + r.duration
    }
  }
  return result
}

// Returns cumulative totals per instrument over time (array of {date, ...instrumentTotals})
export function getCumulativeSeries(records, instrumentIds) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length === 0) return []

  const totals = {}
  const points = []
  const dateMap = {}

  for (const r of sorted) {
    if (!instrumentIds.includes(r.instrument)) continue
    totals[r.instrument] = (totals[r.instrument] || 0) + r.duration
    dateMap[r.date] = { ...totals }
  }

  const dates = Object.keys(dateMap).sort()
  let running = {}
  for (const date of dates) {
    running = { ...running, ...dateMap[date] }
    const point = { date }
    let total = 0
    for (const id of instrumentIds) {
      const val = Math.round((running[id] || 0) / 60 * 10) / 10
      point[id] = val
      total += running[id] || 0
    }
    point['total'] = Math.round(total / 60 * 10) / 10
    points.push(point)
  }
  return points
}

// Weekly totals for bar chart
export function getWeeklyTotals(records, weeks) {
  const result = {}
  for (const { label, start, end } of weeks) {
    result[label] = {}
    for (const r of records) {
      if (r.date < start || r.date > end) continue
      result[label][r.instrument] = (result[label][r.instrument] || 0) + r.duration
    }
  }
  return result
}
