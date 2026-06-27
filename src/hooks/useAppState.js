import { useState, useCallback, useEffect } from 'react'
import { loadAppState, saveAppState, loadRecords, saveRecords } from '../utils/storage.js'

export function useAppState() {
  const [appState, setAppStateRaw] = useState(() => loadAppState())
  const [records, setRecordsRaw] = useState(() => loadRecords())

  const setAppState = useCallback((updater) => {
    setAppStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveAppState(next)
      return next
    })
  }, [])

  const setRecords = useCallback((updater) => {
    setRecordsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveRecords(next)
      return next
    })
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appState.settings.theme)
  }, [appState.settings.theme])

  const addRecord = useCallback((record) => {
    const id = `rec_${Date.now()}`
    setRecords(prev => [{ ...record, id }, ...prev])
    return id
  }, [setRecords])

  const deleteRecord = useCallback((id) => {
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [setRecords])

  const updateInstrument = useCallback((id, changes) => {
    setAppState(prev => ({
      ...prev,
      instruments: prev.instruments.map(i => i.id === id ? { ...i, ...changes } : i),
    }))
  }, [setAppState])

  const addInstrument = useCallback((instrument) => {
    setAppState(prev => ({
      ...prev,
      instruments: [...prev.instruments, instrument],
    }))
  }, [setAppState])

  const deleteInstrument = useCallback((id) => {
    setAppState(prev => ({
      ...prev,
      instruments: prev.instruments.filter(i => i.id !== id),
    }))
  }, [setAppState])

  const updateSettings = useCallback((changes) => {
    setAppState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...changes },
    }))
  }, [setAppState])

  const saveGoals = useCallback((newGoals) => {
    const ym = (() => {
      const d = new Date()
      d.setMonth(d.getMonth() + 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })()
    setAppState(prev => {
      const history = [...prev.goalHistory]
      for (const [instrument, goal] of Object.entries(newGoals)) {
        history.push({ instrument, monthly: goal.monthly, effectiveFrom: ym })
      }
      return { ...prev, goals: newGoals, goalHistory: history }
    })
  }, [setAppState])

  const restoreData = useCallback(({ appState: newAppState, records: newRecords }) => {
    saveAppState(newAppState)
    saveRecords(newRecords)
    setAppStateRaw(newAppState)
    setRecordsRaw(newRecords)
  }, [])

  const clearData = useCallback(() => {
    const fresh = loadAppState()
    saveAppState(fresh)
    saveRecords([])
    setAppStateRaw(fresh)
    setRecordsRaw([])
  }, [])

  return {
    appState,
    records,
    setAppState,
    setRecords,
    addRecord,
    deleteRecord,
    updateInstrument,
    addInstrument,
    deleteInstrument,
    updateSettings,
    saveGoals,
    restoreData,
    clearData,
  }
}
