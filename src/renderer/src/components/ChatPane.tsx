import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, AlertCircle, Settings, X } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

// AI配置弹窗组件
const AIConfigModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSave: (config: AIConfig) => void
  initialConfig: AIConfig
}> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [config, setConfig] = useState<AIConfig>(initialConfig)

  useEffect(() => {
    setConfig(initialConfig)
  }, [initialConfig])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-panel rounded-2xl w-[450px] max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-white">AI 配置</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">服务提供商</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
              className="w-full bg-black/30 border border-glass-border rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="deepseek">DeepSeek</option>
              <option value="ollama">本地 Ollama</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-black/30 border border-glass-border rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              API Base URL <span className="text-gray-600">(可选)</span>
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder={
                config.provider === 'ollama'
                  ? 'http://localhost:11434/v1'
                  : config.provider === 'deepseek'
                    ? 'https://api.deepseek.com/v1'
                    : '留空使用默认地址'
              }
              className="w-full bg-black/30 border border-glass-border rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">模型名称</label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder={
                config.provider === 'anthropic'
                  ? 'claude-3-sonnet-20240229'
                  : config.provider === 'deepseek'
                    ? 'deepseek-chat'
                    : config.provider === 'ollama'
                      ? 'llama2'
                      : 'gpt-3.5-turbo'
              }
              className="w-full bg-black/30 border border-glass-border rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-accent-primary/50 placeholder:text-gray-600"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ChatPane: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '嗨！我是 Ging AI 助手。有什么我可以帮你的吗？' }
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-3.5-turbo'
  })
  const [showConfigModal, setShowConfigModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentRequestId = useRef<string | null>(null)
  const streamingContentRef = useRef('')

  useEffect(() => {
    // 加载AI配置
    window.api.ai.getConfig().then((result) => {
      if (result.success && result.data) {
        setAiConfig(result.data)
      }
    })
  }, [])

  useEffect(() => {
    // 监听AI流式响应
    const unsubStream = window.api.ai.onStream((requestId, content) => {
      if (requestId === currentRequestId.current) {
        streamingContentRef.current += content
        setStreamingContent(streamingContentRef.current)
      }
    })

    const unsubEnd = window.api.ai.onStreamEnd((requestId) => {
      if (requestId === currentRequestId.current) {
        setIsStreaming(false)
        setMessages((prev) => [...prev, { role: 'assistant', content: streamingContentRef.current }])
        setStreamingContent('')
        streamingContentRef.current = ''
        currentRequestId.current = null
      }
    })

    return () => {
      unsubStream()
      unsubEnd()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSaveConfig = async (config: AIConfig) => {
    const result = await window.api.ai.setConfig(config)
    if (result.success) {
      setAiConfig(config)
      setError(null)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    const requestId = `req-${Date.now()}`
    currentRequestId.current = requestId
    setIsStreaming(true)
    setStreamingContent('')
    streamingContentRef.current = ''

    const chatMessages = [...messages, { role: 'user', content: userMessage }].map((m) => ({
      role: m.role,
      content: m.content
    }))

    const result = await window.api.ai.chat(chatMessages, requestId)

    if (!result.success) {
      setError(result.error || '发送失败')
      setIsStreaming(false)
      currentRequestId.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasApiKey = !!aiConfig.apiKey

  return (
    <div className="flex flex-col h-full bg-glass-bg backdrop-blur-md border-l border-glass-border">
      {/* Header */}
      <div className="p-4 border-b border-glass-border flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary">
            <Bot size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white font-sans">AI 助手</span>
        </div>
        <button
          onClick={() => setShowConfigModal(true)}
          className={`p-1.5 rounded-lg transition-colors ${hasApiKey ? 'hover:bg-white/10 text-gray-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}
          title="AI 配置"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Config hint */}
      {!hasApiKey && (
        <div
          className="p-3 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-200 cursor-pointer hover:bg-yellow-500/15 transition-colors"
          onClick={() => setShowConfigModal(true)}
        >
          <p className="flex items-center gap-2">
            <AlertCircle size={14} />
            点击此处或右上角设置按钮配置 AI
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg backdrop-blur-sm ${msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border-white/10'
                  : 'bg-white/10 border-white/10'
                }`}
            >
              {msg.role === 'assistant' ? (
                <Bot size={16} className="text-white" />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>
            <div className={`flex-1 space-y-2 max-w-[90%]`}>
              <div
                className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant'
                    ? 'glass-panel text-gray-100 rounded-tl-sm'
                    : 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-tr-sm'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {isStreaming && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center shrink-0 border border-white/10 shadow-lg backdrop-blur-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="glass-panel p-3.5 rounded-2xl rounded-tl-sm text-sm text-gray-100 leading-relaxed shadow-sm min-h-[40px]">
                <span className="whitespace-pre-wrap">{streamingContent}</span>
                <span className="inline-block w-1.5 h-4 ml-1 bg-accent-secondary align-middle animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-glass-border bg-white/5">
        <div className="relative group">
          <textarea
            className="w-full bg-black/20 border border-glass-border rounded-xl p-3 pl-4 text-sm text-white focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 resize-none h-24 transition-all placeholder:text-gray-500/80 backdrop-blur-sm"
            placeholder={!hasApiKey ? '请先点击设置按钮配置 AI...' : '问我任何问题...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming || !hasApiKey}
          />
          <div className="absolute bottom-3 right-3 flex gap-1">
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim() || !hasApiKey}
              className="p-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      <AIConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleSaveConfig}
        initialConfig={aiConfig}
      />
    </div>
  )
}

export default ChatPane
