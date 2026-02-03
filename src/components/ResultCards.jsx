import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import './ResultCards.css'

const TONE_STYLES = {
  '委婉礼貌': '委婉礼貌',
  '专业正式': '专业正式',
  '友好和谐': '友好和谐',
  '幽默风趣': '幽默风趣',
  '严肃认真': '严肃认真'
}

function ResultCards() {
  const { conversionResult, loading, error } = useApp()
  const [copiedCard, setCopiedCard] = useState(null)

  const handleCopy = async (tone, text, e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCard(tone)
      setTimeout(() => setCopiedCard(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  if (loading) {
    return (
      <div className="result-cards">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>AI正在转换中，请稍候...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="result-cards">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!conversionResult) {
    return (
      <div className="result-cards">
        <div className="empty-state">
          <p>输入气话并点击"转换"按钮，即可看到5种不同语气的职场表达</p>
        </div>
      </div>
    )
  }

  return (
    <div className="result-cards">
      {Object.entries(conversionResult).map(([tone, text]) => (
        <div
          key={tone}
          className="result-card"
          onClick={(e) => handleCopy(tone, text, e)}
        >
          <div className="card-header">
            <span className={`tone-badge ${TONE_STYLES[tone]}`}>
              {tone}
            </span>
            <button
              className={`copy-button ${copiedCard === tone ? 'copied' : ''}`}
              onClick={(e) => handleCopy(tone, text, e)}
            >
              {copiedCard === tone ? '已复制' : '复制'}
            </button>
          </div>
          <div className="card-content">
            {text}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ResultCards
