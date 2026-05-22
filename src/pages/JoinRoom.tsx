import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useTheme } from '../context/ThemeContext'

export default function JoinRoom() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { roomCode } = useParams<{ roomCode: string }>()
  const { joinExistingRoom, loading, error, clearError } = useGame()
  const [code, setCode] = useState('')

  const autoJoining = useRef(false)

  useEffect(() => {
    if (roomCode && !autoJoining.current) {
      const upper = roomCode.toUpperCase()
      setCode(upper)
      autoJoining.current = true
      const t = setTimeout(() => {
        const fn = async () => {
          const roomId = await joinExistingRoom(upper)
          if (roomId) navigate(`/lobby/${roomId}`)
        }
        fn()
      }, 500)
      return () => clearTimeout(t)
    }
  }, [roomCode])

  async function handleJoin() {
    const roomCode = code.trim().toUpperCase()
    if (roomCode.length < 4) { alert('Masukkan kode room yang valid.'); return }
    const roomId = await joinExistingRoom(roomCode)
    if (roomId) navigate(`/lobby/${roomId}`)
  }

  function handleCodeChange(value: string) {
    setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '')); clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-up">
      <div className="max-w-md w-full space-y-6">
        <button onClick={() => navigate('/')} className="font-medium transition-colors cursor-pointer flex items-center gap-1" style={{ color: theme.secondary }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </button>
        <div className="rounded-2xl p-8 shadow-lg space-y-6" style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', border: `1px solid ${theme.primary}30`, boxShadow: 'var(--card-shadow)' }}>
          <div className="text-center space-y-3">
            <div className="text-5xl animate-float">🔑</div>
            <h2 className="text-2xl font-bold text-theme-heading">Join Room</h2>
            <p className="text-theme-muted text-sm">Masukkan kode room yang diberikan pasanganmu</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-center text-theme-muted">Kode Room</label>
            <input type="text" value={code} onChange={(e) => handleCodeChange(e.target.value)} placeholder="CONTOH: ABC123" maxLength={6}
              className="w-full p-5 text-center text-3xl font-mono font-bold tracking-[0.4em] border-2 rounded-xl focus:ring-2 outline-none uppercase transition-all text-theme-body"
              style={{ borderColor: `${theme.secondary}30`, background: 'var(--input-bg)' }} autoFocus />
          </div>
          {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center animate-scale-in">{error}</div>}
          <button onClick={handleJoin} disabled={code.length < 4 || loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-shine"
            style={{ background: theme.gradient, boxShadow: `0 8px 25px ${theme.primary}40` }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Bergabung...
              </span>
            ) : '🚪 Join Room'}
          </button>
        </div>
      </div>
    </div>
  )
}
