export const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
export const WEEKDAY_NAMES = ['日','月','火','水','木','金','土']

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function toYM(dateStr) {
  return dateStr.slice(0, 7)
}

export function formatYM(ym) {
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m)}月`
}

export function addMonths(ym, n) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function currentYM() {
  return today().slice(0, 7)
}

export function getDaysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function getFirstDayOfWeek(ym) {
  // Returns 0=Sun, 1=Mon, ...
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).getDay()
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatDurationLong(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}分`
  if (m === 0) return `${h}時間`
  return `${h}時間 ${m}分`
}

export function formatSeconds(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Returns array of {date, weekCol, weekRow} for heatmap (past 6 months)
export function getHeatmapDays() {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setMonth(start.getMonth() - 6)
  // align start to Sunday
  const startDay = start.getDay()
  start.setDate(start.getDate() - startDay)

  const days = []
  const cur = new Date(start)
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export function getCalendarDays(ym) {
  const firstDow = getFirstDayOfWeek(ym)
  const daysInMonth = getDaysInMonth(ym)
  const [y, m] = ym.split('-').map(Number)

  const cells = []
  // leading empty cells
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${ym}-${String(d).padStart(2, '0')}`)
  }
  return cells
}

export function calcStreak(records, instrumentId = null) {
  const dateSet = new Set(
    records
      .filter(r => !instrumentId || r.instrument === instrumentId)
      .map(r => r.date)
  )
  if (dateSet.size === 0) return 0

  let streak = 0
  const cur = new Date()
  cur.setHours(0, 0, 0, 0)

  // if today has no record, start from yesterday
  const todayStr = cur.toISOString().slice(0, 10)
  if (!dateSet.has(todayStr)) cur.setDate(cur.getDate() - 1)

  while (true) {
    const s = cur.toISOString().slice(0, 10)
    if (!dateSet.has(s)) break
    streak++
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

export function getMonthGoal(goalHistory, instrumentId, ym) {
  const relevant = goalHistory
    .filter(g => g.instrument === instrumentId && g.effectiveFrom <= ym)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
  return relevant[0]?.monthly ?? null
}
