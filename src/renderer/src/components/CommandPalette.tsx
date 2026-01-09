import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, File } from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  projectPath: string | null
  onFileSelect: (path: string) => void
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projectPath,
  onFileSelect
}) => {
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [filteredFiles, setFilteredFiles] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 加载文件列表
  useEffect(() => {
    if (isOpen && projectPath) {
      window.api.fs.readDirRecursive(projectPath).then((result) => {
        if (result.success && result.data) {
          setFiles(result.data)
        }
      })
    }
  }, [isOpen, projectPath])

  // 模糊搜索
  useEffect(() => {
    if (!query.trim()) {
      setFilteredFiles(files.slice(0, 20))
    } else {
      const lowerQuery = query.toLowerCase()
      const results = files
        .filter((file) => {
          const fileName = file.split(/[/\\]/).pop()?.toLowerCase() || ''
          return fileName.includes(lowerQuery)
        })
        .slice(0, 20)
      setFilteredFiles(results)
    }
    setSelectedIndex(0)
  }, [query, files])

  // 聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filteredFiles.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredFiles[selectedIndex]) {
          onFileSelect(filteredFiles[selectedIndex])
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [filteredFiles, selectedIndex, onFileSelect, onClose]
  )

  if (!isOpen) return null

  const getRelativePath = (fullPath: string) => {
    if (!projectPath) return fullPath
    return fullPath.replace(projectPath + '/', '')
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[15vh] z-50"
      onClick={onClose}
    >
      <div
        className="w-[500px] glass-panel-elevated rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文件..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none"
          />
          <kbd className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-text-muted">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto">
          {!projectPath ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              请先打开一个项目
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              {query ? '未找到匹配的文件' : '加载中...'}
            </div>
          ) : (
            filteredFiles.map((file, index) => {
              const fileName = file.split(/[/\\]/).pop() || ''
              const relativePath = getRelativePath(file)
              return (
                <div
                  key={file}
                  onClick={() => {
                    onFileSelect(file)
                    onClose()
                  }}
                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : 'text-text-secondary hover:bg-white/5'
                  }`}
                >
                  <File size={14} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{fileName}</div>
                    <div className="text-xs text-text-muted truncate">{relativePath}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-black/20 flex items-center gap-4 text-[10px] text-text-muted">
          <span>
            <kbd className="px-1 py-0.5 bg-white/5 rounded mr-1">↑↓</kbd> 导航
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-white/5 rounded mr-1">Enter</kbd> 打开
          </span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
