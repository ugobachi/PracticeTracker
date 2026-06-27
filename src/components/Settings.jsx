import React, { useState } from 'react'
import { exportData, importData, clearAllData } from '../utils/storage.js'

const DEFAULT_COLORS = ['#1D9E75','#7F77DD','#E8A32E','#E05555','#5588CC','#E8776A','#55AAA0','#9975E8']

export default function Settings({ appState, records, onUpdateInstrument, onAddInstrument, onDeleteInstrument, onUpdateSettings, onRestoreData, onClearData }) {
  const { instruments, settings } = appState
  const [newName, setNewName] = useState('')
  const [newAbbr, setNewAbbr] = useState('')
  const [newColor, setNewColor] = useState('#1D9E75')
  const [confirmClear, setConfirmClear] = useState(false)
  const [thresholds, setThresholds] = useState([...settings.heatmapThresholds])

  function handleAddInstrument() {
    if (!newName.trim()) return
    const id = newName.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    onAddInstrument({
      id,
      name: newName.trim(),
      abbr: newAbbr.trim() || newName.trim().slice(0, 3) + '.',
      color: newColor,
      visible: true,
    })
    setNewName('')
    setNewAbbr('')
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const { appState: newState, records: newRecords } = importData(ev.target.result)
        if (confirm('既存データを上書きしますか？')) {
          onRestoreData({ appState: newState, records: newRecords })
        }
      } catch {
        alert('JSONの読み込みに失敗しました。')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleExport() {
    exportData(appState, records)
  }

  function handleSaveThresholds() {
    onUpdateSettings({ heatmapThresholds: thresholds.map(Number) })
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>設定</h1>
      </div>

      {/* Instruments */}
      <div className="section-title">楽器の管理</div>
      <div className="settings-list" style={{ marginBottom: 20 }}>
        {instruments.map(inst => (
          <div key={inst.id} className="settings-item">
            <div className="color-dot" style={{ background: inst.color, width: 12, height: 12 }} />
            <div className="settings-item-info">
              <span style={{ fontWeight: 600 }}>{inst.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 6 }}>{inst.abbr}</span>
            </div>
            <label className="toggle" title={inst.visible ? '表示中' : '非表示'}>
              <input
                type="checkbox"
                checked={inst.visible}
                onChange={e => onUpdateInstrument(inst.id, { visible: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
            <button
              className="btn-icon"
              style={{ color: 'var(--text-tertiary)' }}
              onClick={() => {
                if (confirm(`「${inst.name}」を削除しますか？関連する記録は残ります。`)) {
                  onDeleteInstrument(inst.id)
                }
              }}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {/* Add instrument */}
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>楽器を追加</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">楽器名</label>
            <input
              className="form-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="例: ピアノ"
            />
          </div>
          <div className="form-group">
            <label className="form-label">略称</label>
            <input
              className="form-input"
              value={newAbbr}
              onChange={e => setNewAbbr(e.target.value)}
              placeholder="例: Pn."
              style={{ maxWidth: 80 }}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">カラー</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DEFAULT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: '50%', background: c,
                  border: newColor === c ? '2px solid var(--text)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              />
            ))}
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              style={{ width: 24, height: 24, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
              title="カスタムカラー"
            />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAddInstrument}>追加</button>
      </div>

      <div className="divider" />

      {/* Theme */}
      <div className="section-title">テーマ</div>
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary"
            style={settings.theme === 'dark' ? { background: 'var(--text)', color: 'var(--bg)' } : {}}
            onClick={() => onUpdateSettings({ theme: 'dark' })}
          >
            ダーク
          </button>
          <button
            className="btn btn-secondary"
            style={settings.theme === 'light' ? { background: 'var(--text)', color: 'var(--bg)' } : {}}
            onClick={() => onUpdateSettings({ theme: 'light' })}
          >
            ライト
          </button>
        </div>
      </div>

      <div className="divider" />

      {/* Heatmap thresholds */}
      <div className="section-title">ヒートマップ 閾値設定</div>
      <div className="card card-p" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
          各レベルの境界値（分）を設定します。
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          {thresholds.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Lv{i + 1}:</span>
              <input
                type="number"
                className="form-input"
                style={{ width: 64 }}
                value={t}
                min="1"
                onChange={e => {
                  const next = [...thresholds]
                  next[i] = parseInt(e.target.value) || 0
                  setThresholds(next)
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>分</span>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={handleSaveThresholds}>適用</button>
        </div>

        {/* Color preview */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 20, height: 20, borderRadius: 3, background: 'var(--heatmap-empty)', border: '1px solid var(--border)' }} />
          {settings.heatmapColors.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 20, height: 20, borderRadius: 3, background: c }} />
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Data management */}
      <div className="section-title">データ管理</div>
      <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <ExportIcon /> JSONエクスポート
          </button>
          <div className="file-input-wrap">
            <button className="btn btn-secondary">
              <ImportIcon /> JSONインポート
            </button>
            <input type="file" accept=".json,application/json" onChange={handleImport} />
          </div>
        </div>

        <div className="divider" style={{ margin: '4px 0' }} />

        <div>
          {!confirmClear ? (
            <button className="btn btn-secondary btn-sm" style={{ color: '#c0392b' }} onClick={() => setConfirmClear(true)}>
              全データを削除
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#c0392b' }}>本当に削除しますか？</span>
              <button className="btn btn-danger btn-sm" onClick={() => { onClearData(); setConfirmClear(false) }}>削除</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(false)}>キャンセル</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h10M5 4V2.5h4V4M5.5 4v6M8.5 4v6M3 4l.7 7.5h6.6L11 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 1v7M4 5.5l2.5 2.5L9 5.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 9v2.5h9V9" strokeLinecap="round"/>
    </svg>
  )
}

function ImportIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 8V1M4 3.5L6.5 1 9 3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 9v2.5h9V9" strokeLinecap="round"/>
    </svg>
  )
}
