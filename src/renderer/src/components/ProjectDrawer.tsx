import React, { useState, useEffect, useCallback } from 'react'
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
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
  GitBranch
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

interface GitStatus {
  branch: string | null
  modified: string[]
  created: string[]
  deleted: string[]
  not_added: string[]
  staged: string[]
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
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked' | null
  onClick: () => void
  onToggle: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

const gitStatusColors = {
  modified: 'text-yellow-400',
  added: 'text-green-400',
  deleted: 'text-rose',
  untracked: 'text-text-muted'
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, depth, active, gitStatus, onClick, onToggle, onContextMenu }) => {
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
      onContextMenu={onContextMenu}
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
      <span className={`text-sm font-medium truncate ${gitStatus ? gitStatusColors[gitStatus] : ''}`}>
        {node.name}
      </span>

      {/* Git status indicator */}
      {gitStatus && (
        <span className={`ml-auto text-[10px] font-bold ${gitStatusColors[gitStatus]}`}>
          {gitStatus === 'modified' ? 'M' : gitStatus === 'added' ? 'A' : gitStatus === 'deleted' ? 'D' : '?'}
        </span>
      )}

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode | null } | null>(null)
  const [inputModal, setInputModal] = useState<{ type: 'file' | 'folder' | 'rename'; parentPath: string; oldName?: string } | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)

  useEffect(() => {
    if (rootPath) {
      loadDirectory(rootPath)
      loadGitStatus(rootPath)
    } else {
      setFiles([])
      setGitStatus(null)
    }
  }, [rootPath])

  const loadGitStatus = async (path: string) => {
    const result = await window.api.git.status(path)
    if (result.success && result.data) {
      setGitStatus(result.data)
    } else {
      setGitStatus(null)
    }
  }

  const getFileGitStatus = (filePath: string): 'modified' | 'added' | 'deleted' | 'untracked' | null => {
    if (!gitStatus || !rootPath) return null
    const relativePath = filePath.replace(rootPath + '/', '')
    if (gitStatus.modified.includes(relativePath)) return 'modified'
    if (gitStatus.created.includes(relativePath) || gitStatus.staged.includes(relativePath)) return 'added'
    if (gitStatus.deleted.includes(relativePath)) return 'deleted'
    if (gitStatus.not_added.includes(relativePath)) return 'untracked'
    return null
  }

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

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }, [])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const handleNewFile = async () => {
    if (!contextMenu?.node) return
    const parentPath = contextMenu.node.isDirectory ? contextMenu.node.path : contextMenu.node.path.replace(/[/\\][^/\\]+$/, '')
    setInputModal({ type: 'file', parentPath })
    setInputValue('')
    closeContextMenu()
  }

  const handleNewFolder = async () => {
    if (!contextMenu?.node) return
    const parentPath = contextMenu.node.isDirectory ? contextMenu.node.path : contextMenu.node.path.replace(/[/\\][^/\\]+$/, '')
    setInputModal({ type: 'folder', parentPath })
    setInputValue('')
    closeContextMenu()
  }

  const handleRename = () => {
    if (!contextMenu?.node) return
    const parentPath = contextMenu.node.path.replace(/[/\\][^/\\]+$/, '')
    setInputModal({ type: 'rename', parentPath, oldName: contextMenu.node.name })
    setInputValue(contextMenu.node.name)
    closeContextMenu()
  }

  const handleDelete = async () => {
    if (!contextMenu?.node) return
    const confirmed = window.confirm(`确定删除 "${contextMenu.node.name}" 吗？`)
    if (confirmed) {
      await window.api.fs.delete(contextMenu.node.path)
      if (rootPath) loadDirectory(rootPath)
    }
    closeContextMenu()
  }

  const handleInputSubmit = async () => {
    if (!inputModal || !inputValue.trim()) return
    const newPath = `${inputModal.parentPath}/${inputValue.trim()}`
    if (inputModal.type === 'file') {
      await window.api.fs.createFile(newPath)
    } else if (inputModal.type === 'folder') {
      await window.api.fs.createDir(newPath)
    } else if (inputModal.type === 'rename' && inputModal.oldName) {
      const oldPath = `${inputModal.parentPath}/${inputModal.oldName}`
      await window.api.fs.rename(oldPath, newPath)
    }
    setInputModal(null)
    if (rootPath) loadDirectory(rootPath)
  }

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      const handler = () => closeContextMenu()
      window.addEventListener('click', handler)
      return () => window.removeEventListener('click', handler)
    }
    return undefined
  }, [contextMenu, closeContextMenu])

  const renderTree = (nodes: FileNode[], depth = 0, path: number[] = []) => {
    return nodes.map((node, i) => {
      const currentPath = [...path, i]
      return (
        <div key={node.path}>
          <FileTreeItem
            node={node}
            depth={depth}
            active={activeFile === node.path}
            gitStatus={getFileGitStatus(node.path)}
            onClick={() => onFileSelect(node.path)}
            onToggle={() => toggleFolder(node, currentPath)}
            onContextMenu={(e) => handleContextMenu(e, node)}
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
        {gitStatus?.branch ? (
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <GitBranch size={12} />
            <span className="font-mono truncate max-w-[100px]">{gitStatus.branch}</span>
          </div>
        ) : (
          <span className="text-[10px] text-text-muted font-mono truncate max-w-[140px]">
            {rootPath ? 'No Git' : 'No project'}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          <span className="text-[10px] text-text-muted">Ready</span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed glass-panel-elevated rounded-lg py-1 z-50 min-w-[140px] shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={handleNewFile} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
            <FilePlus size={14} /> 新建文件
          </button>
          <button onClick={handleNewFolder} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
            <FolderPlus size={14} /> 新建文件夹
          </button>
          <div className="h-px bg-border my-1" />
          <button onClick={handleRename} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary">
            <Pencil size={14} /> 重命名
          </button>
          <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose hover:bg-rose/10">
            <Trash2 size={14} /> 删除
          </button>
        </div>
      )}

      {/* Input Modal */}
      {inputModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setInputModal(null)}>
          <div className="glass-panel-elevated rounded-xl p-4 w-72" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              {inputModal.type === 'file' ? '新建文件' : inputModal.type === 'folder' ? '新建文件夹' : '重命名'}
            </h3>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
              autoFocus
              className="w-full px-3 py-2 bg-white/5 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              placeholder={inputModal.type === 'rename' ? '新名称' : '名称'}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setInputModal(null)} className="px-3 py-1.5 text-sm text-text-muted hover:text-text-secondary">
                取消
              </button>
              <button onClick={handleInputSubmit} className="px-3 py-1.5 bg-accent-primary/20 text-accent-primary text-sm rounded-lg hover:bg-accent-primary/30">
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDrawer
