import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function Lobby() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { room, session, reconnectToRoom, setPlayerName } = useGame()
  const [nameInput, setNameInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  useEffect(() => {
    if (roomId) reconnectToRoom()
  }, [roomId])

  const isCreator = session?.sessionId === room?.players?.[0]
  const myIndex = isCreator ? 0 : 1
  const myCurrentName = room?.playerNames?.[myIndex]

  // If name already exists in Firestore, mark as saved
  useEffect(() => {
    if (myCurrentName && myCurrentName !== `Player ${myIndex + 1}` && !nameSaved) {
      setNameSaved(true)
      setNameInput(myCurrentName)
    }
  }, [myCurrentName, myIndex, nameSaved])

  const saveName = useCallback(() => {
    if (nameInput.trim() && !nameSaved) {
      setPlayerName(nameInput.trim())
      setNameSaved(true)
    }
  }, [nameInput, setPlayerName, nameSaved])

  useEffect(() => {
    if (room?.status === 'playing' && room.players[0] && room.players[1]) {
      const timer = setTimeout(() => {
        navigate(`/game/${roomId}`)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [room?.status, room?.players, roomId, navigate])

  async function copyCode() {
    if (!room?.code) return
    try {
      await navigator.clipboard.writeText(room.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = room.code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-600 text-lg font-medium animate-pulse">
            Memuat room...
          </p>
        </div>
      </div>
    )
  }

  const bothJoined = room.players[0] && room.players[1]
  const player1Name = room.playerNames?.[0] || 'Player 1'
  const player2Name = room.playerNames?.[1] || 'Player 2'

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

        <div className="text-center space-y-3">
          <div className="text-5xl animate-float">🎮</div>
          <h2 className="text-2xl font-bold text-gray-800">Room Siap!</h2>
          <p className="text-gray-500 text-sm">
            Bagikan kode ini ke pasanganmu:
          </p>
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border-2 border-pink-200 shadow-lg animate-glow">
            <span className="text-3xl font-mono font-bold tracking-[0.3em] text-purple-700 select-all">
              {room.code}
            </span>
            <button
              onClick={copyCode}
              className="p-2.5 hover:bg-pink-50 rounded-xl transition-all cursor-pointer active:scale-95"
              title="Salin kode"
            >
              {copied ? (
                <span className="text-green-500 text-lg font-bold">✓</span>
              ) : (
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-500 text-sm animate-scale-in">✓ Kode berhasil disalin!</p>
          )}
        </div>

        {/* Player cards */}
        <div className="glass-dark rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span>👥</span> Pemain di Room
          </h3>

          <div className="space-y-3">
            {/* Player 1 */}
            <div
              className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-500 ${
                room.players[0]
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200/50'
                  : 'bg-gray-50/50 border border-dashed border-gray-200'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 ${
                  room.players[0]
                    ? 'gradient-primary'
                    : 'bg-gray-300'
                }`}
              >
                {isCreator ? 'K' : 'P1'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {isCreator
                    ? nameSaved
                      ? nameInput
                      : 'Kamu (Host)'
                    : player1Name}
                </p>
                <p className="text-xs text-green-600">
                  {room.players[0] ? '✓ Sudah join' : '⏳ Menunggu...'}
                </p>
              </div>
              {isCreator && nameSaved && (
                <span className="text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-medium">
                  Host
                </span>
              )}
            </div>

            {/* Player 2 */}
            <div
              className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-500 ${
                room.players[1]
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200/50'
                  : 'bg-gray-50/50 border border-dashed border-gray-200'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 ${
                  room.players[1]
                    ? 'gradient-rose'
                    : 'bg-gray-300'
                }`}
              >
                {!isCreator ? 'K' : 'P2'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {!isCreator
                    ? nameSaved
                      ? nameInput
                      : 'Kamu'
                    : player2Name || 'Pasangan'}
                </p>
                <p className="text-xs text-green-600">
                  {room.players[1] ? '✓ Sudah join' : '⏳ Menunggu...'}
                </p>
              </div>
              {!isCreator && nameSaved && (
                <span className="text-xs bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full font-medium">
                  Kamu
                </span>
              )}
            </div>
          </div>

          {/* Name input - only show if name not saved */}
          {!nameSaved && (
            <div className="pt-2 space-y-2 animate-fade-up">
              <p className="text-xs text-gray-400">Setel nama panggilan (sekali saja):</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nama kamu..."
                  maxLength={20}
                  className="flex-1 p-3 border border-purple-200/50 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none text-gray-700 bg-white/50 transition-all"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  disabled={!nameInput.trim()}
                  className="px-5 gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-shine shrink-0"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}

          {nameSaved && (
            <div className="pt-1 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <span>✓</span> Nama tersimpan sebagai <strong>{nameInput}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        {!bothJoined && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-purple-500">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
              <span className="font-medium">Menunggu pasangan join...</span>
            </div>
            <p className="text-xs text-gray-400">
              Refresh halaman jika sudah menunggu lama
            </p>
          </div>
        )}

        {bothJoined && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-6 py-3 rounded-2xl border border-green-200">
              <span className="text-xl">✨</span>
              Kedua pemain sudah siap! Mengarahkan ke game...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
