import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useTheme } from '../context/ThemeContext'

export default function CreateRoom() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { createNewRoom, loading, error, clearError } = useGame()
  const [questionsText, setQuestionsText] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState<string[]>([])
  const [step, setStep] = useState<'input' | 'review'>('input')

  function parseQuestions(text: string): string[] {
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
      .map(l => l.replace(/^[-•]\s*/, '').trim())
      .filter(l => l.length > 0).filter((v, i, a) => a.indexOf(v) === i)
  }

  function handlePreview() {
    const qs = parseQuestions(questionsText)
    if (qs.length < 2) { alert('Masukkan minimal 2 pertanyaan.'); return }
    setParsedQuestions(qs); setStep('review')
  }

  async function handleCreate() {
    if (parsedQuestions.length < 2) return
    const roomId = await createNewRoom(parsedQuestions)
    if (roomId) navigate(`/lobby/${roomId}`)
  }

  const btnStyle = { background: theme.gradient, boxShadow: `0 8px 25px ${theme.primary}40` }
  const cardStyle = { background: 'var(--card-bg)', backdropFilter: 'blur(12px)' as const, border: `1px solid ${theme.primary}30`, boxShadow: 'var(--card-shadow)' }

  if (step === 'review') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-up">
        <div className="max-w-lg w-full space-y-6">
          <button onClick={() => setStep('input')} className="font-medium transition-colors cursor-pointer flex items-center gap-1" style={{ color: theme.secondary }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Kembali
          </button>
          <div className="rounded-2xl p-6 shadow-lg space-y-4" style={cardStyle}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-theme-heading">Review Pertanyaan</h2>
              <span className="text-white px-3.5 py-1.5 rounded-full text-sm font-medium shadow-md" style={{ background: theme.gradient }}>
                {parsedQuestions.length} soal
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {parsedQuestions.map((q, i) => (
                <div key={i} className="p-3.5 rounded-xl text-sm border card-hover animate-fade-in" style={{ animationDelay: `${i * 50}ms`, background: `${theme.secondary}08`, borderColor: `${theme.primary}15` }}>
                  <span className="font-medium" style={{ color: theme.primary }}>Q{i + 1}.</span>
                  <span className="text-theme-body"> {q}</span>
                </div>
              ))}
            </div>
            {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-scale-in">{error}</div>}
            <button onClick={handleCreate} disabled={loading}
              className="w-full py-3.5 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed btn-shine" style={btnStyle}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat Room...
                </span>
              ) : '🚀 Buat Room & Mulai'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-up">
      <div className="max-w-lg w-full space-y-6">
        <button onClick={() => navigate('/')} className="font-medium transition-colors cursor-pointer flex items-center gap-1" style={{ color: theme.secondary }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </button>
        <div className="rounded-2xl p-6 shadow-lg space-y-4" style={cardStyle}>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-theme-heading">✏️ Import Pertanyaan</h2>
            <p className="text-theme-muted text-sm">Paste pertanyaan kamu di sini. Pisahkan setiap pertanyaan dengan baris baru.</p>
          </div>
          <textarea value={questionsText} onChange={(e) => { setQuestionsText(e.target.value); clearError() }}
            placeholder={`Contoh:\nMenurut kamu, hubungan kita bakal seperti apa 5 tahun lagi?\nKalau nanti tinggal bareng, hal apa yang paling kamu takutkan?`}
            className="w-full h-64 p-4 border rounded-xl focus:ring-2 outline-none resize-none transition-all text-theme-body"
            style={{ borderColor: `${theme.secondary}30`, background: 'var(--input-bg)' }} />
          <div className="flex items-center gap-2 text-xs text-theme-subtle"><span>💡</span><span>Pisahkan setiap pertanyaan dengan baris baru (Enter)</span></div>
          {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-scale-in">{error}</div>}
          <button onClick={handlePreview} disabled={questionsText.trim().length < 5}
            className="w-full py-3.5 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-shine" style={btnStyle}>
            👀 Preview Pertanyaan
          </button>
        </div>
        <div className="rounded-2xl p-5 border" style={{ background: `${theme.secondary}08`, borderColor: `${theme.primary}15` }}>
          <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: theme.secondaryDark }}><span>💡</span> Tips</h3>
          <ul className="text-sm space-y-1.5 text-theme-muted">
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Minimal <strong>2 pertanyaan</strong> agar game bisa dimulai</span></li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Pertanyaan akan ditampilkan secara acak</span></li>
            <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Pertanyaan yang sudah dipakai tidak bisa dipakai lagi</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
