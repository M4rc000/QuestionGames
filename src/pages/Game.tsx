import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

type LocalPhase =
  | 'waiting'
  | 'choosing_mode'
  | 'showing_question'
  | 'answering'
  | 'sent'

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const {
    room,
    session,
    isMyTurn,
    isMyTurnToAnswer,
    getMyPickChances,
    getUnusedQuestions,
    submitQuestion,
    submitAnswer,
    loading,
    reconnectToRoom,
  } = useGame()

  const [localPhase, setLocalPhase] = useState<LocalPhase>('waiting')
  const [selectedQuestion, setSelectedQuestion] = useState<string>('')
  const [pickOptions, setPickOptions] = useState<string[]>([])
  const [usedPickChance, setUsedPickChance] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [timer, setTimer] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [justAnswered, setJustAnswered] = useState(false)
  const [showPickList, setShowPickList] = useState(false)
  const firstAutoPickDone = useRef(false)

  useEffect(() => {
    if (roomId) reconnectToRoom()
  }, [roomId])

  useEffect(() => {
    if (room?.status === 'finished') {
      navigate(`/gameover/${roomId}`)
    }
  }, [room?.status, roomId, navigate])

  const myTurn = isMyTurn()
  const myTurnToAnswer = isMyTurnToAnswer()
  const pickChances = getMyPickChances()
  const unusedQuestions = getUnusedQuestions()
  const totalQuestions = room?.questions.length || 0
  const usedCount = room?.usedQuestions.length || 0
  const remainingCount = unusedQuestions.length
  const progressPercent =
    totalQuestions > 0 ? (usedCount / totalQuestions) * 100 : 0

  const myIndex = useMemo(() => {
    if (!room || !session) return -1
    return room.players.indexOf(session.sessionId)
  }, [room, session])

  const peerName = useMemo(() => {
    if (!room || myIndex === -1) return 'Pasangan'
    const peerIndex = myIndex === 0 ? 1 : 0
    return room.playerNames?.[peerIndex] || `Player ${peerIndex + 1}`
  }, [room, myIndex])

  const myName = useMemo(() => {
    if (!room || myIndex === -1) return 'Kamu'
    return room.playerNames?.[myIndex] || `Player ${myIndex + 1}`
  }, [room, myIndex])

  const isFirstQuestion = (room?.usedQuestions.length ?? 0) === 0
  const currentQuestion = room?.lastQuestion || ''

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setTimer(30)
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearTimer()
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [clearTimer])

  const handleRandom = useCallback(() => {
    if (unusedQuestions.length === 0) return
    clearTimer()
    setUsedPickChance(false)
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length)
    const question = unusedQuestions[randomIndex]
    setSelectedQuestion(question)
    setLocalPhase('showing_question')
    setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 600)
  }, [unusedQuestions, clearTimer])

  // Auto random first question
  useEffect(() => {
    if (myTurn && isFirstQuestion && localPhase === 'waiting' && !firstAutoPickDone.current) {
      firstAutoPickDone.current = true
      const qs = getUnusedQuestions()
      if (qs.length > 0) {
        const randomQ = qs[Math.floor(Math.random() * qs.length)]
        setSelectedQuestion(randomQ)
        setUsedPickChance(false)
        setLocalPhase('showing_question')
        setShowAnimation(true)
        setTimeout(() => setShowAnimation(false), 600)
      }
    }
  }, [myTurn, isFirstQuestion, localPhase, getUnusedQuestions])

  // Watch turn/phase changes
  useEffect(() => {
    if (!room) return
    if (myTurn && localPhase === 'waiting') {
      setLocalPhase('choosing_mode')
      startTimer()
      setSelectedQuestion('')
      setAnswerText('')
      setShowPickList(false)
    } else if (myTurnToAnswer && localPhase === 'waiting') {
      setLocalPhase('answering')
      setAnswerText('')
    } else if (!myTurn && !myTurnToAnswer && localPhase !== 'waiting') {
      const timeout = setTimeout(() => setLocalPhase('waiting'), 500)
      return () => clearTimeout(timeout)
    }
  }, [myTurn, myTurnToAnswer, room?.currentTurn, room?.currentPhase])

  // Auto random on timer 0
  useEffect(() => {
    if (timer === 0 && localPhase === 'choosing_mode') {
      handleRandom()
    }
  }, [timer, localPhase, handleRandom])

  const confirmPick = useCallback((question: string) => {
    setSelectedQuestion(question)
    setUsedPickChance(true)
    setShowPickList(false)
    setLocalPhase('showing_question')
    setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 600)
  }, [])

  const sendQuestion = useCallback(async () => {
    if (!selectedQuestion) return
    await submitQuestion(selectedQuestion, usedPickChance)
    setUsedPickChance(false)
    setLocalPhase('sent')
    clearTimer()
    setTimeout(() => setLocalPhase('waiting'), 1500)
  }, [selectedQuestion, submitQuestion, usedPickChance, clearTimer])

  const handleAnswer = useCallback(async () => {
    if (!currentQuestion) return
    await submitAnswer(currentQuestion, answerText.trim() || '— Skipped —')
    setJustAnswered(true)
    setLocalPhase('sent')
    setTimeout(() => {
      setJustAnswered(false)
      setLocalPhase('waiting')
    }, 1500)
  }, [currentQuestion, answerText, submitAnswer])

  const handleSkip = useCallback(async () => {
    if (!currentQuestion) return
    await submitAnswer(currentQuestion, '— Skipped —')
    setJustAnswered(true)
    setLocalPhase('sent')
    setTimeout(() => {
      setJustAnswered(false)
      setLocalPhase('waiting')
    }, 1500)
  }, [currentQuestion, submitAnswer])

  if (!room || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-600 text-lg font-medium animate-pulse">Memuat game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col gap-3 p-4 py-6">
        {/* Progress bar */}
        <div className="glass-dark rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex justify-between text-xs text-gray-500 mb-2.5">
            <span className="font-medium">Progress</span>
            <span className="font-medium">{usedCount}/{totalQuestions} · Sisa {remainingCount}</span>
          </div>
          <div className="w-full h-2.5 bg-purple-100/50 rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-700 ease-out progress-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Player info */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-500 ${
              myTurn
                ? 'gradient-primary text-white shadow-md shadow-pink-200/50 animate-glow'
                : myTurnToAnswer
                  ? 'bg-green-50 text-green-700 border border-green-200/50'
                  : 'bg-white/50 text-gray-500 border border-gray-200/50'
            }`}
          >
            {myTurn
              ? '🎯 Giliran kamu bertanya'
              : myTurnToAnswer
                ? `✋ ${peerName} bertanya`
                : `⏳ Menunggu ${peerName}...`}
          </div>
          <div className="text-xs text-gray-400 bg-white/50 px-3 py-2 rounded-xl border border-gray-200/50 shadow-sm whitespace-nowrap">
            🎲 Pilih 5: <span className="font-bold text-purple-600">{pickChances}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          {/* CHOOSING MODE */}
          {myTurn && localPhase === 'choosing_mode' && !showPickList && (
            <div className="w-full max-w-sm text-center space-y-6 animate-fade-up">
              <div className="space-y-2">
                <div className="text-5xl animate-float">🎯</div>
                <h3 className="text-xl font-bold text-gray-800">
                  Giliranmu, {myName}!
                </h3>
                <p className="text-gray-500 text-sm">
                  Pilih cara melempar pertanyaan ke {peerName}
                </p>
              </div>

              {/* Timer ring */}
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#e9d5ff" strokeWidth="5" />
                    <circle
                      cx="36" cy="36" r="30" fill="none" stroke="url(#timerGrad)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${(timer / 30) * 188.5} 188.5`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${timer <= 5 ? 'text-rose-500' : 'text-purple-600'}`}>
                      {timer}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRandom}
                  disabled={loading}
                  className="w-full py-4 px-6 gradient-primary text-white rounded-2xl font-semibold text-lg shadow-lg shadow-pink-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 btn-shine cursor-pointer"
                >
                  🎲 Lempar Random
                </button>
                <button
                  onClick={() => {
                    if (pickChances <= 0) return
                    clearTimer()
                    const shuffled = [...unusedQuestions].sort(() => Math.random() - 0.5)
                    setPickOptions(shuffled.slice(0, Math.min(5, shuffled.length)))
                    setShowPickList(true)
                  }}
                  disabled={pickChances <= 0 || loading}
                  className="w-full py-4 px-6 bg-white/70 text-purple-700 rounded-2xl font-semibold text-lg border-2 border-purple-200/50 shadow-sm hover:shadow-lg hover:border-purple-300/70 hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 cursor-pointer"
                >
                  🎯 Pilih dari 5{' '}
                  <span className="text-sm font-normal text-gray-400">(sisa {pickChances})</span>
                </button>
              </div>
            </div>
          )}

          {/* PICK FROM 5 LIST */}
          {myTurn && showPickList && (
            <div className="w-full space-y-4 animate-fade-up">
              <div className="text-center space-y-2">
                <div className="text-4xl">🎯</div>
                <h3 className="text-lg font-bold text-gray-800">Pilih 1 pertanyaan</h3>
                <p className="text-xs text-gray-400">Sisa kesempatan Pilih 5: {pickChances - 1}</p>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {pickOptions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => confirmPick(q)}
                    disabled={loading}
                    className="w-full p-4 glass-dark rounded-xl text-left text-sm text-gray-700 hover:border-pink-300/50 hover:bg-pink-50/50 hover:shadow-lg transition-all duration-200 card-hover cursor-pointer disabled:opacity-50 animate-fade-in"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="font-bold text-pink-500 mr-2">#{i + 1}</span>
                    {q}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowPickList(false); startTimer() }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors mx-auto block underline cursor-pointer"
              >
                ← Kembali
              </button>
            </div>
          )}

          {/* SHOWING QUESTION */}
          {localPhase === 'showing_question' && selectedQuestion && (
            <div className="w-full max-w-sm text-center space-y-6 animate-scale-in">
              <div className={`transition-all duration-500 ${showAnimation ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>
                <div className="text-5xl mb-3">💌</div>
                <p className="text-gray-500 text-sm mb-3">
                  Pertanyaan untuk <strong className="text-purple-600">{peerName}</strong>:
                </p>
                <div className="glass-dark rounded-2xl p-6 shadow-lg border border-pink-200/30 animate-glow">
                  <p className="text-lg text-gray-800 font-medium leading-relaxed">
                    {selectedQuestion}
                  </p>
                </div>
              </div>
              <button
                onClick={sendQuestion}
                disabled={loading}
                className="py-3.5 px-10 gradient-rose text-white rounded-xl font-semibold shadow-lg shadow-rose-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 btn-shine cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </span>
                ) : '📤 Kirim Pertanyaan'}
              </button>
            </div>
          )}

          {/* ANSWERING MODE */}
          {myTurnToAnswer && localPhase === 'answering' && (
            <div className="w-full max-w-sm space-y-6 animate-fade-up">
              {justAnswered ? (
                <div className="text-center space-y-4 animate-scale-in">
                  <div className="text-6xl animate-heartbeat">✅</div>
                  <p className="text-green-600 font-semibold text-lg">Jawaban terkirim!</p>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-3">
                    <div className="text-4xl animate-float">💭</div>
                    <p className="text-gray-500 text-sm">
                      <strong className="text-purple-600">{peerName}</strong> bertanya:
                    </p>
                    <div className="glass-dark rounded-2xl p-6 shadow-lg border border-purple-100/50">
                      <p className="text-lg text-gray-800 font-medium leading-relaxed">
                        {currentQuestion}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Tulis jawabanmu di sini..."
                      rows={3}
                      className="w-full p-4 border border-purple-200/50 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none resize-none text-gray-700 bg-white/70 transition-all"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleAnswer}
                        disabled={loading || !answerText.trim()}
                        className="flex-1 py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all disabled:opacity-40 btn-shine cursor-pointer disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Mengirim...
                          </span>
                        ) : '💬 Kirim Jawaban'}
                      </button>
                      <button
                        onClick={handleSkip}
                        disabled={loading}
                        className="py-3.5 px-6 bg-gray-100/70 text-gray-500 rounded-xl font-medium hover:bg-gray-200/70 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        ⏭ Skip
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SENT CONFIRMATION */}
          {localPhase === 'sent' && !myTurnToAnswer && (
            <div className="text-center space-y-4 animate-scale-in">
              <div className="text-6xl animate-heartbeat">✉️</div>
              <p className="text-gray-700 font-semibold text-lg">Pertanyaan terkirim!</p>
              <p className="text-gray-400 text-sm">Menunggu {peerName} menjawab...</p>
            </div>
          )}

          {/* WAITING - game start */}
          {localPhase === 'waiting' && !myTurn && !myTurnToAnswer && !currentQuestion && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="text-6xl animate-float">🎮</div>
              <p className="text-gray-600 text-lg font-medium">Game akan segera dimulai!</p>
              <p className="text-gray-400 text-sm">{peerName} akan memulai dengan pertanyaan pertama</p>
            </div>
          )}

          {/* WAITING - other player's question */}
          {localPhase === 'waiting' && !myTurn && !myTurnToAnswer && currentQuestion && (
            <div className="w-full max-w-sm text-center space-y-4 animate-fade-in">
              <div className="animate-float text-4xl">💭</div>
              <p className="text-gray-500 text-sm">
                <strong className="text-purple-600">{peerName}</strong> sedang bertanya...
              </p>
              <div className="glass-dark rounded-2xl p-6 shadow-lg border border-purple-100/50">
                <p className="text-gray-400 text-xs mb-2">Pertanyaan dari {peerName}</p>
                <p className="text-lg text-gray-800 font-medium leading-relaxed">{currentQuestion}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                <span className="text-sm">Menunggu jawaban...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
