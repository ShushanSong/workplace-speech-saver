import { AppProvider } from './contexts/AppContext'
import InputSection from './components/InputSection'
import ResultCards from './components/ResultCards'
import './App.css'

function App() {
  return (
    <AppProvider>
      <div className="app">
        <h1>职场说话保命神器</h1>
        <InputSection />
        <ResultCards />
      </div>
    </AppProvider>
  )
}

export default App
