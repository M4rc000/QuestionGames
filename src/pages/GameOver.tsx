import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function GameOver() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { room, reconnectToRoom } = useGame()

  useEffect(() => {
    if (roomId) reconnectToRoom()
  }, [roomId])

  const allQuestions = room?.questions || []
  const usedQuestions = room?.usedQuestions || []
  const answers = room?.answers || {}

  const usedCount = usedQuestions.length
  const answeredCount = Object.keys(answers).length
  const skippedCount = Object.values(answers).filter((a) => a === '— Skipped —').length

  const questionsWithAnswers = useMemo(() => {
    return allQuestions.map((q) => ({
      question: q,
      asked: usedQuestions.includes(q),
      answer: answers[q] || null,
    }))
  }, [allQuestions, usedQuestions, answers])

  const player1Name = room?.playerNames?.[0] || 'Player 1'
  const player2Name = room?.playerNames?.[1] || 'Player 2'

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-600 text-lg font-medium animate-pulse">Memuat hasil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-lg w-full mx-auto space-y-6 py-8 px-4">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-up">
          <div className="text-7xl animate-heartbeat">🎉</div>
          <h1 className="text-4xl font-bold">
            <span className="text-gradient">Game Selesai!</span>
          </h1>
          <p className="text-gray-500">
            Semua {allQuestions.length} pertanyaan telah ditanyakan!
          </p>
        </div>

        {/* Stats */}
        <div className="glass-dark rounded-2xl p-6 shadow-lg animate-scale-in space-y-4">
          <h2 className="font-semibold text-gray-700 text-center flex items-center justify-center gap-2">
            <span>📊</span> Statistik Game
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-gradient-to-b from-pink-50 to-pink-100/50 rounded-xl text-center card-hover border border-pink-200/30">
              <p className="text-2xl font-bold text-pink-600">{usedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Ditanyakan</p>
            </div>
            <div className="p-4 bg-gradient-to-b from-purple-50 to-purple-100/50 rounded-xl text-center card-hover border border-purple-200/30">
              <p className="text-2xl font-bold text-purple-600">{answeredCount}</p>
              <p className="text-xs text-gray-500 mt-1">Dijawab</p>
            </div>
            <div className="p-4 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-xl text-center card-hover border border-gray-200/30">
              <p className="text-2xl font-bold text-gray-600">{skippedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Skipped</p>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 px-2 pt-1 border-t border-purple-100/50">
            <span className="flex items-center gap-1">❤️ {player1Name}</span>
            <span className="flex items-center gap-1">💜 {player2Name}</span>
          </div>
        </div>

        {/* Question & Answer history */}
        <div className="glass-dark rounded-2xl p-6 shadow-lg animate-fade-up space-y-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <span>📝</span> Riwayat Pertanyaan & Jawaban
          </h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {questionsWithAnswers.map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl text-sm transition-all duration-300 card-hover animate-fade-in ${
                  item.asked
                    ? 'bg-gradient-to-br from-pink-50/80 to-purple-50/80 border border-purple-100/30'
                    : 'bg-gray-50/50 border border-gray-100/30 opacity-50'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`font-bold min-w-8 text-lg ${
                      item.asked ? 'text-gradient' : 'text-gray-400'
                    }`}
                  >
                    Q{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={item.asked ? 'text-gray-800' : 'text-gray-400'}>
                      {item.question}
                    </p>
                    {item.asked && (
                      <div className="mt-2.5 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-100/50">
                        <span className="text-xs text-gray-400 font-medium">Jawaban: </span>
                        <span
                          className={`${
                            item.answer === '— Skipped —'
                              ? 'text-gray-400 italic'
                              : 'text-gray-700 font-medium'
                          }`}
                        >
                          {item.answer || '— Belum dijawab —'}
                        </span>
                      </div>
                    )}
                    {!item.asked && (
                      <p className="text-xs text-gray-400 mt-1 italic">— Tidak ditanyakan —</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-fade-up">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 btn-shine cursor-pointer"
          >
            🏠 Kembali ke Beranda
          </button>
        </div>

        <p className="text-center text-xs text-gray-400/70 pb-8">
          Semoga makin dekat dan makin sayang ❤️
        </p>
      </div>
    </div>
  )
}
