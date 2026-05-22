import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useTheme } from '../context/ThemeContext'

export default function Lobby() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { room, session, reconnectToRoom, setPlayerName, toggleReady, loading } = useGame()
  const [nameInput, setNameInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  useEffect(() => { if (roomId) reconnectToRoom() }, [roomId])

  const isCreator = session?.sessionId === room?.players?.[0]
  const myIndex = isCreator ? 0 : 1
  const myCurrentName = room?.playerNames?.[myIndex]
  const bothJoined = room?.players[0] && room?.players[1]
  const bothReady = room?.ready?.[0] && room?.ready?.[1]

  useEffect(() => {
    if (myCurrentName && myCurrentName !== `Player ${myIndex + 1}` && !nameSaved) {
      setNameSaved(true); setNameInput(myCurrentName)
    }
  }, [myCurrentName, myIndex, nameSaved])

  const saveName = useCallback(() => {
    if (nameInput.trim() && !nameSaved) { setPlayerName(nameInput.trim()); setNameSaved(true) }
  }, [nameInput, setPlayerName, nameSaved])

  useEffect(() => {
    if (room?.status === 'playing') {
      const t = setTimeout(() => navigate(`/game/${roomId}`), 800)
      return () => clearTimeout(t)
    }
  }, [room?.status, roomId, navigate])

  async function copyCode() {
    if (!room?.code) return
    try { await navigator.clipboard.writeText(room.code); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {
      const ta = document.createElement('textarea'); ta.value = room.code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); setCopied(true); setTimeout(() => setCopied(false), 2000)
    }
  }

  const cardStyle = { background: 'var(--card-bg)', backdropFilter: 'blur(12px)' as const, border: `1px solid ${theme.primary}30`, boxShadow: 'var(--card-shadow)' }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${theme.secondary}30`, borderTopColor: theme.primary }} />
          <p className="text-lg font-medium animate-pulse" style={{ color: theme.primary }}>Memuat room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 animate-fade-up">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-95 hover:opacity-80" style={{ background: `${theme.primary}10`, color: theme.primary }}>
          ← Kembali
        </button>

        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🎮</div>
          <h2 className="text-2xl font-bold text-theme-heading">Room Siap!</h2>
          <p className="text-theme-muted text-sm">Bagikan kode/tautan ini ke pasanganmu:</p>
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border-2 shadow-lg"
            style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', borderColor: `${theme.primary}40`, boxShadow: `0 0 20px ${theme.primary}20` }}>
            <span className="text-3xl font-mono font-bold tracking-[0.3em] select-all" style={{ color: theme.primary }}>{room.code}</span>
            <button onClick={copyCode} className="p-2.5 rounded-xl transition-all cursor-pointer active:scale-95 hover:opacity-70">
              {copied ? <span className="text-lg font-bold" style={{ color: theme.primary }}>✓</span> : (
                <svg className="w-5 h-5" style={{ color: theme.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={async () => {
              const url = `${window.location.origin}/join/${room.code}`
              try {
                if (navigator.share) {
                  await navigator.share({ title: 'QuestionGame', text: `Ikuti aku main QuestionGame yuk! Pakai kode: ${room.code}`, url })
                } else {
                  await navigator.clipboard.writeText(url); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000)
                }
              } catch { }
            }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-95"
              style={{ background: `${theme.primary}12`, color: theme.primary }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              {linkCopied ? '✓ Link tersalin' : 'Share Link'}
            </button>
          </div>
          {copied && <p className="text-sm animate-scale-in" style={{ color: theme.primary }}>✓ Kode berhasil disalin!</p>}
        </div>

        <div className="rounded-2xl p-6 shadow-lg space-y-4" style={cardStyle}>
          <h3 className="font-semibold text-theme-heading flex items-center gap-2"><span>👥</span> Pemain di Room</h3>
          <div className="space-y-3">
            {[
              {
                idx: 0,
                label: session?.sessionId === room.players[0] ? (nameSaved ? `${nameInput} (Kamu)` : 'Kamu') : (room.playerNames?.[0] || 'Player 1'),
                joined: !!room.players[0],
                ready: room.ready?.[0],
                initial: session?.sessionId === room.players[0] ? (nameSaved ? nameInput[0].toUpperCase() : 'K') : (room.playerNames?.[0]?.[0] || 'P1'),
                bg: theme.gradient,
                isMe: session?.sessionId === room.players[0],
              },
              {
                idx: 1,
                label: session?.sessionId === room.players[1] ? (nameSaved ? `${nameInput} (Kamu)` : 'Kamu') : (room.playerNames?.[1] || 'Pasangan'),
                joined: !!room.players[1],
                ready: room.ready?.[1],
                initial: session?.sessionId === room.players[1] ? (nameSaved ? nameInput[0].toUpperCase() : 'K') : (room.playerNames?.[1]?.[0] || 'P2'),
                bg: theme.gradientRev,
                isMe: session?.sessionId === room.players[1],
              },
            ].map((p, i) => (
              <div key={i} className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-500 ${p.joined ? 'border' : 'border border-dashed'}`}
                style={{ background: p.joined ? `${theme.primary}08` : 'rgba(0,0,0,0.02)', borderColor: p.joined ? `${theme.primary}30` : 'var(--card-border)' }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0" style={{ background: p.joined ? p.bg : '#d1d5db' }}>{p.initial}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-theme-heading truncate">{p.label}</p>
                  <p className="text-xs" style={{ color: p.ready ? theme.primary : 'var(--text-subtle)' }}>
                    {p.ready ? '✓ Siap' : !p.joined ? '⏳ Menunggu...' : '⏳ Belum siap'}
                  </p>
                </div>
                {p.isMe && p.joined && !bothReady && (
                  <button onClick={toggleReady} disabled={loading}
                    className="px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all btn-shine cursor-pointer disabled:opacity-50"
                    style={{ background: p.ready ? theme.gradientRev : theme.gradient }}>
                    {p.ready ? '✕ Batal' : '✓ Siap'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {!nameSaved && (
            <div className="pt-2 space-y-2 animate-fade-up">
              <p className="text-xs text-theme-subtle">Setel nama panggilan (sekali saja):</p>
              <div className="flex gap-2">
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Nama kamu..." maxLength={20}
                  className="flex-1 p-3 border rounded-xl focus:ring-2 outline-none transition-all text-theme-body"
                  style={{ borderColor: `${theme.secondary}30`, background: 'var(--input-bg)' }} autoFocus />
                <button onClick={saveName} disabled={!nameInput.trim()}
                  className="px-5 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-shine shrink-0"
                  style={{ background: theme.gradient }}>
                  Simpan
                </button>
              </div>
            </div>
          )}
          {nameSaved && (
            <div className="pt-1 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: `${theme.primary}15`, color: theme.primary }}>
                <span>✓</span> Nama tersimpan sebagai <strong>{nameInput}</strong>
              </span>
            </div>
          )}
        </div>

        {!bothJoined && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2" style={{ color: theme.primary }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: theme.primary }} />
              <span className="font-medium">Menunggu pasangan join...</span>
            </div>
            <p className="text-xs text-theme-subtle">Refresh halaman jika sudah menunggu lama</p>
          </div>
        )}
        {bothJoined && !bothReady && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-2xl border" style={{ background: `${theme.primary}10`, color: theme.primary, borderColor: `${theme.primary}30` }}>
              <span className="text-xl">👆</span>
              Menunggu <strong>{!room.ready[0] ? (room.playerNames[0] || 'Player 1') : (room.playerNames[1] || 'Player 2')}</strong> Siap
            </div>
          </div>
        )}
        {bothReady && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-2xl border" style={{ background: `${theme.primary}15`, color: theme.primary, borderColor: `${theme.primary}30` }}>
              <span className="text-xl">✨</span> Semua siap! Mengarahkan ke game...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
