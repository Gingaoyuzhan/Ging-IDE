import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, extname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs/promises'
import * as pty from 'node-pty'

const terminals: Map<string, pty.IPty> = new Map()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 窗口控制
  ipcMain.on('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })
  ipcMain.on('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })
  ipcMain.on('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close()
  })

  // ========== 文件系统操作 ==========

  // 读取目录
  ipcMain.handle('fs:readDir', async (_, dirPath: string) => {
    try {
      const targetPath = dirPath || app.getPath('home')
      const files = await fs.readdir(targetPath, { withFileTypes: true })
      return {
        success: true,
        data: files.map((dirent) => ({
          name: dirent.name,
          isDirectory: dirent.isDirectory(),
          path: join(targetPath, dirent.name),
          ext: dirent.isFile() ? extname(dirent.name) : null
        }))
      }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 读取文件内容
  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return { success: true, data: content }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 写入文件
  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 创建文件
  ipcMain.handle('fs:createFile', async (_, filePath: string) => {
    try {
      await fs.writeFile(filePath, '', 'utf-8')
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 创建目录
  ipcMain.handle('fs:createDir', async (_, dirPath: string) => {
    try {
      await fs.mkdir(dirPath, { recursive: true })
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 删除文件或目录
  ipcMain.handle('fs:delete', async (_, targetPath: string) => {
    try {
      const stat = await fs.stat(targetPath)
      if (stat.isDirectory()) {
        await fs.rm(targetPath, { recursive: true })
      } else {
        await fs.unlink(targetPath)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 重命名
  ipcMain.handle('fs:rename', async (_, oldPath: string, newPath: string) => {
    try {
      await fs.rename(oldPath, newPath)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 检查路径是否存在
  ipcMain.handle('fs:exists', async (_, targetPath: string) => {
    try {
      await fs.access(targetPath)
      return { success: true, data: true }
    } catch {
      return { success: true, data: false }
    }
  })

  // 打开文件夹选择对话框
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled) {
      return { success: true, data: null }
    }
    return { success: true, data: result.filePaths[0] }
  })

  // 打开文件选择对话框
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    })
    if (result.canceled) {
      return { success: true, data: null }
    }
    return { success: true, data: result.filePaths[0] }
  })

  // ========== 终端操作 ==========

  // 创建终端
  ipcMain.handle('terminal:create', (_, id: string, cwd?: string) => {
    try {
      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash'
      const term = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: cwd || app.getPath('home'),
        env: process.env as { [key: string]: string }
      })

      terminals.set(id, term)

      term.onData((data) => {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send('terminal:data', id, data)
        })
      })

      term.onExit(() => {
        terminals.delete(id)
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send('terminal:exit', id)
        })
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 向终端写入数据
  ipcMain.on('terminal:write', (_, id: string, data: string) => {
    const term = terminals.get(id)
    if (term) {
      term.write(data)
    }
  })

  // 调整终端大小
  ipcMain.on('terminal:resize', (_, id: string, cols: number, rows: number) => {
    const term = terminals.get(id)
    if (term) {
      term.resize(cols, rows)
    }
  })

  // 销毁终端
  ipcMain.handle('terminal:destroy', (_, id: string) => {
    const term = terminals.get(id)
    if (term) {
      term.kill()
      terminals.delete(id)
    }
    return { success: true }
  })

  // ========== AI配置 ==========

  // 默认配置 - 从环境变量读取
  let aiConfig = {
    provider: 'openai',
    apiKey: process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.ANTHROPIC_BASE_URL || process.env.OPENAI_BASE_URL || '',
    model: process.env.ANTHROPIC_MODEL || process.env.OPENAI_MODEL || 'claude-sonnet-4-20250514'
  }

  // 获取AI配置
  ipcMain.handle('ai:getConfig', () => {
    return {
      success: true,
      data: aiConfig
    }
  })

  // 保存AI配置（运行时）
  ipcMain.handle(
    'ai:setConfig',
    (
      _,
      config: { provider: string; apiKey: string; baseUrl: string; model: string }
    ) => {
      aiConfig = { ...config }
      // 同时更新 process.env 以便其他地方使用
      process.env.AI_PROVIDER = config.provider
      process.env.AI_API_KEY = config.apiKey
      process.env.AI_BASE_URL = config.baseUrl
      process.env.AI_MODEL = config.model
      return { success: true }
    }
  )

  // AI聊天 - 流式响应
  ipcMain.handle(
    'ai:chat',
    async (_, messages: Array<{ role: string; content: string }>, requestId: string) => {
      const { provider, apiKey, baseUrl, model } = aiConfig

      if (!apiKey) {
        return { success: false, error: '未配置 AI API Key，请点击设置按钮配置' }
      }

      try {
        let url: string
        let headers: Record<string, string>
        let body: unknown

        if (provider === 'anthropic' || provider === 'claude') {
          // 处理 Anthropic API URL
          let apiBase = baseUrl || 'https://api.anthropic.com/v1'
          apiBase = apiBase.replace(/\/+$/, '')
          // 如果没有包含 /messages，添加它
          if (!apiBase.endsWith('/messages')) {
            url = `${apiBase}/messages`
          } else {
            url = apiBase
          }
          headers = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
          body = {
            model: model || 'claude-3-sonnet-20240229',
            max_tokens: 4096,
            stream: true,
            messages: messages.map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          }
        } else {
          // OpenAI兼容格式 (OpenAI, DeepSeek, 本地Ollama等)
          let apiBase = baseUrl || 'https://api.openai.com/v1'
          // 移除末尾斜杠
          apiBase = apiBase.replace(/\/+$/, '')

          // 智能拼接路径
          if (apiBase.endsWith('/chat/completions')) {
            url = apiBase
          } else if (apiBase.endsWith('/v1')) {
            url = `${apiBase}/chat/completions`
          } else {
            // 如果是 /api 结尾，添加 /v1/chat/completions
            url = `${apiBase}/v1/chat/completions`
          }

          headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          }
          body = {
            model: model || 'gpt-3.5-turbo',
            stream: true,
            messages
          }
        }

        console.log('AI Request URL:', url)

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          const errorText = await response.text()
          return { success: false, error: `API错误: ${response.status} - ${errorText}` }
        }

        const reader = response.body?.getReader()
        if (!reader) {
          return { success: false, error: '无法读取响应流' }
        }

        const decoder = new TextDecoder()

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter((line) => line.trim())

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const json = JSON.parse(data)
                  let content = ''

                  if (provider === 'anthropic' || provider === 'claude') {
                    if (json.type === 'content_block_delta') {
                      content = json.delta?.text || ''
                    }
                  } else {
                    content = json.choices?.[0]?.delta?.content || ''
                  }

                  if (content) {
                    BrowserWindow.getAllWindows().forEach((win) => {
                      win.webContents.send('ai:stream', requestId, content)
                    })
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }
          }

          BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send('ai:stream:end', requestId)
          })
        }

        processStream()
        return { success: true }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    }
  )

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
