import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

export interface TerminalRef {
  focus: () => void
  runCommand: (cmd: string) => void
  kill: () => void
}

interface TerminalProps {
  id?: string
  cwd?: string
}

const Terminal = React.forwardRef<TerminalRef, TerminalProps>(({ id, cwd }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const termIdRef = useRef<string>(id || `terminal-${Date.now()}`)

  React.useImperativeHandle(ref, () => ({
    focus: () => xtermRef.current?.focus(),
    runCommand: (cmd: string) => {
      window.api.terminal.write(termIdRef.current, cmd + '\r')
      xtermRef.current?.focus()
    },
    kill: () => {
      window.api.terminal.kill(termIdRef.current)
    }
  }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const termId = termIdRef.current
    let term: XTerm | null = null
    let fitAddon: FitAddon | null = null
    let unsubData: (() => void) | null = null
    let unsubExit: (() => void) | null = null
    let resizeObserver: ResizeObserver | null = null
    let onDataDisposable: { dispose: () => void } | null = null

    // 延迟初始化，确保容器已渲染
    const initTimer = setTimeout(() => {
      term = new XTerm({
        cols: 80,
        rows: 24,
        theme: {
          background: '#0d0d0d',
          foreground: '#e5e5e5',
          cursor: '#ffffff',
          cursorAccent: '#000000',
          selectionBackground: '#8b5cf650',
          black: '#000000',
          red: '#f87171',
          green: '#4ade80',
          yellow: '#facc15',
          blue: '#60a5fa',
          magenta: '#c084fc',
          cyan: '#22d3ee',
          white: '#e5e5e5',
          brightBlack: '#737373',
          brightRed: '#fca5a5',
          brightGreen: '#86efac',
          brightYellow: '#fde047',
          brightBlue: '#93c5fd',
          brightMagenta: '#d8b4fe',
          brightCyan: '#67e8f9',
          brightWhite: '#ffffff'
        },
        fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: 'bar',
        convertEol: true,
        allowProposedApi: true,
        scrollback: 5000
      })

      fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(container)
      xtermRef.current = term

      // 再延迟 fit
      setTimeout(() => {
        if (!term || !fitAddon || !container) return
        try {
          fitAddon.fit()
          window.api.terminal.resize(termId, term.cols, term.rows)
        } catch {}
        term.focus()
      }, 100)

      // 创建 PTY
      window.api.terminal.create(termId, cwd)

      // 监听 PTY 输出
      unsubData = window.api.terminal.onData((id, data) => {
        if (id === termId && term) term.write(data)
      })

      unsubExit = window.api.terminal.onExit((id) => {
        if (id === termId && term) term.writeln('\r\n[终端已退出]')
      })

      // 用户输入
      onDataDisposable = term.onData((data) => {
        window.api.terminal.write(termId, data)
      })

      // ResizeObserver
      resizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          if (!term || !fitAddon || !container) return
          const { offsetWidth, offsetHeight } = container
          if (offsetWidth > 0 && offsetHeight > 0) {
            try {
              fitAddon.fit()
              window.api.terminal.resize(termId, term.cols, term.rows)
            } catch {}
          }
        }, 50)
      })
      resizeObserver.observe(container)
    }, 100)

    return () => {
      clearTimeout(initTimer)
      resizeObserver?.disconnect()
      unsubData?.()
      unsubExit?.()
      onDataDisposable?.dispose()
      window.api.terminal.destroy(termId)
      term?.dispose()
    }
  }, [cwd])

  return (
    <div
      className="h-full w-full p-3 bg-[#0d0d0d] rounded-lg cursor-text"
      onClick={() => xtermRef.current?.focus()}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
})

export default Terminal
