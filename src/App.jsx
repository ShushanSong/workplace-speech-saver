import { useState } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import InputSection from './components/InputSection'
import ResultCards from './components/ResultCards'
import HistorySection from './components/HistorySection'
import SettingsPanel from './components/SettingsPanel'
import './App.css'

function AppContent() {
  const [activeTab, setActiveTab] = useState('home')
  const { error } = useApp()

  return (
    <div className="app">
      <h1>职场说话保命神器</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          转换
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          设置
        </button>
      </div>

      {activeTab === 'home' && (
        <>
          <InputSection />
          {error && <div className="error-message">{error}</div>}
          <ResultCards />
          <HistorySection />
        </>
      )}

      {activeTab === 'settings' && (
        <SettingsPanel />
      )}
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
