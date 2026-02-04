import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApp, AppProvider } from './AppContext.jsx'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('useApp hook', () => {
    it('throws error when used outside AppProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        renderHook(() => useApp())
      }).toThrow('useApp must be used within AppProvider')

      console.error = originalError
    })

    it('provides context value when used inside AppProvider', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current).toHaveProperty('apiKeys')
      expect(result.current).toHaveProperty('selectedModel')
      expect(result.current).toHaveProperty('history')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('updateApiKey')
      expect(result.current).toHaveProperty('addToHistory')
      expect(result.current).toHaveProperty('clearHistory')
    })
  })

  describe('API Keys state', () => {
    it('initializes with empty keys when localStorage is empty', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.apiKeys).toEqual({
        openai: '',
        qianwen: '',
        wenxin: '',
        deepseek: ''
      })
    })

    it('loads API keys from localStorage', () => {
      const savedKeys = {
        openai: 'sk-test1',
        qianwen: 'sk-test2',
        wenxin: 'sk-test3',
        deepseek: 'sk-test4'
      }
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedKeys))

      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.apiKeys).toEqual(savedKeys)
    })

    it('saves API keys to localStorage when updated', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      act(() => {
        result.current.updateApiKey('openai', 'new-key')
      })

      expect(result.current.apiKeys.openai).toBe('new-key')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'apiKeys',
        JSON.stringify({
          openai: 'new-key',
          qianwen: '',
          wenxin: '',
          deepseek: ''
        })
      )
    })
  })

  describe('Selected Model state', () => {
    it('initializes with "openai" when localStorage is empty', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.selectedModel).toBe('openai')
    })

    it('loads selected model from localStorage', () => {
      // Need to mock all localStorage.getItem calls in order
      // The order is: apiKeys, selectedModel, history
      localStorageMock.getItem
        .mockReturnValueOnce(null) // apiKeys
        .mockReturnValueOnce('qianwen') // selectedModel
        .mockReturnValueOnce(null) // history

      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.selectedModel).toBe('qianwen')
    })

    it('saves selected model to localStorage when changed', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      act(() => {
        result.current.setSelectedModel('deepseek')
      })

      expect(result.current.selectedModel).toBe('deepseek')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'selectedModel',
        'deepseek'
      )
    })
  })

  describe('History state', () => {
    it('initializes with empty array when localStorage is empty', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.history).toEqual([])
    })

    it('loads history from localStorage', () => {
      const savedHistory = [
        { id: '1', input: 'test', results: {}, model: 'openai', timestamp: 123456 }
      ]
      // Need to mock all localStorage.getItem calls in order
      localStorageMock.getItem
        .mockReturnValueOnce(null) // apiKeys
        .mockReturnValueOnce(null) // selectedModel
        .mockReturnValueOnce(JSON.stringify(savedHistory)) // history

      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.history).toEqual(savedHistory)
    })

    it('adds item to history with correct structure', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      const testResults = {
        '委婉礼貌': '委婉版本',
        '专业正式': '专业版本'
      }

      act(() => {
        result.current.addToHistory('我很生气', testResults, 'openai')
      })

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0]).toMatchObject({
        input: '我很生气',
        results: testResults,
        model: 'openai'
      })
      expect(result.current.history[0]).toHaveProperty('id')
      expect(result.current.history[0]).toHaveProperty('timestamp')
    })

    it('keeps only last 50 items in history', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      // Add 52 items
      act(() => {
        for (let i = 0; i < 52; i++) {
          result.current.addToHistory(`输入${i}`, {}, 'openai')
        }
      })

      expect(result.current.history).toHaveLength(50)
      // Most recent item should be first
      expect(result.current.history[0].input).toBe('输入51')
    })

    it('clears history and removes from localStorage', () => {
      const savedHistory = [
        { id: '1', input: 'test', results: {}, model: 'openai', timestamp: 123456 }
      ]
      // Need to mock all localStorage.getItem calls in order
      localStorageMock.getItem
        .mockReturnValueOnce(null) // apiKeys
        .mockReturnValueOnce(null) // selectedModel
        .mockReturnValueOnce(JSON.stringify(savedHistory)) // history

      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toEqual([])
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('history')
    })
  })

  describe('Other states', () => {
    it('manages loading state', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.loading).toBe(false)

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.loading).toBe(true)
    })

    it('manages error state', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.error).toBe(null)

      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.error).toBe('Test error')
    })

    it('manages conversionResult state', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: AppProvider
      })

      expect(result.current.conversionResult).toBe(null)

      const testResult = { '委婉礼貌': '测试' }

      act(() => {
        result.current.setConversionResult(testResult)
      })

      expect(result.current.conversionResult).toEqual(testResult)
    })
  })
})
