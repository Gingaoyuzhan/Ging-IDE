import React from 'react'
import {
  Code2,
  MessageSquare,
  Terminal as TerminalIcon,
  Play,
  Settings,
  Folder,
  Home
} from 'lucide-react'
import ThemeSwitcher from './ThemeSwitcher'

interface NavigationDockProps {
  activeView: string
  onViewChange: (view: string) => void
  onRun?: () => void
}

const NavigationDock: React.FC<NavigationDockProps> = ({ activeView, onViewChange, onRun }) => {
  const navItems = [
    { id: 'welcome', icon: Home, label: '主页' },
    { id: 'files', icon: Folder, label: '项目文件' },
    { id: 'editor', icon: Code2, label: '写代码' },
    { id: 'chat', icon: MessageSquare, label: '问 AI' },
    { id: 'terminal', icon: TerminalIcon, label: '看结果' }
  ]

  return (
    <div className="flex flex-col h-full py-6 items-center gap-6 glass-panel rounded-2xl w-20">
      {/* Logo Placeholder */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg mb-2">
        <span className="font-bold text-white text-lg">G</span>
      </div>

      {/* Main Nav Items */}
      <div className="flex flex-col gap-6 flex-1 w-full px-2">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            active={activeView === item.id}
            onClick={() => onViewChange(item.id)}
            icon={<item.icon size={24} />}
            label={item.label}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-6 w-full px-2 mb-2">
        <NavButton
          active={false}
          onClick={() => onRun && onRun()}
          icon={<Play size={24} className="fill-current" />}
          label="运行"
          variant="primary"
        />

        {/* Settings / Theme Toggle */}
        <div className="relative group/settings">
          <NavButton
            active={activeView === 'settings'}
            onClick={() => onViewChange('settings')}
            icon={<Settings size={22} />}
            label="设置"
          />

          {/* Pop-out Theme Switcher */}
          <div className="absolute left-full bottom-0 ml-4 mb-0 opacity-0 invisible group-hover/settings:opacity-100 group-hover/settings:visible transition-all duration-300 z-50">
            <div className="animate-in slide-in-from-left-2 fade-in duration-300">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  variant?: 'default' | 'primary'
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  variant = 'default'
}) => {
  const baseClasses =
    'group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer'

  // Active State: Glowing Pill
  const activeClasses = active
    ? 'bg-gradient-to-br from-white/10 to-white/5 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/20'
    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 hover:scale-105'

  const primaryClasses =
    'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/30 hover:shadow-accent-primary/60 hover:scale-110 hover:-rotate-3 border-none'

  return (
    <div className="relative flex items-center justify-center">
      {/* Active Indicator - Little dot on the left */}
      {active && variant !== 'primary' && (
        <div className="absolute -left-3 w-1 h-5 rounded-r-full bg-accent-primary shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-in fade-in duration-300" />
      )}

      <button
        onClick={onClick}
        className={`${baseClasses} ${variant === 'primary' ? primaryClasses : activeClasses}`}
      >
        {icon}
      </button>

      {/* Tooltip - Now cleaner */}
      <div className="absolute left-full ml-4 px-3 py-1.5 glass-panel bg-black/50 backdrop-blur-xl border-white/10 rounded-lg text-xs font-medium text-white opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
        {label}
      </div>
    </div>
  )
}

export default NavigationDock
