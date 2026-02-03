import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  // API Keys
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('apiKeys')
    return saved ? JSON.parse(saved) : {
      openai: '',
      qianwen: '',
      wenxin: '',
      deepseek: ''
    }
  })

  // Selected Model
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('selectedModel') || 'openai'
  })

  // History
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('history')
    return saved ? JSON.parse(saved) : []
  })

  // Conversion Result
  const [conversionResult, setConversionResult] = useState(null)

  // Loading State
  const [loading, setLoading] = useState(false)

  // Error State
  const [error, setError] = useState(null)

  // Save API Keys to localStorage
  useEffect(() => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys))
  }, [apiKeys])

  // Save selected model to localStorage
  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel)
  }, [selectedModel])

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history))
  }, [history])

  // Update API Key
  const updateApiKey = (model, key) => {
    setApiKeys(prev => ({
      ...prev,
      [model]: key
    }))
  }

  // Add to history
  const addToHistory = (input, results, model) => {
    const newItem = {
      id: Date.now().toString(),
      input,
      results,
      model,
      timestamp: Date.now()
    }
    setHistory(prev => [newItem, ...prev].slice(0, 50)) // Keep last 50
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('history')
  }

  const value = {
    apiKeys,
    selectedModel,
    setSelectedModel,
    history,
    conversionResult,
    setConversionResult,
    loading,
    setLoading,
    error,
    setError,
    updateApiKey,
    addToHistory,
    clearHistory
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
