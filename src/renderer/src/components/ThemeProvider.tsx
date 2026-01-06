import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeName = 'aurora' | 'cyberpunk' | 'minimal'

interface ThemeConfig {
  name: ThemeName
  colors: {
    glassBg: string
    glassBorder: string
    glassHighlight: string
    accentPrimary: string
    accentSecondary: string
    textPrimary: string
    textSecondary: string
  }
}

const themes: Record<ThemeName, ThemeConfig> = {
  aurora: {
    name: 'aurora',
    colors: {
      glassBg: 'rgba(20, 20, 25, 0.6)',
      glassBorder: 'rgba(255, 255, 255, 0.12)',
      glassHighlight: 'rgba(255, 255, 255, 0.25)',
      accentPrimary: '#a855f7',
      accentSecondary: '#0891b2',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8'
    }
  },
  cyberpunk: {
    name: 'cyberpunk',
    colors: {
      glassBg: 'rgba(5, 5, 10, 0.7)',
      glassBorder: 'rgba(255, 0, 85, 0.4)',
      glassHighlight: 'rgba(0, 243, 255, 0.3)',
      accentPrimary: '#ff0055',
      accentSecondary: '#00f3ff',
      textPrimary: '#00f3ff',
      textSecondary: '#ff0055'
    }
  },
  minimal: {
    name: 'minimal',
    colors: {
      glassBg: 'rgba(255, 255, 255, 0.9)',
      glassBorder: 'rgba(0, 0, 0, 0.1)',
      glassHighlight: 'rgba(0, 0, 0, 0.05)',
      accentPrimary: '#18181b',
      accentSecondary: '#52525b',
      textPrimary: '#18181b',
      textSecondary: '#71717a'
    }
  }
}

const ThemeContext = createContext<{
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
}>({
  currentTheme: 'aurora',
  setTheme: () => { }
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('aurora')

  useEffect(() => {
    const theme = themes[currentTheme]
    const root = document.documentElement

    root.style.setProperty('--color-glass-bg', theme.colors.glassBg)
    root.style.setProperty('--color-glass-border', theme.colors.glassBorder)
    root.style.setProperty('--color-glass-highlight', theme.colors.glassHighlight)
    root.style.setProperty('--color-accent-primary', theme.colors.accentPrimary)
    root.style.setProperty('--color-accent-secondary', theme.colors.accentSecondary)
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary)
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)

    // Update body background for themes
    if (currentTheme === 'minimal') {
      document.body.style.backgroundImage = 'none'
      document.body.style.backgroundColor = '#f4f4f5'
    } else {
      document.body.style.backgroundColor = '#0f172a'
      // Restore gradient
      document.body.style.backgroundImage = `
            radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%),
            radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0, transparent 50%)
        `
    }
  }, [currentTheme])

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
