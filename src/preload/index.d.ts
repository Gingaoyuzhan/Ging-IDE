import { ElectronAPI } from '@electron-toolkit/preload'

interface ApiResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

interface FileEntry {
  name: string
  isDirectory: boolean
  path: string
  ext: string | null
}

interface AIConfig {
  provider: string
  apiKey: string
  baseUrl: string
  model: string
}

interface RecentProject {
  path: string
  name: string
}

interface GitStatus {
  branch: string | null
  modified: string[]
  created: string[]
  deleted: string[]
  not_added: string[]
  staged: string[]
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fs: {
        readDir: (path: string) => Promise<ApiResult<FileEntry[]>>
        readDirRecursive: (path: string) => Promise<ApiResult<string[]>>
        readFile: (path: string) => Promise<ApiResult<string>>
        writeFile: (path: string, content: string) => Promise<ApiResult>
        createFile: (path: string) => Promise<ApiResult>
        createDir: (path: string) => Promise<ApiResult>
        delete: (path: string) => Promise<ApiResult>
        rename: (oldPath: string, newPath: string) => Promise<ApiResult>
        exists: (path: string) => Promise<ApiResult<boolean>>
      }
      dialog: {
        openFolder: () => Promise<ApiResult<string | null>>
        openFile: () => Promise<ApiResult<string | null>>
      }
      terminal: {
        create: (id: string, cwd?: string) => Promise<ApiResult>
        write: (id: string, data: string) => void
        resize: (id: string, cols: number, rows: number) => void
        destroy: (id: string) => Promise<ApiResult>
        kill: (id: string) => Promise<ApiResult>
        onData: (callback: (id: string, data: string) => void) => () => void
        onExit: (callback: (id: string) => void) => () => void
      }
      ai: {
        getConfig: () => Promise<ApiResult<AIConfig>>
        setConfig: (config: AIConfig) => Promise<ApiResult>
        chat: (
          messages: Array<{ role: string; content: string }>,
          requestId: string
        ) => Promise<ApiResult>
        onStream: (callback: (requestId: string, content: string) => void) => () => void
        onStreamEnd: (callback: (requestId: string) => void) => () => void
      }
      store: {
        getRecentProjects: () => Promise<ApiResult<RecentProject[]>>
        addRecentProject: (project: RecentProject) => Promise<ApiResult>
      }
      git: {
        status: (repoPath: string) => Promise<ApiResult<GitStatus | null>>
      }
    }
  }
}
