import React, { useEffect, useState, useCallback, useRef } from 'react'
import Editor, { useMonaco, OnMount } from '@monaco-editor/react'
import { Save } from 'lucide-react'
import type * as Monaco from 'monaco-editor'

interface CodeEditorProps {
  filePath: string | null
  onClose?: () => void
  onSave?: () => void
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    sh: 'shell',
    bash: 'shell',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    sql: 'sql'
  }
  return langMap[ext || ''] || 'plaintext'
}

const defaultContent = `import React from 'react';

// 欢迎来到 Ging
// 一个为你打造的创意编程空间。

function App() {
  return (
    <div className="container">
       <h1>你好，世界！</h1>
       <p>在这里开始你的创造...</p>
    </div>
  );
}

export default App;`

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, onClose, onSave }) => {
  const monaco = useMonaco()
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const [content, setContent] = useState<string>(defaultContent)
  const [originalContent, setOriginalContent] = useState<string>(defaultContent)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const currentFileRef = useRef<string | null>(null)
  const pendingContentRef = useRef<string | null>(null)

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('cursor-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: '569CD6' },
          { token: 'identifier', foreground: '9CDCFE' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'type', foreground: '4EC9B0' }
        ],
        colors: {
          'editor.background': '#1e1e1e00',
          'editor.foreground': '#d4d4d4',
          'editor.lineHighlightBackground': '#ffffff08',
          'editorCursor.foreground': '#ffffff',
          'editorWhitespace.foreground': '#3e3e42',
          'editorIndentGuide.background': '#404040',
          'editorIndentGuide.activeBackground': '#707070'
        }
      })
    }
  }, [monaco])

  // 加载文件
  useEffect(() => {
    const loadFile = async () => {
      if (!filePath) {
        const defaultVal = defaultContent
        setContent(defaultVal)
        setOriginalContent(defaultVal)
        setHasChanges(false)
        currentFileRef.current = null
        pendingContentRef.current = null
        if (editorRef.current) {
          editorRef.current.setValue(defaultVal)
        }
        return
      }

      // 避免重复加载同一文件
      if (currentFileRef.current === filePath) {
        return
      }

      setLoading(true)
      currentFileRef.current = filePath

      try {
        const result = await window.api.fs.readFile(filePath)
        if (result.success && result.data !== undefined) {
          const fileContent = result.data
          setContent(fileContent)
          setOriginalContent(fileContent)
          setHasChanges(false)
          // 存储待设置的内容
          pendingContentRef.current = fileContent
          // 直接设置编辑器内容
          if (editorRef.current) {
            editorRef.current.setValue(fileContent)
            pendingContentRef.current = null
          }
        } else {
          console.error('Failed to read file:', result.error)
        }
      } catch (err) {
        console.error('Failed to load file:', err)
      }

      setLoading(false)
    }

    loadFile()
  }, [filePath])

  const handleSave = useCallback(async () => {
    if (!filePath || !hasChanges) return
    setSaving(true)
    const result = await window.api.fs.writeFile(filePath, content)
    if (result.success) {
      setOriginalContent(content)
      setHasChanges(false)
      onSave?.()
    }
    setSaving(false)
  }, [filePath, hasChanges, content, onSave])

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newContent = value || ''
      setContent(newContent)
      setHasChanges(newContent !== originalContent)
    },
    [originalContent]
  )

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
    // 如果有待设置的内容，设置到编辑器
    if (pendingContentRef.current !== null) {
      editor.setValue(pendingContentRef.current)
      pendingContentRef.current = null
    }
  }

  // Ctrl+S 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  const fileName = filePath ? filePath.split(/[/\\]/).pop() : '未命名'
  const language = filePath ? getLanguageFromPath(filePath) : 'typescript'

  return (
    <div className="h-full w-full flex flex-col">
      {/* Glass Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-glass-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div
              className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500"
              onClick={onClose}
            />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div
              className={`w-3 h-3 rounded-full ${hasChanges ? 'bg-blue-500/80' : 'bg-green-500/80'}`}
            />
          </div>
          <span className="text-sm font-medium text-gray-300 ml-4 font-sans tracking-wide flex items-center gap-2">
            {fileName}
            {hasChanges && <span className="text-xs text-yellow-400">●</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-accent-primary/20 hover:bg-accent-primary/30 text-white rounded transition-colors disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? '保存中...' : '保存'}
            </button>
          )}
          <div className="text-xs text-gray-500">{language}</div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>
        ) : (
          <Editor
            key={filePath || 'default'}
            height="100%"
            language={language}
            defaultValue={content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="cursor-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              lineHeight: 24,
              fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
              padding: { top: 24, bottom: 24 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              contextmenu: true,
              roundedSelection: true,
              automaticLayout: true
            }}
          />
        )}
      </div>
    </div>
  )
}

export default CodeEditor
