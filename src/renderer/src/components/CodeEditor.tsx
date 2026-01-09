import React, { useEffect, useState, useCallback, useRef } from 'react'
import Editor, { useMonaco, OnMount } from '@monaco-editor/react'
import { Save, X, Circle } from 'lucide-react'
import type * as Monaco from 'monaco-editor'

interface CodeEditorProps {
  filePath: string | null
  openFiles?: string[]
  onTabClick?: (path: string) => void
  onTabClose?: (path: string) => void
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

// Welcome to Ging IDE
// A creative coding space built for you.

function App() {
  return (
    <div className="container">
       <h1>Hello, World!</h1>
       <p>Start creating here...</p>
    </div>
  );
}

export default App;`

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, openFiles = [], onTabClick, onTabClose, onSave }) => {
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
      // Phosphor Terminal Theme
      monaco.editor.defineTheme('phosphor-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'f59e0b' },
          { token: 'identifier', foreground: 'e5e7eb' },
          { token: 'string', foreground: '10b981' },
          { token: 'number', foreground: 'fbbf24' },
          { token: 'type', foreground: '60a5fa' },
          { token: 'function', foreground: 'f472b6' },
          { token: 'variable', foreground: 'e5e7eb' },
          { token: 'constant', foreground: 'fbbf24' }
        ],
        colors: {
          'editor.background': '#00000000',
          'editor.foreground': '#e5e7eb',
          'editor.lineHighlightBackground': '#ffffff08',
          'editor.selectionBackground': '#f59e0b30',
          'editorCursor.foreground': '#f59e0b',
          'editorWhitespace.foreground': '#374151',
          'editorIndentGuide.background': '#27272a',
          'editorIndentGuide.activeBackground': '#3f3f46',
          'editorLineNumber.foreground': '#52525b',
          'editorLineNumber.activeForeground': '#a1a1aa'
        }
      })
    }
  }, [monaco])

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
          pendingContentRef.current = fileContent
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
    if (pendingContentRef.current !== null) {
      editor.setValue(pendingContentRef.current)
      pendingContentRef.current = null
    }
  }

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

  const fileName = filePath ? filePath.split(/[/\\]/).pop() : 'Untitled'
  const language = filePath ? getLanguageFromPath(filePath) : 'typescript'

  return (
    <div className="h-full w-full flex flex-col glass-panel rounded-2xl overflow-hidden">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {openFiles.length > 0 ? (
            openFiles.map((file) => {
              const name = file.split(/[/\\]/).pop() || 'Untitled'
              const isActive = file === filePath
              return (
                <div
                  key={file}
                  onClick={() => onTabClick?.(file)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    isActive ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
                  }`}
                >
                  <span className="text-sm font-medium whitespace-nowrap">{name}</span>
                  {isActive && hasChanges && <Circle size={8} className="fill-accent-primary text-accent-primary" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTabClose?.(file)
                    }}
                    className="p-0.5 rounded hover:bg-white/10 text-text-muted hover:text-text-secondary"
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            })
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
              <span className="text-sm font-medium text-text-primary">{fileName}</span>
              {hasChanges && <Circle size={8} className="fill-accent-primary text-accent-primary" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language Badge */}
          <span className="text-[10px] font-mono text-text-muted uppercase px-2 py-1 bg-white/5 rounded">
            {language}
          </span>

          {/* Save Button */}
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-text-muted animate-pulse">Loading...</span>
          </div>
        ) : (
          <Editor
            key={filePath || 'default'}
            height="100%"
            language={language}
            defaultValue={content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="phosphor-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
              fontLigatures: true,
              padding: { top: 20, bottom: 20 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              cursorStyle: 'line',
              cursorWidth: 2,
              renderLineHighlight: 'line',
              contextmenu: true,
              roundedSelection: true,
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              guides: {
                indentation: true,
                bracketPairs: true
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

export default CodeEditor
