import React from 'react'

const NAV_ITEMS = [
  { id: 'home',     label: 'ホーム',     icon: HomeIcon },
  { id: 'calendar', label: 'カレンダー', icon: CalendarIcon },
  { id: 'graph',    label: 'グラフ',     icon: ChartIcon },
  { id: 'goals',    label: '目標設定',   icon: TargetIcon },
  { id: 'settings', label: '設定',       icon: SettingsIcon },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="app-name">Practice</div>
        <div className="app-sub">楽器練習トラッカー</div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 6.5L8 2l6 4.5V14H10v-3.5H6V14H2z" strokeLinejoin="round"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="11" rx="1.5"/>
      <path d="M2 7h12M5 2v2M11 2v2"/>
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 13L6 8l3 3 5-7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/>
      <circle cx="8" cy="8" r="3"/>
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5"/>
      <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.6 3.6l1 1M11.4 11.4l1 1M3.6 12.4l1-1M11.4 4.6l1-1" strokeLinecap="round"/>
    </svg>
  )
}
