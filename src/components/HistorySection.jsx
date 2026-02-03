import { useApp } from '../contexts/AppContext'
import { MODEL_NAMES } from '../utils/api'
import './HistorySection.css'

function HistorySection() {
  const { history, clearHistory, setConversionResult } = useApp()

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN')
  }

  const handleItemClick = (item) => {
    setConversionResult(item.results)
  }

  if (history.length === 0) {
    return (
      <div className="history-section">
        <div className="history-header">
          <h2>历史记录</h2>
        </div>
        <div className="empty-history">
          暂无历史记录
        </div>
      </div>
    )
  }

  return (
    <div className="history-section">
      <div className="history-header">
        <h2>历史记录 ({history.length})</h2>
        <button className="clear-button" onClick={clearHistory}>
          清除历史
        </button>
      </div>

      <div className="history-list">
        {history.map((item) => (
          <div
            key={item.id}
            className="history-item"
            onClick={() => handleItemClick(item)}
          >
            <div className="history-input">
              {item.input}
            </div>
            <div className="history-results">
              {Object.entries(item.results).map(([tone, text]) => (
                <span key={tone} className="history-result">
                  {tone}: {text}
                </span>
              ))}
            </div>
            <div className="history-meta">
              <span>{MODEL_NAMES[item.model]}</span>
              <span>{formatTimestamp(item.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistorySection
