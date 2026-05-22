import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useTheme } from '../context/ThemeContext'

export default function GameOver() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { room, reconnectToRoom } = useGame()

  useEffect(() => { if (roomId) reconnectToRoom() }, [roomId])

  const allQuestions = room?.questions || []
  const usedQuestions = room?.usedQuestions || []
  const answers = room?.answers || {}
  const usedCount = usedQuestions.length
  const answeredCount = Object.values(answers).filter(a => a !== '— Skipped —').length
  const skippedCount = Object.values(answers).filter(a => a === '— Skipped —').length

  const qa = useMemo(() => allQuestions.map(q => ({
    question: q, asked: usedQuestions.includes(q), answer: answers[q] || null
  })), [allQuestions, usedQuestions, answers])

  const p1 = room?.playerNames?.[0] || 'Player 1'
  const p2 = room?.playerNames?.[1] || 'Player 2'

  const cardStyle = { background: 'var(--card-bg)', backdropFilter: 'blur(12px)' as const, border: `1px solid ${theme.primary}30`, boxShadow: 'var(--card-shadow)' }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${theme.secondary}30`, borderTopColor: theme.primary }} />
          <p className="text-lg font-medium animate-pulse" style={{ color: theme.primary }}>Memuat hasil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-lg w-full mx-auto space-y-6 py-8 px-4">
        <div className="text-center space-y-4 animate-fade-up">
          <div className="text-7xl animate-heartbeat">🎉</div>
          <h1 className="text-4xl font-bold"><span className="text-gradient-clip" style={{ background: theme.gradient }}>Game Selesai!</span></h1>
          <p className="text-theme-muted">Semua {allQuestions.length} pertanyaan telah ditanyakan!</p>
        </div>

        <div className="rounded-2xl p-6 shadow-lg animate-scale-in space-y-4" style={cardStyle}>
          <h2 className="font-semibold text-theme-heading text-center flex items-center justify-center gap-2"><span>📊</span> Statistik Game</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Ditanyakan', value: usedCount, bg: `${theme.primary}15`, color: theme.primary },
              { label: 'Dijawab', value: answeredCount, bg: `${theme.secondary}15`, color: theme.secondary },
              { label: 'Skipped', value: skippedCount, bg: 'var(--card-bg)', color: 'var(--text-muted)' },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl text-center card-hover border" style={{ background: s.bg, borderColor: 'var(--card-border)' }}>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-theme-subtle mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm px-2 pt-1 border-t" style={{ color: theme.secondary, borderColor: `${theme.primary}15` }}>
            <span className="flex items-center gap-1">❤️ {p1}</span>
            <span className="flex items-center gap-1">💜 {p2}</span>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-lg animate-fade-up space-y-4" style={cardStyle}>
          <h2 className="font-semibold text-theme-heading flex items-center gap-2"><span>📝</span> Riwayat & Jawaban</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {qa.map((item, i) => (
              <div key={i} className={`p-4 rounded-xl text-sm transition-all duration-300 card-hover animate-fade-in ${item.asked ? 'border' : 'opacity-50'}`}
                style={{
                  animationDelay: `${i * 50}ms`,
                  background: item.asked ? `${theme.primary}05` : 'transparent',
                  borderColor: item.asked ? `${theme.primary}20` : 'var(--card-border)',
                }}>
                <div className="flex items-start gap-3">
                  <span className={`font-bold min-w-8 text-lg ${item.asked ? 'text-gradient-clip' : ''}`} style={{ background: item.asked ? theme.gradient : 'none', color: item.asked ? 'transparent' : 'var(--text-subtle)' }}>Q{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className={item.asked ? 'text-theme-body' : 'text-theme-subtle'}>{item.question}</p>
                    {item.asked && (
                      <div className="mt-2.5 p-3 rounded-lg border" style={{ background: 'var(--card-bg)', borderColor: `${theme.primary}15` }}>
                        {item.answer !== '— Skipped —' ? (
                          <>
                            <span className="text-xs font-medium" style={{ color: theme.secondary }}>Jawaban: </span>
                            <span className="font-medium text-theme-body">{item.answer}</span>
                          </>
                        ) : (
                          <span className="text-theme-subtle italic">— Dilewati (Skipped) —</span>
                        )}
                      </div>
                    )}
                    {!item.asked && <p className="text-xs text-theme-subtle mt-1 italic">— Tidak ditanyakan —</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/')}
          className="w-full py-3.5 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 btn-shine cursor-pointer"
          style={{ background: theme.gradient, boxShadow: `0 8px 25px ${theme.primary}40` }}>
          🏠 Kembali ke Beranda
        </button>

        <p className="text-center text-xs text-theme-subtle pb-8">Semoga makin dekat dan makin sayang ❤️</p>
      </div>
    </div>
  )
}
