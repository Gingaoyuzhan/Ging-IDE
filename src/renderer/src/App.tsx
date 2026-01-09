import Layout from './components/Layout'
import CodeEditor from './components/CodeEditor'
import Terminal, { TerminalRef } from './components/Terminal'
import ProjectDrawer from './components/ProjectDrawer'
import NavigationDock from './components/NavigationDock'
import WelcomeScreen from './components/WelcomeScreen'
import SettingsPanel from './components/SettingsPanel'
import CommandPalette from './components/CommandPalette'
import { useState, useRef, useEffect } from 'react'
import { Terminal as TerminalIcon, X, Square, Plus } from 'lucide-react'

interface TerminalTab {
  id: string
  name: string
}

function App() {
  const [activeView, setActiveView] = useState('welcome')
  const [showTerminal, setShowTerminal] = useState(true)
  const [showFiles, setShowFiles] = useState(false)
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [openFiles, setOpenFiles] = useState<string[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [terminals, setTerminals] = useState<TerminalTab[]>([{ id: 'term-1', name: 'Terminal 1' }])
  const [activeTerminalId, setActiveTerminalId] = useState('term-1')

  const terminalRefs = useRef<Map<string, TerminalRef>>(new Map())

  // Cmd+P 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 项目路径变化时，终端自动 cd
  useEffect(() => {
    if (projectPath) {
      setTimeout(() => {
        terminalRefs.current.forEach((ref) => {
          ref.runCommand(`cd "${projectPath}"`)
        })
      }, 300)
    }
  }, [projectPath])

  const handleOpenFolder = async () => {
    const result = await window.api.dialog.openFolder()
    if (result.success && result.data) {
      const path = result.data
      const name = path.split(/[/\\]/).pop() || 'Project'
      setProjectPath(path)
      setShowFiles(true)
      setActiveView('editor')
      window.api.store.addRecentProject({ path, name })
    }
  }

  const handleOpenProject = (path: string) => {
    const name = path.split(/[/\\]/).pop() || 'Project'
    setProjectPath(path)
    setShowFiles(true)
    setActiveView('editor')
    window.api.store.addRecentProject({ path, name })
  }

  const handleFileSelect = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path])
    }
    setActiveFile(path)
    setActiveView('editor')
  }

  const handleCloseTab = (path: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== path)
    setOpenFiles(newOpenFiles)
    if (activeFile === path) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1] || null)
    }
    if (newOpenFiles.length === 0 && !projectPath) {
      setActiveView('welcome')
    }
  }

  const addTerminal = () => {
    const newId = `term-${Date.now()}`
    const newName = `Terminal ${terminals.length + 1}`
    setTerminals([...terminals, { id: newId, name: newName }])
    setActiveTerminalId(newId)
  }

  const closeTerminal = (id: string) => {
    if (terminals.length === 1) return
    const newTerminals = terminals.filter((t) => t.id !== id)
    setTerminals(newTerminals)
    if (activeTerminalId === id) {
      setActiveTerminalId(newTerminals[newTerminals.length - 1].id)
    }
    terminalRefs.current.delete(id)
  }

  const getActiveTerminalRef = () => terminalRefs.current.get(activeTerminalId)

  const handleRun = async () => {
    if (!projectPath) {
      // 没有打开项目，先打开文件夹
      await handleOpenFolder()
      return
    }

    setShowTerminal(true)

    setTimeout(async () => {
      getActiveTerminalRef()?.focus()

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
        getActiveTerminalRef()?.runCommand(cmd)
      } else {
        // 没有检测到项目类型，提示用户
        getActiveTerminalRef()?.runCommand('echo "未检测到可运行的项目类型"')
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
                setTimeout(() => getActiveTerminalRef()?.focus(), 100)
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
            <WelcomeScreen onNewProject={() => setActiveView('editor')} onOpenFolder={handleOpenFolder} onOpenProject={handleOpenProject} />
          </div>
        ) : activeView === 'settings' ? (
          <SettingsPanel onBack={() => setActiveView(projectPath ? 'editor' : 'welcome')} />
        ) : (
          <CodeEditor
            filePath={activeFile}
            openFiles={openFiles}
            onTabClick={setActiveFile}
            onTabClose={handleCloseTab}
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
              <button
                onClick={addTerminal}
                className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-secondary transition-colors"
                title="新建终端"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => getActiveTerminalRef()?.kill()}
                className="p-1.5 rounded-lg hover:bg-rose/20 text-text-muted hover:text-rose transition-colors"
                title="停止运行"
              >
                <Square size={12} className="fill-current" />
              </button>
              <button
                onClick={() => setShowTerminal(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-secondary transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Terminal Tabs */}
          {terminals.length > 1 && (
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-black/20 overflow-x-auto">
              {terminals.map((term) => (
                <div
                  key={term.id}
                  onClick={() => setActiveTerminalId(term.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer text-xs transition-colors ${
                    activeTerminalId === term.id
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
                  }`}
                >
                  <span>{term.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTerminal(term.id)
                    }}
                    className="p-0.5 rounded hover:bg-white/10 hover:text-rose"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Terminal Content */}
          <div className="flex-1 overflow-hidden relative">
            {terminals.map((term) => (
              <div
                key={term.id}
                className={`absolute inset-0 ${activeTerminalId === term.id ? 'block' : 'hidden'}`}
              >
                <Terminal
                  id={term.id}
                  ref={(ref) => {
                    if (ref) terminalRefs.current.set(term.id, ref)
                  }}
                  cwd={projectPath || undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        projectPath={projectPath}
        onFileSelect={handleFileSelect}
      />
    </Layout>
  )
}

export default App
