import React, { useEffect, useState } from 'react'
import { Files, Search, GitGraph, Settings, File as FileIcon, Folder } from 'lucide-react'

interface FileNode {
  name: string
  isDirectory: boolean
  path: string
}

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('files')

  return (
    <aside className="w-64 flex flex-row bg-sidebar-bg border-r border-border-color text-gray-300">
      {/* Activity Bar */}
      <div className="w-12 flex flex-col items-center py-4 bg-activity-bg border-r border-border-color shrink-0">
        <div className="flex flex-col gap-6">
          <SidebarIcon
            icon={<Files size={24} />}
            active={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
          />
          <SidebarIcon
            icon={<Search size={24} />}
            active={activeTab === 'search'}
            onClick={() => setActiveTab('search')}
          />
          <SidebarIcon
            icon={<GitGraph size={24} />}
            active={activeTab === 'git'}
            onClick={() => setActiveTab('git')}
          />
        </div>
        <div className="mt-auto flex flex-col gap-6">
          <SidebarIcon icon={<Settings size={24} />} />
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 text-xs font-bold tracking-wider text-gray-400 uppercase">Explorer</div>
        <FileExplorer />
      </div>
    </aside>
  )
}

const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFiles = async () => {
      try {
        // @ts-ignore
        const result = await window.api.getFiles()
        setFiles(result)
      } catch (error) {
        console.error('Failed to load files', error)
      } finally {
        setLoading(false)
      }
    }
    loadFiles()
  }, [])

  if (loading) return <div className="p-4 text-xs">Loading...</div>

  return (
    <div className="flex-1 overflow-y-auto">
      {files.map((file) => (
        <FileItem key={file.path} file={file} />
      ))}
    </div>
  )
}

const FileItem: React.FC<{ file: FileNode }> = ({ file }) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 cursor-pointer hover:bg-white/5 text-sm text-gray-400 hover:text-gray-100">
      {file.isDirectory ? <Folder size={14} className="text-blue-400" /> : <FileIcon size={14} />}
      <span className="truncate">{file.name}</span>
    </div>
  )
}

const SidebarIcon = ({
  icon,
  active,
  onClick
}: {
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-colors hover:text-white ${
      active ? 'text-white border-l-2 border-accent' : 'text-gray-500'
    }`}
  >
    {icon}
  </button>
)

export default Sidebar
