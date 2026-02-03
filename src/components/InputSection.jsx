import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import './InputSection.css'

const EXAMPLES = [
  { text: '这个方案根本行不通！', label: '方案质疑' },
  { text: '你们怎么总是这样？', label: '团队抱怨' },
  { text: '我不干了！', label: '情绪爆发' },
  { text: '这谁写的代码？', label: '代码质疑' },
  { text: '又是你的错！', label: '指责他人' }
]

function InputSection() {
  const { selectedModel, setSelectedModel, loading } = useApp()
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    if (input.trim()) {
      // TODO: Trigger conversion
      console.log('Converting:', input)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="input-section">
      <h2>输入你的气话</h2>

      <div className="model-selector">
        <label>选择AI模型</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="openai">OpenAI (GPT-4)</option>
          <option value="qianwen">通义千问</option>
          <option value="wenxin">文心一言</option>
          <option value="deepseek">Deepseek</option>
        </select>
      </div>

      <div className="textarea-wrapper">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder="在这里输入你想说的气话...（Ctrl+Enter 快速提交）"
          maxLength={500}
        />
        <span className="char-count">{input.length}/500</span>
      </div>

      <div className="button-group">
        <button
          className="convert-button"
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              转换中...
            </>
          ) : (
            '转换'
          )}
        </button>
      </div>

      <div className="examples">
        <h3>试试这些示例：</h3>
        <div className="example-buttons">
          {EXAMPLES.map((example, index) => (
            <button
              key={index}
              className="example-button"
              onClick={() => setInput(example.text)}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InputSection
