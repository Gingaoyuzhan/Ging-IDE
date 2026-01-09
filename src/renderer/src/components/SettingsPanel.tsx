import React, { useState, useEffect } from 'react'
import { Settings, Bot, Code2, Palette, Save, ChevronLeft, Check } from 'lucide-react'

interface SettingsPanelProps {
  onBack: () => void
}

interface AIConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

type Theme = 'amber' | 'rose' | 'sky' | 'violet' | 'emerald'

interface ThemeOption {
  id: Theme
  name: string
  description: string
  primary: string
  secondary: string
}

const themes: ThemeOption[] = [
  { id: 'amber', name: 'Amber', description: '温暖活力', primary: '#f59e0b', secondary: '#fbbf24' },
  { id: 'rose', name: 'Rose', description: '热情浪漫', primary: '#f43f5e', secondary: '#fb7185' },
  { id: 'sky', name: 'Sky', description: '冷静清朗', primary: '#0ea5e9', secondary: '#38bdf8' },
  { id: 'violet', name: 'Violet', description: '神秘创意', primary: '#8b5cf6', secondary: '#a78bfa' },
  { id: 'emerald', name: 'Emerald', description: '清新自然', primary: '#10b981', secondary: '#34d399' },
]

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('ai')
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: ''
  })
  const [theme, setTheme] = useState<Theme>('amber')
  const [pendingTheme, setPendingTheme] = useState<Theme>('amber')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.ai.getConfig().then((result) => {
      if (result.success && result.data) {
        setAiConfig(result.data)
      }
    })
    // Load saved theme
    const savedTheme = (localStorage.getItem('Ging-IDE-theme') as Theme) || 'amber'
    setTheme(savedTheme)
    setPendingTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await window.api.ai.setConfig(aiConfig)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleThemeChange = (newTheme: Theme) => {
    setPendingTheme(newTheme)
    // Preview only - apply temporarily
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const handleSaveTheme = () => {
    if (pendingTheme !== theme) {
      setTheme(pendingTheme)
      localStorage.setItem('Ging-IDE-theme', pendingTheme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleResetTheme = () => {
    setPendingTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  const tabs = [
    { id: 'ai', icon: Bot, label: 'AI 配置' },
    { id: 'editor', icon: Code2, label: '编辑器' },
    { id: 'appearance', icon: Palette, label: '外观' }
  ]

  return (
    <div className="h-full w-full flex flex-col glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white/[0.02]">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-secondary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-accent-primary" />
          <span className="text-base font-semibold text-text-primary">设置</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-border p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'ai' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">AI 配置</h3>
                <p className="text-sm text-text-muted mb-6">
                  配置 AI 服务提供商和 API 密钥
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Provider
                  </label>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="ollama">Ollama (本地)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 bg-white/5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Base URL (可选)
                  </label>
                  <input
                    type="text"
                    value={aiConfig.baseUrl}
                    onChange={(e) => setAiConfig({ ...aiConfig, baseUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-3 py-2 bg-white/5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    placeholder="gpt-4 / claude-3-sonnet / deepseek-chat"
                    className="w-full px-3 py-2 bg-white/5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? '保存中...' : saved ? '已保存' : '保存配置'}
              </button>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">编辑器设置</h3>
                <p className="text-sm text-text-muted mb-6">
                  自定义代码编辑器的行为
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    字体大小
                  </label>
                  <select defaultValue="14" className="w-full px-3 py-2 bg-white/5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary">
                    <option value="12">12px</option>
                    <option value="13">13px</option>
                    <option value="14">14px</option>
                    <option value="15">15px</option>
                    <option value="16">16px</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Tab 大小
                  </label>
                  <select defaultValue="2" className="w-full px-3 py-2 bg-white/5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary">
                    <option value="2">2 空格</option>
                    <option value="4">4 空格</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-text-muted">
                更多编辑器设置即将推出
              </p>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">主题</h3>
                <p className="text-sm text-text-muted">
                  选择你喜欢的配色方案
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      pendingTheme === t.id
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-border bg-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    {pendingTheme === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center">
                        <Check size={12} className="text-black" />
                      </div>
                    )}

                    {/* Color preview */}
                    <div className="flex gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
                      />
                      <div className="flex-1 rounded-lg" style={{ background: t.primary, opacity: 0.15 }} />
                    </div>

                    <div className="text-left">
                      <div className="text-sm font-medium text-text-primary">{t.name}</div>
                      <div className="text-xs text-text-muted">{t.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Save/Reset buttons */}
              {pendingTheme !== theme && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/30">
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">主题已更改</p>
                    <p className="text-xs text-text-muted">点击保存应用更改</p>
                  </div>
                  <button
                    onClick={handleResetTheme}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveTheme}
                    className="px-4 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary text-sm font-medium rounded-lg transition-colors"
                  >
                    保存
                  </button>
                </div>
              )}

              {saved && (
                <div className="p-4 rounded-xl bg-mint/10 border border-mint/30 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-mint" />
                  <p className="text-sm text-mint">主题已保存</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
