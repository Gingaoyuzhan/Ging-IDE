import Layout from './components/Layout'
import CodeEditor from './components/CodeEditor'
import Terminal, { TerminalRef } from './components/Terminal'
import ProjectDrawer from './components/ProjectDrawer'
import NavigationDock from './components/NavigationDock'
import WelcomeScreen from './components/WelcomeScreen'
import { useState, useRef } from 'react'
import { Terminal as TerminalIcon, X } from 'lucide-react'

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

  const handleRun = async () => {
    if (!projectPath) {
      // 没有打开项目，先打开文件夹
      await handleOpenFolder()
      return
    }

    setShowTerminal(true)

    setTimeout(async () => {
      terminalRef.current?.focus()

      // 检测项目类型并运行
      const packageJson = await window.api.fs.exists(`${projectPath}/package.json`)
      const cargoToml = await window.api.fs.exists(`${projectPath}/Cargo.toml`)
      const goMod = await window.api.fs.exists(`${projectPath}/go.mod`)
      const requirements = await window.api.fs.exists(`${projectPath}/requirements.txt`)
      const pomXml = await window.api.fs.exists(`${projectPath}/pom.xml`)
      const mainPy = await window.api.fs.exists(`${projectPath}/main.py`)
      const appPy = await window.api.fs.exists(`${projectPath}/app.py`)
      const managePy = await window.api.fs.exists(`${projectPath}/manage.py`)

      let cmd = ''

      if (packageJson.data) {
        // Node.js 项目
        const content = await window.api.fs.readFile(`${projectPath}/package.json`)
        if (content.success && content.data) {
          try {
            const pkg = JSON.parse(content.data)
            if (pkg.scripts?.dev) {
              cmd = 'npm run dev'
            } else if (pkg.scripts?.start) {
              cmd = 'npm start'
            } else if (pkg.scripts?.serve) {
              cmd = 'npm run serve'
            } else {
              cmd = 'npm start'
            }
          } catch {
            cmd = 'npm start'
          }
        }
      } else if (cargoToml.data) {
        cmd = 'cargo run'
      } else if (goMod.data) {
        cmd = 'go run .'
      } else if (managePy.data) {
        // Django 项目
        cmd = 'python manage.py runserver'
      } else if (appPy.data) {
        // Flask 项目
        cmd = 'python app.py'
      } else if (mainPy.data) {
        cmd = 'python main.py'
      } else if (requirements.data) {
        cmd = 'python main.py'
      } else if (pomXml.data) {
        cmd = 'mvn spring-boot:run'
      }

      if (cmd) {
        terminalRef.current?.runCommand(cmd)
      } else {
        // 没有检测到项目类型，提示用户
        terminalRef.current?.runCommand('echo "未检测到可运行的项目类型"')
      }
    }, 200)
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
      {/* Project Drawer */}
      <ProjectDrawer
        isOpen={showFiles}
        onClose={() => setShowFiles(false)}
        rootPath={projectPath}
        onOpenFolder={handleOpenFolder}
        onFileSelect={handleFileSelect}
        activeFile={activeFile}
      />

      {/* Editor Area */}
      <div className="flex-1 h-full flex flex-col min-w-0 relative">
        {activeView === 'welcome' ? (
          <div className="h-full glass-panel rounded-2xl overflow-hidden">
            <WelcomeScreen onNewProject={() => setActiveView('editor')} onOpenFolder={handleOpenFolder} />
          </div>
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

      {/* Terminal Panel */}
      {showTerminal && (
        <div className="w-[380px] h-full flex-none glass-panel rounded-2xl overflow-hidden flex flex-col animate-fade-in-up">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-white/[0.02] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-mint/20">
                <TerminalIcon size={14} className="text-mint" />
              </div>
              <span className="text-sm font-medium text-text-primary">Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                <span className="text-[10px] text-text-muted">Active</span>
              </div>
              <button
                onClick={() => setShowTerminal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-secondary transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="flex-1 overflow-hidden">
            <Terminal ref={terminalRef} cwd={projectPath || undefined} />
          </div>
        </div>
      )}
    </Layout>
  )
}

export default App
