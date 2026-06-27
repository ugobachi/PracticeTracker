const APP_STATE_KEY = 'app-state'
const RECORDS_KEY = 'records'

const DEFAULT_INSTRUMENTS = [
  { id: 'guitar', name: 'ギター', abbr: 'Gt.', color: '#E8A32E', visible: false },
  { id: 'bass',   name: 'ベース',  abbr: 'Ba.', color: '#1D9E75', visible: true  },
  { id: 'drums',  name: 'ドラム', abbr: 'Drs.', color: '#7F77DD', visible: true  },
]

const DEFAULT_SETTINGS = {
  theme: 'dark',
  heatmapThresholds: [15, 30, 60],
  heatmapColors: ['#9FE1CB', '#5DCAA5', '#1D9E75', '#0F6E56'],
}

const DEFAULT_APP_STATE = {
  instruments: DEFAULT_INSTRUMENTS,
  goals: {},
  goalHistory: [],
  settings: DEFAULT_SETTINGS,
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY)
    if (!raw) return DEFAULT_APP_STATE
    return { ...DEFAULT_APP_STATE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_APP_STATE
  }
}

export function saveAppState(state) {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state))
}

export function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecords(records) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function exportData(appState, records) {
  const data = {
    instruments: appState.instruments,
    goals: appState.goals,
    goalHistory: appState.goalHistory,
    records: records.map(r => ({ ...r, video: r.video ? r.videoName || r.video : null })),
    settings: appState.settings,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  a.href = url
  a.download = `practice-data-${today}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(json) {
  const data = JSON.parse(json)
  const appState = {
    instruments: data.instruments || DEFAULT_INSTRUMENTS,
    goals: data.goals || {},
    goalHistory: data.goalHistory || [],
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
  }
  const records = data.records || []
  return { appState, records }
}

export function clearAllData() {
  localStorage.removeItem(APP_STATE_KEY)
  localStorage.removeItem(RECORDS_KEY)
}
