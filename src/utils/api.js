const MODEL_CONFIGS = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4'
  },
  qianwen: {
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    model: 'qwen-turbo'
  },
  wenxin: {
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
    model: 'ernie-bot-turbo'
  },
  deepseek: {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
  }
}

const SYSTEM_PROMPT = `你是一个职场沟通专家。我会给你一句带有情绪的"气话"，
请将它转换为5种不同语气的职场表达版本。

要求：
1. 每个版本必须在30字以内
2. 保持礼貌和专业，避免冲突
3. 针对不同场景和对象进行优化

请严格按照以下JSON格式返回，不要添加任何其他文字：
{
  "委婉礼貌": "...",
  "专业正式": "...",
  "友好和谐": "...",
  "幽默风趣": "...",
  "严肃认真": "..."
}`

async function callOpenAI(apiKey, userInput) {
  const config = MODEL_CONFIGS.openai

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userInput }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content)
}

async function callQianwen(apiKey, userInput) {
  const config = MODEL_CONFIGS.qianwen

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      input: {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userInput }
        ]
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 1000
      }
    })
  })

  if (!response.ok) {
    throw new Error(`通义千问 API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.output.text
  return JSON.parse(content)
}

async function callWenxin(apiKey, userInput) {
  const config = MODEL_CONFIGS.wenxin

  const response = await fetch(`${config.endpoint}?access_token=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: `${SYSTEM_PROMPT}\n\n用户输入的气话：${userInput}` }
      ],
      temperature: 0.7,
      max_output_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`文心一言 API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.result
  return JSON.parse(content)
}

async function callDeepseek(apiKey, userInput) {
  const config = MODEL_CONFIGS.deepseek

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userInput }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`Deepseek API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content)
}

export async function callAIModel(model, apiKey, userInput) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('请先在设置中配置API密钥')
  }

  if (!userInput || !userInput.trim()) {
    throw new Error('请输入要转换的内容')
  }

  const callers = {
    openai: callOpenAI,
    qianwen: callQianwen,
    wenxin: callWenxin,
    deepseek: callDeepseek
  }

  const caller = callers[model]
  if (!caller) {
    throw new Error(`不支持的模型: ${model}`)
  }

  try {
    return await caller(apiKey, userInput)
  } catch (error) {
    // Try to parse error message
    if (error.message.includes('JSON')) {
      throw new Error('AI返回格式错误，请重试')
    }
    throw error
  }
}

export const MODEL_NAMES = {
  openai: 'OpenAI (GPT-4)',
  qianwen: '通义千问',
  wenxin: '文心一言',
  deepseek: 'Deepseek'
}
