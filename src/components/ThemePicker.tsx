import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { themes } from '../types'

export default function ThemePicker() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 w-12 h-12 rounded-full shadow-lg z-50 flex items-center justify-center text-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: theme.gradient,
          boxShadow: `0 4px 15px ${theme.primary}40`,
        }}
        title="Ganti tema"
      >
        🎨
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 animate-fade-up">
          <div
            className="rounded-2xl p-4 shadow-2xl border backdrop-blur-xl"
            style={{
              background: 'var(--panel-bg)',
              borderColor: `${theme.primary}30`,
              maxWidth: '280px',
            }}
          >
            <p className="text-xs font-semibold mb-3 text-center uppercase tracking-wider text-theme-muted">
              Pilih Tema
            </p>
            <div className="grid grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                  style={{
                    background: theme.id === t.id ? `${t.primary}15` : 'transparent',
                    border: theme.id === t.id ? `2px solid ${t.primary}` : '2px solid transparent',
                  }}
                  title={t.name}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span
                    className="text-[10px] font-medium leading-tight text-center"
                    style={{ color: theme.id === t.id ? t.primary : 'var(--text-subtle)' }}
                  >
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </>
  )
}
