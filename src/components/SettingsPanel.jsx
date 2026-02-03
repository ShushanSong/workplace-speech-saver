import { useApp } from '../contexts/AppContext'
import { ExternalLink } from 'lucide-react'
import './SettingsPanel.css'

const API_INFO = {
  openai: {
    name: 'OpenAI API Key',
    placeholder: 'sk-...',
    link: 'https://platform.openai.com/api-keys'
  },
  qianwen: {
    name: '通义千问 API Key',
    placeholder: 'sk-...',
    link: 'https://dashscope.aliyun.com/apiKey'
  },
  wenxin: {
    name: '文心一言 Access Token',
    placeholder: '输入您的Access Token',
    link: 'https://cloud.baidu.com/product/wenxinworkshop'
  },
  deepseek: {
    name: 'Deepseek API Key',
    placeholder: 'sk-...',
    link: 'https://platform.deepseek.com/api_keys'
  }
}

function SettingsPanel() {
  const { apiKeys, updateApiKey } = useApp()

  const handleKeyChange = (model, value) => {
    updateApiKey(model, value)
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>API 密钥设置</h2>
        <p>配置您的AI模型API密钥，密钥仅保存在浏览器本地</p>
      </div>

      {Object.entries(API_INFO).map(([model, info]) => (
        <div key={model} className="api-key-section">
          <h3>{info.name}</h3>
          <div className="api-key-item">
            <label className="api-key-label">API 密钥</label>
            <input
              type="password"
              className="api-key-input"
              placeholder={info.placeholder}
              value={apiKeys[model] || ''}
              onChange={(e) => handleKeyChange(model, e.target.value)}
            />
            <a
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              className="api-link"
            >
              <ExternalLink size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              获取API密钥 →
            </a>
          </div>
        </div>
      ))}

      <div className="security-notice">
        <strong>安全提示：</strong>
        您的API密钥仅存储在浏览器本地，不会上传到任何服务器。请妥善保管您的密钥，不要分享给他人。
      </div>
    </div>
  )
}

export default SettingsPanel
