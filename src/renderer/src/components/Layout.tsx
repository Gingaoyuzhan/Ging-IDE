import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  dock: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children, dock }) => {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-bg-deep">
      {/* macOS Style Title Bar - Native traffic lights on left */}
      <div
        className="flex items-center h-12 px-4 border-b border-border flex-shrink-0 bg-bg-surface/50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Spacer for native traffic lights (macOS) */}
        <div className="w-[72px] flex-shrink-0" />

        {/* Centered Title */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="relative group">
            <div className="absolute inset-0 bg-accent-primary/30 rounded-md blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-5 h-5 rounded-md bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <span className="font-display font-bold text-black text-[10px]">G</span>
            </div>
          </div>
          <span className="font-display text-sm font-medium text-text-secondary">Ging</span>
        </div>

        {/* Spacer for symmetry */}
        <div className="w-[72px] flex-shrink-0" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Dock */}
        <div className="flex-none z-50">{dock}</div>

        {/* Content */}
        <main className="flex-1 flex min-w-0 z-10 gap-3">{children}</main>
      </div>
    </div>
  )
}

export default Layout
