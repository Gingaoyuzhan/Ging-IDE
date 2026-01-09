import React, { useState, useEffect } from 'react'
import {
  Folder,
  FileCode,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileJson,
  FileText,
  File,
  X,
  Search
} from 'lucide-react'

interface FileEntry {
  name: string
  isDirectory: boolean
  path: string
  ext: string | null
}

interface FileNode extends FileEntry {
  isOpen?: boolean
  children?: FileNode[]
  isLoading?: boolean
}

const getFileIcon = (ext: string | null) => {
  if (!ext) return <File size={14} className="text-text-muted" />
  const e = ext.toLowerCase()
  if (['.tsx', '.ts'].includes(e)) return <FileCode size={14} className="text-blue-400" />
  if (['.jsx', '.js'].includes(e)) return <FileCode size={14} className="text-yellow-400" />
  if (['.json'].includes(e)) return <FileJson size={14} className="text-amber-400" />
  if (['.md', '.txt'].includes(e)) return <FileText size={14} className="text-text-muted" />
  if (['.py'].includes(e)) return <FileCode size={14} className="text-green-400" />
  if (['.rs'].includes(e)) return <FileCode size={14} className="text-orange-400" />
  return <File size={14} className="text-text-muted" />
}

interface FileTreeItemProps {
  node: FileNode
  depth: number
  active: boolean
  onClick: () => void
  onToggle: () => void
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, depth, active, onClick, onToggle }) => {
  return (
    <div
      className={`
        group flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200
        ${active
          ? 'bg-accent-primary/15 text-accent-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
        }
      `}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => (node.isDirectory ? onToggle() : onClick())}
    >
      {/* Chevron */}
      <span className="w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
        {node.isDirectory ? (
          node.isOpen ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : null}
      </span>

      {/* Icon */}
      {node.isDirectory ? (
        node.isOpen ? (
          <FolderOpen size={14} className="text-accent-primary flex-shrink-0" />
        ) : (
          <Folder size={14} className="text-text-muted flex-shrink-0" />
        )
      ) : (
        <span className="flex-shrink-0">{getFileIcon(node.ext)}</span>
      )}

      {/* Name */}
      <span className="text-sm font-medium truncate">{node.name}</span>

      {/* Loading indicator */}
      {node.isLoading && (
        <span className="ml-auto text-[10px] text-text-muted animate-pulse">...</span>
      )}
    </div>
  )
}

interface ProjectDrawerProps {
  isOpen: boolean
  onClose: () => void
  rootPath: string | null
  onOpenFolder: () => void
  onFileSelect: (path: string) => void
  activeFile: string | null
}

const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
  isOpen,
  onClose,
  rootPath,
  onOpenFolder,
  onFileSelect,
  activeFile
}) => {
  const [files, setFiles] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (rootPath) {
      loadDirectory(rootPath)
    } else {
      setFiles([])
    }
  }, [rootPath])

  const loadDirectory = async (path: string) => {
    setLoading(true)
    const result = await window.api.fs.readDir(path)
    if (result.success && result.data) {
      const sorted = result.data.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })
      setFiles(sorted.map((f) => ({ ...f, isOpen: false, children: undefined })))
    }
    setLoading(false)
  }

  const toggleFolder = async (_node: FileNode, path: number[]) => {
    const updateNode = (nodes: FileNode[], pathIndex: number): FileNode[] => {
      return nodes.map((n, i) => {
        if (i === path[pathIndex]) {
          if (pathIndex === path.length - 1) {
            if (!n.isOpen && !n.children) {
              loadChildren(n, path)
              return { ...n, isLoading: true }
            }
            return { ...n, isOpen: !n.isOpen }
          }
          return { ...n, children: updateNode(n.children || [], pathIndex + 1) }
        }
        return n
      })
    }
    setFiles(updateNode(files, 0))
  }

  const loadChildren = async (node: FileNode, path: number[]) => {
    const result = await window.api.fs.readDir(node.path)
    if (result.success && result.data) {
      const sorted = result.data.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })

      const updateNode = (nodes: FileNode[], pathIndex: number): FileNode[] => {
        return nodes.map((n, i) => {
          if (i === path[pathIndex]) {
            if (pathIndex === path.length - 1) {
              return {
                ...n,
                isOpen: true,
                isLoading: false,
                children: sorted.map((f) => ({ ...f, isOpen: false, children: undefined }))
              }
            }
            return { ...n, children: updateNode(n.children || [], pathIndex + 1) }
          }
          return n
        })
      }
      setFiles(updateNode(files, 0))
    }
  }

  const renderTree = (nodes: FileNode[], depth = 0, path: number[] = []) => {
    return nodes.map((node, i) => {
      const currentPath = [...path, i]
      return (
        <div key={node.path}>
          <FileTreeItem
            node={node}
            depth={depth}
            active={activeFile === node.path}
            onClick={() => onFileSelect(node.path)}
            onToggle={() => toggleFolder(node, currentPath)}
          />
          {node.isDirectory && node.isOpen && node.children && (
            <div className="relative">
              {/* Indent guide line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-border"
                style={{ left: `${depth * 12 + 20}px` }}
              />
              {renderTree(node.children, depth + 1, currentPath)}
            </div>
          )}
        </div>
      )
    })
  }

  if (!isOpen) return null

  const projectName = rootPath?.split(/[/\\]/).pop() || 'Project'

  return (
    <div className="w-60 h-full glass-panel flex flex-col rounded-2xl overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white/[0.02]">
        <div className="flex items-center gap-2 min-w-0">
          <Folder size={14} className="text-accent-primary flex-shrink-0" />
          <span className="text-sm font-semibold text-text-primary truncate">{projectName}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-secondary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {!rootPath ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <Folder size={24} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-muted mb-4">No project open</p>
            <button
              onClick={onOpenFolder}
              className="px-4 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary text-sm font-medium rounded-lg transition-colors"
            >
              Open Folder
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-text-muted text-sm animate-pulse">Loading...</span>
          </div>
        ) : (
          <div className="space-y-0.5">{renderTree(files)}</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-black/20 flex items-center justify-between">
        <span className="text-[10px] text-text-muted font-mono truncate max-w-[140px]">
          {rootPath || 'No project'}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          <span className="text-[10px] text-text-muted">Ready</span>
        </div>
      </div>
    </div>
  )
}

export default ProjectDrawer
