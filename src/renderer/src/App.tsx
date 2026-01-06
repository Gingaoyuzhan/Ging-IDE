import Layout from './components/Layout'
import CodeEditor from './components/CodeEditor'
import Terminal, { TerminalRef } from './components/Terminal'
import ProjectDrawer from './components/ProjectDrawer'
import NavigationDock from './components/NavigationDock'
import WelcomeScreen from './components/WelcomeScreen'
import { useState, useRef } from 'react'
import { TerminalSquare } from 'lucide-react'

function App() {
  const [activeView, setActiveView] = useState('welcome')
  const [showTerminal, setShowTerminal] = useState(true)
  const [showFiles, setShowFiles] = useState(false)
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [activeFile, setActiveFile] = useState<string | null>(null)

  const terminalRef = useRef<TerminalRef>(null)

  const handleOpenFolder = async () => {
    const result = await window.api.dialog.openFolder()
    if (result.success && result.data) {
      setProjectPath(result.data)
      setShowFiles(true)
      setActiveView('editor')
    }
  }

  const handleFileSelect = (path: string) => {
    setActiveFile(path)
    setActiveView('editor')
  }

  const handleRun = () => {
    setShowTerminal(true)
    setTimeout(() => {
      terminalRef.current?.focus()
    }, 100)
  }

  return (
    <Layout
      dock={
        <NavigationDock
          activeView={activeView}
          onViewChange={(view) => {
            if (view === 'terminal') {
              setShowTerminal(!showTerminal)
              if (!showTerminal) {
                setTimeout(() => terminalRef.current?.focus(), 100)
              }
            } else if (view === 'files') {
              setShowFiles(!showFiles)
            } else {
              setActiveView(view)
            }
          }}
          onRun={handleRun}
        />
      }
    >
      {/* Project Drawer - Slide in */}
      <ProjectDrawer
        isOpen={showFiles}
        onClose={() => setShowFiles(false)}
        rootPath={projectPath}
        onOpenFolder={handleOpenFolder}
        onFileSelect={handleFileSelect}
        activeFile={activeFile}
      />

      {/* Editor Area */}
      <div className="flex-1 h-full flex flex-col min-w-0 glass-panel rounded-2xl overflow-hidden relative transition-all duration-500">
        {activeView === 'welcome' ? (
          <WelcomeScreen
            onNewProject={() => setActiveView('editor')}
            onOpenFolder={handleOpenFolder}
          />
        ) : (
          <CodeEditor
            filePath={activeFile}
            onClose={() => {
              setActiveFile(null)
              if (!projectPath) setActiveView('welcome')
            }}
          />
        )}
      </div>

      {/* Right Panel - Terminal */}
      {showTerminal && (
        <div className="w-[400px] h-full flex-none glass-panel rounded-2xl overflow-hidden transition-all duration-500 animate-in slide-in-from-right-10 fade-in flex flex-col">
          {/* 面板标题栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20">
                <TerminalSquare size={16} className="text-green-400" />
              </div>
              <span className="text-sm font-semibold text-white">终端</span>
              <span className="text-xs text-gray-500 ml-1">PowerShell</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500">运行中</span>
            </div>
          </div>

          {/* 面板内容 */}
          <div className="flex-1 overflow-hidden">
            <Terminal ref={terminalRef} cwd={projectPath || undefined} />
          </div>
        </div>
      )}
    </Layout>
  )
}

export default App
