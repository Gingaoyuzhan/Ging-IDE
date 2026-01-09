import React from 'react'
import { Plus, FolderOpen, Github, ArrowRight, Zap, Clock } from 'lucide-react'

interface WelcomeScreenProps {
  onNewProject: () => void
  onOpenFolder?: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNewProject, onOpenFolder }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-mint/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center gap-10 max-w-xl w-full animate-fade-in-up">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* Animated Logo */}
          <div className="relative w-20 h-20 mx-auto mb-6 group">
            {/* Outer glow ring */}
            <div className="absolute inset-[-8px] rounded-2xl bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 blur-xl animate-pulse-glow" />
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary opacity-20 blur-md" />
            {/* Logo card */}
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-2xl shadow-accent-primary/30 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              <span className="font-display font-extrabold text-black text-4xl select-none">G</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display text-5xl font-bold text-text-primary tracking-tight mb-3">
              Ging{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                IDE
              </span>
            </h1>
            <p className="text-lg text-text-secondary font-light tracking-wide">
              Code with <span className="text-text-primary font-medium">clarity</span>. Build with{' '}
              <span className="text-text-primary font-medium">confidence</span>.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <ActionCard
            icon={<Plus size={22} strokeWidth={2.5} />}
            title="新建项目"
            desc="Start fresh"
            onClick={onNewProject}
            primary
          />
          <ActionCard
            icon={<FolderOpen size={22} />}
            title="打开文件夹"
            desc="Continue work"
            onClick={() => onOpenFolder?.()}
          />
        </div>

        {/* Recent Projects */}
        <div className="w-full glass-panel rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-border bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-text-muted" />
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Recent
              </span>
            </div>
            <button className="text-xs text-accent-primary hover:text-accent-secondary transition-colors font-medium">
              View All
            </button>
          </div>

          {/* Project List */}
          <div className="divide-y divide-border">
            <RecentProjectItem
              name="ging-ui-redesign"
              path="~/projects/ging"
              time="2h ago"
              type="ts"
            />
            <RecentProjectItem
              name="ai-agent-core"
              path="~/projects/ai-agent"
              time="Yesterday"
              type="py"
            />
            <RecentProjectItem
              name="portfolio-2026"
              path="~/projects/web"
              time="3 days"
              type="tsx"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 flex items-center gap-6 text-text-muted">
        <a
          href="#"
          className="flex items-center gap-2 text-xs hover:text-text-secondary transition-colors"
        >
          <Github size={14} />
          <span>GitHub</span>
        </a>
        <div className="w-px h-3 bg-border" />
        <span className="text-xs font-mono">v1.0.0</span>
      </div>
    </div>
  )
}

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
  primary?: boolean
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, desc, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`
      group relative p-5 rounded-2xl text-left transition-all duration-300 overflow-hidden
      ${primary
        ? 'bg-gradient-to-br from-accent-primary/15 to-accent-primary/5 border border-accent-primary/20 hover:border-accent-primary/40'
        : 'glass-panel hover:border-border-hover'
      }
      hover:-translate-y-0.5
    `}
  >
    {/* Hover glow */}
    <div
      className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        ${primary
          ? 'bg-gradient-to-br from-accent-primary/10 to-transparent'
          : 'bg-gradient-to-br from-white/5 to-transparent'
        }
      `}
    />

    {/* Icon */}
    <div
      className={`
        relative mb-4 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
        ${primary
          ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-black group-hover:shadow-glow-amber'
          : 'bg-white/5 text-text-secondary group-hover:bg-accent-primary/20 group-hover:text-accent-primary'
        }
      `}
    >
      {icon}
    </div>

    {/* Text */}
    <div className="relative">
      <h3 className="text-base font-semibold text-text-primary mb-0.5 group-hover:text-accent-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-text-muted">{desc}</p>
    </div>
  </button>
)

interface RecentProjectItemProps {
  name: string
  path: string
  time: string
  type: string
}

const RecentProjectItem: React.FC<RecentProjectItemProps> = ({ name, path, time, type }) => {
  const typeColors: Record<string, string> = {
    ts: 'bg-blue-500/20 text-blue-400',
    tsx: 'bg-blue-500/20 text-blue-400',
    js: 'bg-yellow-500/20 text-yellow-400',
    py: 'bg-green-500/20 text-green-400',
    rs: 'bg-orange-500/20 text-orange-400'
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] cursor-pointer group transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase ${typeColors[type] || 'bg-gray-500/20 text-gray-400'}`}
        >
          {type}
        </div>
        <div>
          <div className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
            {name}
          </div>
          <div className="text-xs text-text-muted">{path}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted">{time}</span>
        <ArrowRight
          size={14}
          className="text-text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent-primary transition-all duration-200"
        />
      </div>
    </div>
  )
}

export default WelcomeScreen
