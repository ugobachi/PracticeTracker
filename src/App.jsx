import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Home from './components/Home.jsx'
import InstrumentDetail from './components/InstrumentDetail.jsx'
import Calendar from './components/Calendar.jsx'
import Graph from './components/Graph.jsx'
import Goals from './components/Goals.jsx'
import Settings from './components/Settings.jsx'
import TimerModal from './components/TimerModal.jsx'
import { useAppState } from './hooks/useAppState.js'

export default function App() {
  const {
    appState,
    records,
    addRecord,
    deleteRecord,
    updateInstrument,
    addInstrument,
    deleteInstrument,
    updateSettings,
    saveGoals,
    restoreData,
    clearData,
  } = useAppState()

  const [page, setPage] = useState('home') // home | calendar | graph | goals | settings
  const [detailInstrumentId, setDetailInstrumentId] = useState(null)
  const [timerOpen, setTimerOpen] = useState(false)
  const [timerDefaultInstrument, setTimerDefaultInstrument] = useState(null)

  function openTimer(instrumentId) {
    setTimerDefaultInstrument(instrumentId)
    setTimerOpen(true)
  }

  function handleSaveRecord(record) {
    addRecord(record)
    setTimerOpen(false)
  }

  function navigateDetail(instrumentId) {
    setDetailInstrumentId(instrumentId)
    setPage('instrument-detail')
  }

  function navigatePage(p) {
    setPage(p)
    setDetailInstrumentId(null)
  }

  const detailInstrument = detailInstrumentId
    ? appState.instruments.find(i => i.id === detailInstrumentId)
    : null

  return (
    <div className="app-layout">
      <Sidebar activePage={page} onNavigate={navigatePage} />

      <main className="main-area">
        {page === 'home' && (
          <Home
            appState={appState}
            records={records}
            onStartTimer={openTimer}
            onNavigateDetail={navigateDetail}
          />
        )}

        {page === 'instrument-detail' && detailInstrument && (
          <InstrumentDetail
            instrument={detailInstrument}
            appState={appState}
            records={records}
            onBack={() => setPage('home')}
            onStartTimer={openTimer}
            onDeleteRecord={deleteRecord}
          />
        )}

        {page === 'calendar' && (
          <Calendar
            appState={appState}
            records={records}
            onStartTimer={openTimer}
          />
        )}

        {page === 'graph' && (
          <Graph
            appState={appState}
            records={records}
          />
        )}

        {page === 'goals' && (
          <Goals
            appState={appState}
            onSaveGoals={saveGoals}
          />
        )}

        {page === 'settings' && (
          <Settings
            appState={appState}
            records={records}
            onUpdateInstrument={updateInstrument}
            onAddInstrument={addInstrument}
            onDeleteInstrument={deleteInstrument}
            onUpdateSettings={updateSettings}
            onRestoreData={restoreData}
            onClearData={clearData}
          />
        )}
      </main>

      {timerOpen && (
        <TimerModal
          instruments={appState.instruments}
          defaultInstrument={timerDefaultInstrument}
          onSave={handleSaveRecord}
          onClose={() => setTimerOpen(false)}
        />
      )}
    </div>
  )
}
