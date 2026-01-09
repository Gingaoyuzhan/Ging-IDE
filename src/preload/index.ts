import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 文件系统API
const fsApi = {
  readDir: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  readDirRecursive: (path: string) => ipcRenderer.invoke('fs:readDirRecursive', path),
  readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeFile', path, content),
  createFile: (path: string) => ipcRenderer.invoke('fs:createFile', path),
  createDir: (path: string) => ipcRenderer.invoke('fs:createDir', path),
  delete: (path: string) => ipcRenderer.invoke('fs:delete', path),
  rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
  exists: (path: string) => ipcRenderer.invoke('fs:exists', path)
}

// 对话框API
const dialogApi = {
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  openFile: () => ipcRenderer.invoke('dialog:openFile')
}

// 终端API
const terminalApi = {
  create: (id: string, cwd?: string) => ipcRenderer.invoke('terminal:create', id, cwd),
  write: (id: string, data: string) => ipcRenderer.send('terminal:write', id, data),
  resize: (id: string, cols: number, rows: number) =>
    ipcRenderer.send('terminal:resize', id, cols, rows),
  destroy: (id: string) => ipcRenderer.invoke('terminal:destroy', id),
  kill: (id: string) => ipcRenderer.invoke('terminal:kill', id),
  onData: (callback: (id: string, data: string) => void) => {
    const handler = (_: unknown, id: string, data: string) => callback(id, data)
    ipcRenderer.on('terminal:data', handler)
    return () => ipcRenderer.removeListener('terminal:data', handler)
  },
  onExit: (callback: (id: string) => void) => {
    const handler = (_: unknown, id: string) => callback(id)
    ipcRenderer.on('terminal:exit', handler)
    return () => ipcRenderer.removeListener('terminal:exit', handler)
  }
}

// AI配置API
const aiApi = {
  getConfig: () => ipcRenderer.invoke('ai:getConfig'),
  setConfig: (config: { provider: string; apiKey: string; baseUrl: string; model: string }) =>
    ipcRenderer.invoke('ai:setConfig', config),
  chat: (messages: Array<{ role: string; content: string }>, requestId: string) =>
    ipcRenderer.invoke('ai:chat', messages, requestId),
  onStream: (callback: (requestId: string, content: string) => void) => {
    const handler = (_: unknown, requestId: string, content: string) => callback(requestId, content)
    ipcRenderer.on('ai:stream', handler)
    return () => ipcRenderer.removeListener('ai:stream', handler)
  },
  onStreamEnd: (callback: (requestId: string) => void) => {
    const handler = (_: unknown, requestId: string) => callback(requestId)
    ipcRenderer.on('ai:stream:end', handler)
    return () => ipcRenderer.removeListener('ai:stream:end', handler)
  }
}

// 存储API
const storeApi = {
  getRecentProjects: () => ipcRenderer.invoke('store:getRecentProjects'),
  addRecentProject: (project: { path: string; name: string }) =>
    ipcRenderer.invoke('store:addRecentProject', project)
}

// Git API
const gitApi = {
  status: (repoPath: string) => ipcRenderer.invoke('git:status', repoPath)
}

// 合并所有API
const api = {
  fs: fsApi,
  dialog: dialogApi,
  terminal: terminalApi,
  ai: aiApi,
  store: storeApi,
  git: gitApi
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
