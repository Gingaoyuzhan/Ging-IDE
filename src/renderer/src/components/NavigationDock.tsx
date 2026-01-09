import React from 'react'
import {
  Code2,
  Terminal as TerminalIcon,
  Play,
  Settings,
  Folder,
  Home
} from 'lucide-react'

interface NavigationDockProps {
  activeView: string
  onViewChange: (view: string) => void
  onRun?: () => void
}

const NavigationDock: React.FC<NavigationDockProps> = ({ activeView, onViewChange, onRun }) => {
  const navItems = [
    { id: 'welcome', icon: Home, label: '主页' },
    { id: 'files', icon: Folder, label: '项目' },
    { id: 'editor', icon: Code2, label: '代码' },
    { id: 'terminal', icon: TerminalIcon, label: '终端' }
  ]

  return (
    <div className="flex flex-col h-full py-4 items-center gap-2 glass-panel rounded-2xl w-16">
      {/* Logo */}
      <div className="relative group mb-4">
        <div className="absolute inset-0 bg-accent-primary/40 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
          <span className="font-display font-extrabold text-black text-lg">G</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-border mb-2" />

      {/* Navigation Items */}
      <div className="flex flex-col gap-1 flex-1 w-full px-2 stagger-children">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            active={activeView === item.id}
            onClick={() => onViewChange(item.id)}
            icon={<item.icon size={20} />}
            label={item.label}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 w-full px-2 pt-2 border-t border-border">
        {/* Run Button - Primary Action */}
        <div className="relative group">
          <div className="absolute inset-0 bg-mint/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <button
            onClick={() => onRun?.()}
            className="relative w-full h-11 rounded-xl bg-gradient-to-r from-mint to-emerald-400 text-black flex items-center justify-center transition-all duration-300 hover:shadow-glow-mint hover:scale-105 active:scale-95"
          >
            <Play size={18} className="fill-current" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs font-medium text-text-primary opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
            运行项目
          </div>
        </div>

        {/* Settings */}
        <NavButton
          active={activeView === 'settings'}
          onClick={() => onViewChange('settings')}
          icon={<Settings size={18} />}
          label="设置"
        />
      </div>
    </div>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <div className="relative group flex items-center justify-center">
      {/* Active Indicator */}
      {active && (
        <div className="absolute -left-2 w-1 h-6 rounded-r-full bg-accent-primary shadow-glow-amber" />
      )}

      <button
        onClick={onClick}
        className={`
          relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
          ${active
            ? 'bg-accent-primary/15 text-accent-primary shadow-inner'
            : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
          }
        `}
      >
        {/* Hover glow */}
        {!active && (
          <div className="absolute inset-0 rounded-xl bg-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        <span className="relative z-10">{icon}</span>
      </button>

      {/* Tooltip */}
      <div className="absolute left-full ml-3 px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs font-medium text-text-primary opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
        {label}
      </div>
    </div>
  )
}

export default NavigationDock
