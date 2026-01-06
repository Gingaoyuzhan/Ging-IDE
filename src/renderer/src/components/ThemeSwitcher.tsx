import React from 'react'
import { useTheme, ThemeName } from './ThemeProvider'
import { Monitor, Zap, Layout } from 'lucide-react'

const ThemeSwitcher: React.FC = () => {
    const { currentTheme, setTheme } = useTheme()

    const themes: { id: ThemeName; label: string; icon: React.ReactNode; color: string }[] = [
        { id: 'aurora', label: 'Aurora', icon: <Layout size={18} />, color: 'from-accent-primary to-accent-secondary' },
        { id: 'cyberpunk', label: 'Cyberpunk', icon: <Zap size={18} />, color: 'from-[#ff0055] to-[#00f3ff]' },
        { id: 'minimal', label: 'Minimal', icon: <Monitor size={18} />, color: 'from-gray-700 to-gray-500' },
    ]

    return (
        <div className="flex gap-2 p-1 glass-panel rounded-xl">
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`
                        relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium
                        ${currentTheme === theme.id
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    {/* Active Background */}
                    {currentTheme === theme.id && (
                        <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${theme.color} opacity-80 -z-10`} />
                    )}

                    {theme.icon}
                    <span>{theme.label}</span>
                </button>
            ))}
        </div>
    )
}

export default ThemeSwitcher
