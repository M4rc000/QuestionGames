import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function JoinRoom() {
  const navigate = useNavigate()
  const { joinExistingRoom, loading, error, clearError } = useGame()
  const [code, setCode] = useState('')

  async function handleJoin() {
    const roomCode = code.trim().toUpperCase()
    if (roomCode.length < 4) {
      alert('Masukkan kode room yang valid.')
      return
    }
    const roomId = await joinExistingRoom(roomCode)
    if (roomId) {
      navigate(`/lobby/${roomId}`)
    }
  }

  function handleCodeChange(value: string) {
    setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-md w-full space-y-6 animate-fade-up">
        <button
          onClick={() => navigate('/')}
          className="text-purple-500 hover:text-purple-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="glass-dark rounded-2xl p-8 shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="text-5xl animate-float">🔑</div>
            <h2 className="text-2xl font-bold text-gray-800">Join Room</h2>
            <p className="text-gray-500 text-sm">
              Masukkan kode room yang diberikan pasanganmu
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 text-center">
              Kode Room
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="CONTOH: ABC123"
              maxLength={6}
              className="w-full p-5 text-center text-3xl font-mono font-bold tracking-[0.4em] border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none text-purple-700 uppercase bg-white/50 transition-all"
              autoFocus
            />
            <p className="text-xs text-gray-400 text-center">
              {code.length}/6 karakter
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center animate-scale-in">
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={code.length < 4 || loading}
            className="w-full py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-shine"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Bergabung...
              </span>
            ) : (
              '🚪 Join Room'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
