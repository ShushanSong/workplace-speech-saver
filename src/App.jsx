import { AppProvider } from './contexts/AppContext'
import InputSection from './components/InputSection'
import ResultCards from './components/ResultCards'
import HistorySection from './components/HistorySection'
import './App.css'

function App() {
  return (
    <AppProvider>
      <div className="app">
        <h1>职场说话保命神器</h1>
        <InputSection />
        <ResultCards />
        <HistorySection />
      </div>
    </AppProvider>
  )
}

export default App
