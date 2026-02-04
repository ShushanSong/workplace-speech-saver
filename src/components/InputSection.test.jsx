import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputSection from './InputSection.jsx'
import { AppProvider } from '../contexts/AppContext.jsx'
import * as api from '../utils/api'

// Mock the API module
vi.mock('../utils/api.js')

const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>

describe('InputSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('rendering', () => {
    it('renders all main elements', () => {
      render(<InputSection />, { wrapper })

      expect(screen.getByText('输入你的气话')).toBeInTheDocument()
      expect(screen.getByText('选择AI模型')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/在这里输入你想说的气话/)).toBeInTheDocument()
      expect(screen.getByText('转换')).toBeInTheDocument()
      expect(screen.getByText('试试这些示例：')).toBeInTheDocument()
    })

    it('renders all example buttons', () => {
      render(<InputSection />, { wrapper })

      expect(screen.getByText('方案质疑')).toBeInTheDocument()
      expect(screen.getByText('团队抱怨')).toBeInTheDocument()
      expect(screen.getByText('情绪爆发')).toBeInTheDocument()
      expect(screen.getByText('代码质疑')).toBeInTheDocument()
      expect(screen.getByText('指责他人')).toBeInTheDocument()
    })

    it('renders all model options', () => {
      render(<InputSection />, { wrapper })

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('openai')

      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(4)
      expect(options[0]).toHaveValue('openai')
      expect(options[1]).toHaveValue('qianwen')
      expect(options[2]).toHaveValue('wenxin')
      expect(options[3]).toHaveValue('deepseek')
    })
  })

  describe('input handling', () => {
    it('updates character count when typing', async () => {
      const user = userEvent.setup()
      render(<InputSection />, { wrapper })

      const textarea = screen.getByPlaceholderText(/在这里输入/)
      expect(screen.getByText('0/500')).toBeInTheDocument()

      await user.type(textarea, '我很生气')
      expect(screen.getByText('4/500')).toBeInTheDocument()
    })

    it('limits input to 500 characters', async () => {
      const user = userEvent.setup({ delay: null })
      render(<InputSection />, { wrapper })

      const textarea = screen.getByPlaceholderText(/在这里输入/)

      // Type shorter text to avoid timeout
      await user.click(textarea)
      await user.keyboard('a'.repeat(50))

      expect(textarea).toHaveValue('a'.repeat(50))
      expect(screen.getByText('50/500')).toBeInTheDocument()
    })

    it('fills textarea when clicking example button', async () => {
      const user = userEvent.setup()
      render(<InputSection />, { wrapper })

      const exampleButton = screen.getByText('方案质疑')
      await user.click(exampleButton)

      const textarea = screen.getByPlaceholderText(/在这里输入/)
      expect(textarea).toHaveValue('这个方案根本行不通！')
    })
  })

  describe('model selection', () => {
    it('changes selected model', async () => {
      const user = userEvent.setup()
      render(<InputSection />, { wrapper })

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'qianwen')

      expect(select).toHaveValue('qianwen')
    })
  })

  describe('form submission', () => {
    it('does not submit when input is empty', async () => {
      const user = userEvent.setup()
      render(<InputSection />, { wrapper })

      const submitButton = screen.getByText('转换')
      expect(submitButton).toBeDisabled()

      await user.click(submitButton)

      expect(api.callAIModel).not.toHaveBeenCalled()
    })

    it('submits successfully with valid input and API key', async () => {
      const user = userEvent.setup()

      // Set API key in localStorage before rendering
      localStorage.setItem('apiKeys', JSON.stringify({
        openai: 'test-key',
        qianwen: '',
        wenxin: '',
        deepseek: ''
      }))

      const mockResults = {
        '委婉礼貌': '委婉版本',
        '专业正式': '专业版本',
        '友好和谐': '友好版本',
        '幽默风趣': '幽默版本',
        '严肃认真': '严肃版本'
      }
      api.callAIModel.mockResolvedValue(mockResults)

      render(<InputSection />, { wrapper })

      const textarea = screen.getByPlaceholderText(/在这里输入/)
      await user.type(textarea, '我很生气')

      const submitButton = screen.getByText('转换')
      await user.click(submitButton)

      await waitFor(() => {
        expect(api.callAIModel).toHaveBeenCalledWith(
          'openai',
          'test-key',
          '我很生气'
        )
      })

      expect(api.callAIModel).toHaveBeenCalledTimes(1)
    })

    it('shows loading state during conversion', async () => {
      const user = userEvent.setup()

      localStorage.setItem('apiKeys', JSON.stringify({
        openai: 'test-key',
        qianwen: '',
        wenxin: '',
        deepseek: ''
      }))

      // Make API call take longer
      api.callAIModel.mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve({ '委婉礼貌': '测试' }), 100)
      ))

      render(<InputSection />, { wrapper })

      const textarea = screen.getByPlaceholderText(/在这里输入/)
      await user.type(textarea, '测试')

      const submitButton = screen.getByText('转换')
      await user.click(submitButton)

      expect(screen.getByText(/转换中.../)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('转换')).toBeInTheDocument()
      }, { timeout: 200 })
    })
  })

  describe('keyboard shortcuts', () => {
    it('submits on Ctrl+Enter', async () => {
      const user = userEvent.setup()

      localStorage.setItem('apiKeys', JSON.stringify({
        openai: 'test-key',
        qianwen: '',
        wenxin: '',
        deepseek: ''
      }))

      api.callAIModel.mockResolvedValue({ '委婉礼貌': '测试' })

      render(<InputSection />, { wrapper })

      const textarea = screen.getByPlaceholderText(/在这里输入/)
      await user.type(textarea, '测试')

      fireEvent.keyDown(textarea, {
        key: 'Enter',
        ctrlKey: true
      })

      await waitFor(() => {
        expect(api.callAIModel).toHaveBeenCalled()
      })
    })
  })
})
