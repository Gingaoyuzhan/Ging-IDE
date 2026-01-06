import React from 'react'
import { Minus, Square, X } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  dock: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children, dock }) => {
  const handleMinimize = () => window.electron.ipcRenderer.send('window:minimize')
  const handleMaximize = () => window.electron.ipcRenderer.send('window:maximize')
  const handleClose = () => window.electron.ipcRenderer.send('window:close')

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden rounded-xl border border-glass-border bg-glass-bg">
      {/* 标题栏 - 可拖拽 */}
      <div
        className="flex items-center justify-between h-10 px-4 border-b border-glass-border flex-shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <span className="font-bold text-white text-xs">G</span>
          </div>
          <span className="text-sm font-medium text-gray-400">Ging IDE</span>
        </div>
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleMinimize}
            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleMaximize}
            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
          >
            <Square size={12} />
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-500/80 rounded transition-colors text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Dock Area */}
        <div className="flex-none z-50">{dock}</div>

        {/* Main Content Area */}
        <main className="flex-1 flex min-w-0 z-10 gap-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
