import { doc, updateDoc } from 'firebase/firestore'
import { getDb } from '../firebase/config'
import {
  generateSessionId,
  createRoom,
  joinRoom,
  reconnectRoom,
  askQuestion,
  answerQuestion,
  toggleReady as toggleReadyService,
  subscribeRoom,
} from '../firebase/roomService'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Room, LocalSession, PlayerIndex } from '../types'

interface GameContextType {
  session: LocalSession | null
  room: Room | null
  loading: boolean
  error: string | null
  createNewRoom: (questions: string[]) => Promise<string | null>
  joinExistingRoom: (code: string) => Promise<string | null>
  submitQuestion: (question: string, usedPickChance: boolean) => Promise<void>
  submitAnswer: (question: string, answer: string) => Promise<void>
  getMyPickChances: () => number
  isMyTurn: () => boolean
  isMyTurnToAnswer: () => boolean
  getUnusedQuestions: () => string[]
  setPlayerName: (name: string) => Promise<void>
  toggleReady: () => Promise<void>
  reconnectToRoom: () => Promise<void>
  clearError: () => void
}

const GameContext = createContext<GameContextType | null>(null)

function getStoredSession(): LocalSession | null {
  try {
    const stored = localStorage.getItem('qg_session')
    if (stored) return JSON.parse(stored)
  } catch {}
  return null
}

function storeSession(session: LocalSession) {
  localStorage.setItem('qg_session', JSON.stringify(session))
}

function clearStoredSession() {
  localStorage.removeItem('qg_session')
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(getStoredSession)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      const newSessionId = generateSessionId()
      const newSession: LocalSession = {
        sessionId: newSessionId,
        roomId: '',
        playerIndex: 0 as PlayerIndex,
      }
      setSession(newSession)
      storeSession(newSession)
    }
  }, [])

  useEffect(() => {
    if (!session?.roomId) return

    const unsub = subscribeRoom(session.roomId, (updatedRoom) => {
      setRoom(updatedRoom)
    })

    return () => unsub()
  }, [session?.roomId])

  const createNewRoom = useCallback(
    async (questions: string[]): Promise<string | null> => {
      setLoading(true)
      setError(null)
      try {
        if (!session) throw new Error('Session not initialized')

        const roomId = await createRoom(session.sessionId, questions)
        const newSession: LocalSession = {
          ...session,
          roomId,
          playerIndex: 0,
        }
        setSession(newSession)
        storeSession(newSession)
        return roomId
      } catch (e: any) {
        setError(e.message || 'Gagal membuat room')
        return null
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const joinExistingRoom = useCallback(
    async (code: string): Promise<string | null> => {
      setLoading(true)
      setError(null)
      try {
        if (!session) throw new Error('Session not initialized')

        const result = await joinRoom(code, session.sessionId)
        if ('error' in result) {
          setError(result.error)
          return null
        }

        const playerIndex = (result.room.players.indexOf(
          session.sessionId
        ) === -1
          ? 1
          : result.room.players.indexOf(session.sessionId)) as PlayerIndex

        const newSession: LocalSession = {
          ...session,
          roomId: result.roomId,
          playerIndex,
        }
        setSession(newSession)
        storeSession(newSession)
        return result.roomId
      } catch (e: any) {
        setError(e.message || 'Gagal join room')
        return null
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const submitQuestion = useCallback(
    async (question: string, usedPickChance: boolean) => {
      if (!session?.roomId) return
      setLoading(true)
      try {
        await askQuestion(
          session.roomId,
          question,
          session.sessionId,
          usedPickChance
        )
      } catch (e: any) {
        setError(e.message || 'Gagal mengirim pertanyaan')
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const submitAnswer = useCallback(
    async (question: string, answer: string) => {
      if (!session?.roomId) return
      setLoading(true)
      try {
        await answerQuestion(
          session.roomId,
          question,
          answer,
          session.sessionId
        )
      } catch (e: any) {
        setError(e.message || 'Gagal mengirim jawaban')
      } finally {
        setLoading(false)
      }
    },
    [session]
  )

  const getMyPickChances = useCallback((): number => {
    if (!session || !room) return 0
    return room.pickChances?.[session.sessionId] ?? 0
  }, [session, room])

  const isMyTurn = useCallback((): boolean => {
    if (!session || !room) return false
    if (room.status !== 'playing') return false
    return (
      room.currentPhase === 'asking' &&
      room.players[room.currentTurn] === session.sessionId
    )
  }, [session, room])

  const isMyTurnToAnswer = useCallback((): boolean => {
    if (!session || !room) return false
    if (room.status !== 'playing') return false
    return (
      room.currentPhase === 'answering' &&
      room.players[room.currentTurn] !== session.sessionId
    )
  }, [session, room])

  const getUnusedQuestions = useCallback((): string[] => {
    if (!room) return []
    return room.questions.filter((q) => !room.usedQuestions.includes(q))
  }, [room])

  const setPlayerName = useCallback(
    async (name: string) => {
      if (!session?.roomId || !room) return
      try {
        const ref = doc(getDb(), 'rooms', session.roomId)
        await updateDoc(ref, {
          [`playerNames.${session.playerIndex}`]: name,
        })
      } catch (e: any) {
        console.error('Failed to set player name:', e)
      }
    },
    [session, room]
  )

  const reconnectToRoom = useCallback(async () => {
    if (!session?.roomId) return
    setLoading(true)
    try {
      const result = await reconnectRoom(session.roomId, session.sessionId)
      if (result) {
        setRoom(result.room)
        const newSession: LocalSession = {
          ...session,
          playerIndex: result.playerIndex,
        }
        setSession(newSession)
        storeSession(newSession)
      } else {
        clearStoredSession()
        setSession(null)
        setError('Sesi tidak valid. Silakan buat atau join room baru.')
      }
    } catch (e: any) {
      setError(e.message || 'Gagal reconnect')
    } finally {
      setLoading(false)
    }
  }, [session])

  const toggleReady = useCallback(async () => {
    if (!session?.roomId) return
    setLoading(true)
    try {
      await toggleReadyService(session.roomId, session.sessionId)
    } catch (e: any) {
      setError(e.message || 'Gagal toggle ready')
    } finally {
      setLoading(false)
    }
  }, [session])

  const clearError = useCallback(() => setError(null), [])

  return (
    <GameContext.Provider
      value={{
        session,
        room,
        loading,
        error,
        createNewRoom,
        joinExistingRoom,
        submitQuestion,
        submitAnswer,
        getMyPickChances,
        isMyTurn,
        isMyTurnToAnswer,
        getUnusedQuestions,
        setPlayerName,
        toggleReady,
        reconnectToRoom,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextType {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
