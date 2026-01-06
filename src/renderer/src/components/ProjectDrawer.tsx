import React, { useState, useEffect } from 'react'
import {
  Folder,
  FileCode,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  FolderOpen,
  FileJson,
  FileText,
  File
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
  if (!ext) return <File size={14} className="text-gray-400" />
  const e = ext.toLowerCase()
  if (['.tsx', '.ts', '.jsx', '.js'].includes(e))
    return <FileCode size={14} className="text-blue-400" />
  if (['.json'].includes(e)) return <FileJson size={14} className="text-yellow-400" />
  if (['.md', '.txt'].includes(e)) return <FileText size={14} className="text-gray-400" />
  return <File size={14} className="text-gray-400" />
}

const FileTreeItem: React.FC<{
  node: FileNode
  depth: number
  active: boolean
  onClick: () => void
  onToggle: () => void
}> = ({ node, depth, active, onClick, onToggle }) => {
  return (
    <div
      className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200 ${active
          ? 'bg-accent-primary/20 text-white shadow-sm'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={() => {
        if (node.isDirectory) {
          onToggle()
        } else {
          onClick()
        }
      }}
    >
      <span className="opacity-70 group-hover:opacity-100 transition-opacity">
        {node.isDirectory ? (
          node.isOpen ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : (
          <div className="w-3.5" />
        )}
      </span>

      {node.isDirectory ? (
        node.isOpen ? (
          <FolderOpen size={14} className="text-accent-secondary" />
        ) : (
          <Folder size={14} className="text-gray-500" />
        )
      ) : (
        getFileIcon(node.ext)
      )}

      <span className="text-sm font-medium tracking-wide truncate">{node.name}</span>
      {node.isLoading && <span className="text-xs text-gray-500 ml-auto">...</span>}
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
              // 需要加载子目录
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
            <div className="border-l border-white/5 ml-4">
              {renderTree(node.children, depth + 1, currentPath)}
            </div>
          )}
        </div>
      )
    })
  }

  if (!isOpen) return null

  return (
    <div className="w-64 h-full glass-panel flex flex-col border-r border-glass-border animate-in slide-in-from-left-5 fade-in duration-300">
      <div className="p-4 border-b border-glass-border flex justify-between items-center bg-white/5">
        <span className="text-xs font-bold text-gray-300 tracking-wider uppercase">
          Project Explorer
        </span>
        <div
          onClick={onClose}
          className="cursor-pointer hover:bg-white/10 p-1 rounded transition-colors"
        >
          <MoreHorizontal size={14} className="text-gray-500 hover:text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {!rootPath ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Folder size={32} className="text-gray-500 mb-3" />
            <p className="text-sm text-gray-400 mb-4">没有打开的项目</p>
            <button
              onClick={onOpenFolder}
              className="px-4 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-white text-sm rounded-lg transition-colors"
            >
              打开文件夹
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 text-sm">加载中...</span>
          </div>
        ) : (
          renderTree(files)
        )}
      </div>

      <div className="p-3 border-t border-glass-border bg-black/20 text-[10px] text-gray-500 flex justify-between">
        <span className="truncate max-w-[150px]">{rootPath || 'ging-v1.0.0'}</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Ready
        </span>
      </div>
    </div>
  )
}

export default ProjectDrawer
