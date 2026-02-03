import { AppProvider } from './contexts/AppContext'
import InputSection from './components/InputSection'
import './App.css'

function App() {
  return (
    <AppProvider>
      <div className="app">
        <h1>职场说话保命神器</h1>
        <InputSection />
      </div>
    </AppProvider>
  )
}

export default App
