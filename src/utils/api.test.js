import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callAIModel, MODEL_NAMES } from './api.js'

// Mock fetch globally
global.fetch = vi.fn()

describe('callAIModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parameter validation', () => {
    it('throws error when API key is empty', async () => {
      await expect(callAIModel('openai', '', 'test input'))
        .rejects.toThrow('请先在设置中配置API密钥')
    })

    it('throws error when API key is only whitespace', async () => {
      await expect(callAIModel('openai', '   ', 'test input'))
        .rejects.toThrow('请先在设置中配置API密钥')
    })

    it('throws error when user input is empty', async () => {
      await expect(callAIModel('openai', 'valid-key', ''))
        .rejects.toThrow('请输入要转换的内容')
    })

    it('throws error when user input is only whitespace', async () => {
      await expect(callAIModel('openai', 'valid-key', '   '))
        .rejects.toThrow('请输入要转换的内容')
    })

    it('throws error for unsupported model', async () => {
      await expect(callAIModel('unknown-model', 'valid-key', 'test input'))
        .rejects.toThrow('不支持的模型: unknown-model')
    })
  })

  describe('MODEL_NAMES', () => {
    it('has correct model names', () => {
      expect(MODEL_NAMES.openai).toBe('OpenAI (GPT-4)')
      expect(MODEL_NAMES.qianwen).toBe('通义千问')
      expect(MODEL_NAMES.wenxin).toBe('文心一言')
      expect(MODEL_NAMES.deepseek).toBe('Deepseek')
    })
  })
})

describe('callOpenAI integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls OpenAI API with correct parameters', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              '委婉礼貌': '委婉版本',
              '专业正式': '专业版本',
              '友好和谐': '友好版本',
              '幽默风趣': '幽默版本',
              '严肃认真': '严肃版本'
            })
          }
        }]
      })
    }
    global.fetch.mockResolvedValue(mockResponse)

    const { callAIModel } = await import('./api.js')
    const result = await callAIModel('openai', 'test-key', '我很生气')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key'
        })
      })
    )
    expect(result).toHaveProperty('委婉礼貌')
  })

  it('throws error when OpenAI API fails', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401
    })

    const { callAIModel } = await import('./api.js')
    await expect(callAIModel('openai', 'invalid-key', 'test'))
      .rejects.toThrow('OpenAI API error: 401')
  })
})
