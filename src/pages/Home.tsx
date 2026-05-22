import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useGame } from '../context/GameContext'

function HeartsBg() {
  const hearts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${12 + Math.random() * 8}s`,
    size: `${14 + Math.random() * 16}px`,
  }))

  return (
    <div className="hearts-bg">
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            fontSize: h.size,
          }}
        >
          {['❤️', '💕', '💗', '💖', '💝'][h.id % 5]}
        </span>
      ))}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { session, reconnectToRoom } = useGame()

  useEffect(() => {
    if (session?.roomId) {
      reconnectToRoom()
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <HeartsBg />

      <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-fade-up">
        <div className="space-y-4">
          <div className="text-7xl animate-heartbeat">💌</div>
          <h1 className="text-5xl font-bold">
            <span className="text-gradient">QuestionGame</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-xs mx-auto">
            Game tanya-jawab untuk pasangan.
            <br />
            Kenali pasanganmu lebih dalam!
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={() => navigate('/create')}
            className="group w-full py-4 px-6 gradient-primary text-white rounded-2xl font-semibold text-lg shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/40 hover:scale-[1.02] transition-all duration-300 btn-shine cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl">✨</span>
              Buat Room Baru
            </span>
          </button>
          <button
            onClick={() => navigate('/join')}
            className="group w-full py-4 px-6 glass-dark text-purple-700 rounded-2xl font-semibold text-lg border-2 border-purple-200/50 shadow-sm hover:shadow-lg hover:border-purple-300/70 hover:scale-[1.02] transition-all duration-300 card-hover cursor-pointer"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🔑</span>
              Join Room
            </span>
          </button>
        </div>

        <p className="text-xs text-gray-400/70 pt-8">
          Dibuat dengan <span className="text-pink-400">❤️</span> untuk pasangan
        </p>
      </div>
    </div>
  )
}
