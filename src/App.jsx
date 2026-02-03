import { AppProvider } from './contexts/AppContext'

function App() {
  return (
    <AppProvider>
      <div className="app">
        <h1>职场说话保命神器</h1>
      </div>
    </AppProvider>
  )
}

export default App
