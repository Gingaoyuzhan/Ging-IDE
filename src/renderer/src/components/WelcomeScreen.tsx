import React from 'react'
import { Plus, FolderOpen, Github, ArrowRight } from 'lucide-react'

const WelcomeScreen: React.FC<{ onNewProject: () => void; onOpenFolder?: () => void }> = ({
  onNewProject,
  onOpenFolder
}) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center gap-12 max-w-2xl w-full animate-in fade-in zoom-in-95 duration-500">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto mb-8 group perspective-1000">
            {/* Glowing Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary to-accent-secondary rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />

            {/* Rotating Cube-like Card */}
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform duration-700 group-hover:rotate-[360deg] group-hover:scale-110 z-10">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary text-5xl select-none">G</span>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-white font-sans tracking-tight drop-shadow-lg">
            Ging <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">IDE</span>
          </h1>
          <p className="text-xl text-gray-400 font-light tracking-wide max-w-md mx-auto leading-relaxed">
            Code with <span className="text-white font-medium">Soul</span>. Create with <span className="text-white font-medium">Flow</span>.
          </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <ActionCard
            icon={<Plus size={24} />}
            title="新建项目"
            desc="Start a new journey"
            onClick={onNewProject}
            primary
          />
          <ActionCard
            icon={<FolderOpen size={24} />}
            title="打开文件夹"
            desc="Continue your work"
            onClick={() => onOpenFolder?.()}
          />
        </div>

        {/* Recent Projects */}
        <div className="w-full glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-medium uppercase tracking-wider text-xs">
              Recent Projects
            </span>
            <button className="text-accent-secondary hover:text-white transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-2">
            <RecentProjectItem name="ging-ui-redesign" path="~/projects/ging" time="2 hours ago" />
            <RecentProjectItem name="ai-agent-core" path="~/projects/ai-agent" time="Yesterday" />
            <RecentProjectItem
              name="portfolio-2026"
              path="~/projects/web/portfolio"
              time="3 days ago"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 flex gap-6 text-gray-500 hover:text-gray-300 transition-colors">
        <a href="#" className="flex items-center gap-2 text-xs">
          <Github size={14} /> GitHub
        </a>
        <span className="text-xs">v1.0.0 (Aurora)</span>
      </div>
    </div>
  )
}

const ActionCard: React.FC<{
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
  primary?: boolean
}> = ({ icon, title, desc, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`group relative p-6 rounded-2xl border text-left transition-all duration-500 hover:-translate-y-1 overflow-hidden ${primary
        ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-accent-primary/50'
        : 'bg-glass-bg border-glass-border hover:border-gray-500/50'
      }`}
  >
    {/* Hover Glow Background */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${primary ? 'from-accent-primary/20 to-transparent' : 'from-white/5 to-transparent'
      }`} />

    <div
      className={`relative mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${primary
          ? 'bg-white text-black group-hover:scale-110 group-hover:rotate-3'
          : 'bg-white/10 text-white group-hover:bg-white group-hover:text-black'
        }`}
    >
      {icon}
    </div>

    <div className="relative">
      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent-secondary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{desc}</p>
    </div>
  </button>
)

const RecentProjectItem: React.FC<{ name: string; path: string; time: string }> = ({
  name,
  path,
  time
}) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
        <span className="font-bold text-xs">TS</span>
      </div>
      <div>
        <div className="text-sm font-medium text-white group-hover:text-accent-secondary transition-colors">
          {name}
        </div>
        <div className="text-xs text-gray-500">{path}</div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500">{time}</span>
      <ArrowRight
        size={14}
        className="text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
      />
    </div>
  </div>
)

export default WelcomeScreen
