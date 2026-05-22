import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Theme } from '../types'
import { themes } from '../types'

interface ThemeContextType {
  theme: Theme
  setTheme: (id: string) => void
  themeId: string
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.style.setProperty('--theme-primary', theme.primary)
  root.style.setProperty('--theme-primary-dark', theme.primaryDark)
  root.style.setProperty('--theme-secondary', theme.secondary)
  root.style.setProperty('--theme-secondary-dark', theme.secondaryDark)
  root.style.setProperty('--theme-accent', theme.accent)
  root.style.setProperty('--theme-gradient', theme.gradient)
  root.style.setProperty('--theme-gradient-rev', theme.gradientRev)
  root.style.setProperty('--theme-bg-from', theme.bgFrom)
  root.style.setProperty('--theme-bg-via', theme.bgVia)
  root.style.setProperty('--theme-bg-to', theme.bgTo)
  root.setAttribute('data-theme', theme.id)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem('qg_theme') || 'romantic'
  })

  const theme = themes.find((t) => t.id === themeId) || themes[0]

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('qg_theme', themeId)
  }, [theme, themeId])

  const setTheme = useCallback((id: string) => {
    setThemeId(id)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
