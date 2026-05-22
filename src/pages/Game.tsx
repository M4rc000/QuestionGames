import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { useTheme } from '../context/ThemeContext'

type LocalPhase =
  | 'waiting'
  | 'choosing_mode'
  | 'showing_question'
  | 'answering'
  | 'sent'

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const {
    room, session, isMyTurn, isMyTurnToAnswer,
    getMyPickChances, getUnusedQuestions,
    submitQuestion, submitAnswer, loading, reconnectToRoom,
  } = useGame()

  const [localPhase, setLocalPhase] = useState<LocalPhase>('waiting')
  const [selectedQuestion, setSelectedQuestion] = useState<string>('')
  const [pickOptions, setPickOptions] = useState<string[]>([])
  const [usedPickChance, setUsedPickChance] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [timer, setTimer] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [showPickList, setShowPickList] = useState(false)
  const firstAutoPickDone = useRef(false)

  useEffect(() => { if (roomId) reconnectToRoom() }, [roomId])
  useEffect(() => {
    if (room?.status === 'finished') navigate(`/gameover/${roomId}`)
  }, [room?.status, roomId, navigate])

  const myTurn = isMyTurn()
  const myTurnToAnswer = isMyTurnToAnswer()
  const pickChances = getMyPickChances()
  const unusedQuestions = getUnusedQuestions()
  const totalQuestions = room?.questions.length || 0
  const usedCount = room?.usedQuestions.length || 0
  const remainingCount = unusedQuestions.length
  const progressPercent = totalQuestions > 0 ? (usedCount / totalQuestions) * 100 : 0

  const myIndex = useMemo(() => {
    if (!room || !session) return -1
    return room.players.indexOf(session.sessionId)
  }, [room, session])

  const peerName = useMemo(() => {
    if (!room || myIndex === -1) return 'Pasangan'
    return room.playerNames?.[myIndex === 0 ? 1 : 0] || 'Player'
  }, [room, myIndex])

  const myName = useMemo(() => {
    if (!room || myIndex === -1) return 'Kamu'
    return room.playerNames?.[myIndex] || `Player ${myIndex + 1}`
  }, [room, myIndex])

  const isFirstQuestion = (room?.usedQuestions.length ?? 0) === 0
  const currentQuestion = room?.lastQuestion || ''

  const previousAnswer = useMemo(() => {
    if (!room || !session) return null
    if (room.lastAnswer && room.lastAnswerBy !== session.sessionId && currentQuestion) {
      return room.lastAnswer
    }
    return null
  }, [room?.lastAnswer, room?.lastAnswerBy, session?.sessionId, currentQuestion])

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer(); setTimer(30)
    timerRef.current = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearTimer(); return 0 }; return t - 1 })
    }, 1000)
  }, [clearTimer])

  const handleRandom = useCallback(() => {
    if (unusedQuestions.length === 0) return
    clearTimer(); setUsedPickChance(false)
    setSelectedQuestion(unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)])
    setLocalPhase('showing_question'); setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 600)
  }, [unusedQuestions, clearTimer])

  useEffect(() => {
    if (myTurn && isFirstQuestion && localPhase === 'waiting' && !firstAutoPickDone.current) {
      firstAutoPickDone.current = true
      const qs = getUnusedQuestions()
      if (qs.length > 0) {
        setSelectedQuestion(qs[Math.floor(Math.random() * qs.length)])
        setUsedPickChance(false); setLocalPhase('showing_question'); setShowAnimation(true)
        setTimeout(() => setShowAnimation(false), 600)
      }
    }
  }, [myTurn, isFirstQuestion, localPhase, getUnusedQuestions])

  useEffect(() => {
    if (!room) return
    if (myTurn && localPhase === 'waiting') {
      setLocalPhase('choosing_mode'); startTimer(); setSelectedQuestion(''); setAnswerText(''); setShowPickList(false)
    } else if (myTurnToAnswer && localPhase === 'waiting') {
      setLocalPhase('answering'); setAnswerText('')
    } else if (!myTurn && !myTurnToAnswer && localPhase !== 'waiting' && localPhase !== 'sent') {
      const to = setTimeout(() => setLocalPhase('waiting'), 500)
      return () => clearTimeout(to)
    }
  }, [myTurn, myTurnToAnswer, room?.currentTurn, room?.currentPhase])

  useEffect(() => {
    if (timer === 0 && localPhase === 'choosing_mode') handleRandom()
  }, [timer, localPhase, handleRandom])

  const confirmPick = useCallback((q: string) => {
    setSelectedQuestion(q); setUsedPickChance(true); setShowPickList(false)
    setLocalPhase('showing_question'); setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 600)
  }, [])

  const sendQuestion = useCallback(async () => {
    if (!selectedQuestion) return
    await submitQuestion(selectedQuestion, usedPickChance)
    setUsedPickChance(false); setJustSubmitted(true); setLocalPhase('sent'); clearTimer()
    setTimeout(() => { setJustSubmitted(false); setLocalPhase('waiting') }, 1500)
  }, [selectedQuestion, submitQuestion, usedPickChance, clearTimer])

  const handleAnswer = useCallback(async () => {
    if (!currentQuestion) return
    await submitAnswer(currentQuestion, answerText.trim() || '— Skipped —')
    setJustSubmitted(true); setLocalPhase('sent')
    setTimeout(() => { setJustSubmitted(false); setLocalPhase('waiting') }, 1200)
  }, [currentQuestion, answerText, submitAnswer])

  const handleSkip = useCallback(async () => {
    if (!currentQuestion) return
    await submitAnswer(currentQuestion, '— Skipped —')
    setJustSubmitted(true); setLocalPhase('sent')
    setTimeout(() => { setJustSubmitted(false); setLocalPhase('waiting') }, 1200)
  }, [currentQuestion, submitAnswer])

  const glassBorder = `1px solid ${theme.primary}30`
  const glassShadow = `0 8px 30px ${theme.primary}20`

  if (!room || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${theme.secondary}30`, borderTopColor: theme.primary }} />
          <p className="text-lg font-medium animate-pulse" style={{ color: theme.primary }}>Memuat game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col gap-3 p-4 py-6">
        {/* Progress */}
        <div className="rounded-2xl p-4 shadow-sm animate-fade-in border" style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', borderColor: `${theme.primary}30`, boxShadow: 'var(--card-shadow)' }}>
          <div className="flex justify-between text-xs mb-2.5" style={{ color: theme.secondary }}>
            <span className="font-medium">Progress</span>
            <span className="font-medium">{usedCount}/{totalQuestions} · Sisa {remainingCount}</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: `${theme.secondary}20` }}>
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%`, background: theme.gradient, boxShadow: `0 0 8px ${theme.primary}40` }} />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-500"
            style={{
              background: myTurn ? theme.gradient : myTurnToAnswer ? `${theme.primary}15` : 'var(--card-bg)',
              color: myTurn ? '#fff' : myTurnToAnswer ? theme.primary : 'var(--text-muted)',
              border: !myTurn && !myTurnToAnswer ? `1px solid var(--card-border)` : myTurnToAnswer ? `1px solid ${theme.primary}30` : 'none',
              boxShadow: myTurn ? `0 4px 15px ${theme.primary}40` : 'none',
            }}>
            {myTurn ? '🎯 Giliran kamu bertanya' : myTurnToAnswer ? `✋ ${peerName} bertanya` : `⏳ Menunggu ${peerName}...`}
          </div>
          <div className="text-xs px-3 py-2 rounded-xl border shadow-sm whitespace-nowrap text-theme-muted" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
            🎲 Pilih 5: <span className="font-bold" style={{ color: theme.primary }}>{pickChances}</span>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-4">
          {/* Previous answer */}
          {previousAnswer && myTurnToAnswer && localPhase === 'answering' && (
            <div className="w-full max-w-sm animate-fade-in">
              <div className="rounded-xl p-4 border backdrop-blur-sm" style={{ background: `${theme.secondary}08`, borderColor: `${theme.secondary}20` }}>
                <p className="text-xs font-medium mb-1 text-theme-muted">💬 Jawaban sebelumnya:</p>
                <p className="text-sm" style={{ color: theme.primaryDark }}>{previousAnswer}</p>
              </div>
            </div>
          )}

          {/* Choosing mode */}
          {myTurn && localPhase === 'choosing_mode' && !showPickList && (
            <div className="w-full max-w-sm text-center space-y-6 animate-fade-up">
              <div className="space-y-2">
                <div className="text-5xl animate-float">🎯</div>
                <h3 className="text-xl font-bold text-theme-heading">Giliranmu, {myName}!</h3>
                <p className="text-sm text-theme-muted">Pilih cara melempar pertanyaan ke {peerName}</p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke={`${theme.secondary}20`} strokeWidth="5" />
                    <circle cx="36" cy="36" r="30" fill="none" stroke={timer <= 5 ? '#f43f5e' : theme.primary} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={`${(timer / 30) * 188.5} 188.5`} className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: timer <= 5 ? '#f43f5e' : theme.primary }}>{timer}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={handleRandom} disabled={loading}
                  className="w-full py-4 px-6 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 btn-shine cursor-pointer"
                  style={{ background: theme.gradient, boxShadow: `0 8px 25px ${theme.primary}40` }}>
                  🎲 Lempar Random
                </button>
                <button onClick={() => {
                  if (pickChances <= 0) return; clearTimer()
                  const sh = [...unusedQuestions].sort(() => Math.random() - 0.5)
                  setPickOptions(sh.slice(0, Math.min(5, sh.length))); setShowPickList(true)
                }} disabled={pickChances <= 0 || loading}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-lg border-2 shadow-sm hover:shadow-lg transition-all duration-300 disabled:opacity-40 cursor-pointer"
                  style={{ background: 'var(--card-bg)', color: theme.primary, borderColor: `${theme.primary}30` }}>
                  🎯 Pilih dari 5 <span className="text-sm font-normal text-theme-muted">(sisa {pickChances})</span>
                </button>
              </div>
            </div>
          )}

          {/* Pick list */}
          {myTurn && showPickList && (
            <div className="w-full space-y-4 animate-fade-up">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎯</div>
                <h3 className="text-lg font-bold text-theme-heading">Pilih 1 pertanyaan</h3>
                <p className="text-xs text-theme-muted">Sisa: {pickChances - 1}</p>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {pickOptions.map((q, i) => (
                  <button key={i} onClick={() => confirmPick(q)} disabled={loading}
                    className="w-full p-4 rounded-xl text-left text-sm transition-all duration-200 card-hover cursor-pointer animate-fade-in disabled:opacity-50 border"
                    style={{ animationDelay: `${i * 80}ms`, background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                    <span className="font-bold mr-2" style={{ color: theme.primary }}>#{i + 1}</span>
                    <span className="text-theme-body">{q}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowPickList(false); startTimer() }}
                className="text-sm mx-auto block underline cursor-pointer text-theme-muted">← Kembali</button>
            </div>
          )}

          {/* Showing question */}
          {localPhase === 'showing_question' && selectedQuestion && (
            <div className="w-full max-w-sm text-center space-y-6 animate-scale-in">
              <div className={`transition-all duration-500 ${showAnimation ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>
                <div className="text-5xl mb-3">💌</div>
                <p className="text-sm mb-3 text-theme-muted">
                  Pertanyaan untuk <strong style={{ color: theme.primary }}>{peerName}</strong>:
                </p>
                <div className="rounded-2xl p-6 shadow-lg" style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', border: glassBorder, boxShadow: `var(--card-shadow), ${glassShadow}` }}>
                  <p className="text-lg font-medium leading-relaxed text-theme-heading">{selectedQuestion}</p>
                </div>
              </div>
              <button onClick={sendQuestion} disabled={loading}
                className="py-3.5 px-10 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 btn-shine cursor-pointer"
                style={{ background: theme.gradient }}>
                {loading ? 'Mengirim...' : '📤 Kirim Pertanyaan'}
              </button>
            </div>
          )}

          {/* Answering */}
          {myTurnToAnswer && localPhase === 'answering' && (
            <div className="w-full max-w-sm space-y-6 animate-fade-up">
              {justSubmitted ? (
                <div className="text-center space-y-4 animate-scale-in">
                  <div className="text-6xl animate-heartbeat">✅</div>
                  <p className="font-semibold text-lg" style={{ color: theme.primary }}>Jawaban terkirim!</p>
                  <p className="text-sm text-theme-muted">Bersiap untuk giliran bertanya...</p>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-3">
                    <div className="text-4xl animate-float">💭</div>
                    <p className="text-sm text-theme-muted"><strong style={{ color: theme.primary }}>{peerName}</strong> bertanya:</p>
    <div className="rounded-2xl p-6 shadow-lg" style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', border: glassBorder, boxShadow: `var(--card-shadow), ${glassShadow}` }}>
                      <p className="text-lg font-medium leading-relaxed text-theme-heading">{currentQuestion}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Tulis jawabanmu di sini..." rows={3}
                      className="w-full p-4 border rounded-xl focus:ring-2 outline-none resize-none transition-all text-theme-body"
                      style={{ borderColor: `${theme.secondary}30`, background: 'var(--input-bg)' }} autoFocus />
                    <div className="flex gap-3">
                      <button onClick={handleAnswer} disabled={loading || !answerText.trim()}
                        className="flex-1 py-3.5 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-40 btn-shine cursor-pointer disabled:cursor-not-allowed"
                        style={{ background: theme.gradient }}>
                        {loading ? 'Mengirim...' : '💬 Kirim Jawaban'}
                      </button>
                      <button onClick={handleSkip} disabled={loading}
                        className="py-3.5 px-6 rounded-xl font-medium transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        style={{ background: `${theme.secondary}15`, color: theme.secondary }}>
                        ⏭ Skip
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sent confirmation */}
          {localPhase === 'sent' && !myTurnToAnswer && (
            <div className="text-center space-y-4 animate-scale-in">
              <div className="text-6xl animate-heartbeat">✉️</div>
              <p className="font-semibold text-lg" style={{ color: theme.primary }}>Pertanyaan terkirim!</p>
              <p className="text-sm text-theme-muted">Menunggu {peerName} menjawab...</p>
            </div>
          )}

          {/* Waiting game start */}
          {localPhase === 'waiting' && !myTurn && !myTurnToAnswer && !currentQuestion && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="text-6xl animate-float">🎮</div>
              <p className="text-lg font-medium text-theme-heading">Game akan segera dimulai!</p>
              <p className="text-sm text-theme-muted">{peerName} akan memulai dengan pertanyaan pertama</p>
            </div>
          )}

          {/* Waiting other player + show prev answer */}
          {localPhase === 'waiting' && !myTurn && !myTurnToAnswer && currentQuestion && (
            <>
              {previousAnswer && (
                <div className="w-full max-w-sm animate-fade-in">
                  <div className="rounded-xl p-4 border backdrop-blur-sm" style={{ background: `${theme.secondary}08`, borderColor: `${theme.secondary}20` }}>
                    <p className="text-xs font-medium mb-1 text-theme-muted">💬 Jawaban {peerName} sebelumnya:</p>
                    <p className="text-sm" style={{ color: theme.primaryDark }}>{previousAnswer}</p>
                  </div>
                </div>
              )}
              <div className="w-full max-w-sm text-center space-y-4 animate-fade-in">
                <div className="animate-float text-4xl">💭</div>
                <p className="text-sm text-theme-muted">
                  <strong style={{ color: theme.primary }}>{peerName}</strong> sedang memilih pertanyaan...
                </p>
                <div className="rounded-2xl p-6 shadow-lg" style={{ background: 'var(--card-bg)', backdropFilter: 'blur(12px)', border: glassBorder, boxShadow: `var(--card-shadow), ${glassShadow}` }}>
                  <p className="text-theme-subtle text-xs mb-2">Pertanyaan sebelumnya</p>
                  <p className="text-lg font-medium leading-relaxed text-theme-heading">{currentQuestion}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-theme-muted">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ background: theme.primary }} />
                  <span className="text-sm">Menunggu pertanyaan baru...</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
