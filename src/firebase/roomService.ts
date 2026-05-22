import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDb } from './config'
import type { Room, PlayerIndex } from '../types'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}

function getRoomRef(roomId: string) {
  return doc(getDb(), 'rooms', roomId)
}

export async function createRoom(
  sessionId: string,
  questions: string[]
): Promise<string> {
  const roomCode = generateRoomCode()
  const roomId = roomCode.toLowerCase()

  const firstTurn = Math.random() < 0.5 ? 0 : 1

  const roomData: Room = {
    code: roomCode,
    questions,
    usedQuestions: [],
    answers: {},
    players: [sessionId, ''],
    ready: [false, false],
    status: 'waiting',
    currentTurn: firstTurn as PlayerIndex,
    currentPhase: 'asking',
    pickChances: {},
    lastQuestion: '',
    lastQuestionBy: '',
    lastAnswer: '',
    lastAnswerBy: '',
    lastAnswerFor: '',
    lastReaction: null,
    createdAt: serverTimestamp() as any,
    playerNames: ['Player 1', 'Player 2'],
  }

  await setDoc(getRoomRef(roomId), roomData)
  return roomId
}

export async function joinRoom(
  roomCode: string,
  sessionId: string
): Promise<{ roomId: string; room: Room } | { error: string }> {
  const roomId = roomCode.toLowerCase().trim()
  const roomRef = getRoomRef(roomId)
  const roomSnap = await getDoc(roomRef)

  if (!roomSnap.exists()) {
    return { error: 'Room tidak ditemukan. Periksa kode room.' }
  }

  const room = roomSnap.data() as Room

  if (room.status !== 'waiting') {
    return { error: 'Room sudah penuh atau sedang berlangsung.' }
  }

  if (room.players[0] === sessionId) {
    return { roomId, room }
  }

  if (room.players[1] && room.players[1] !== '') {
    return { error: 'Room sudah penuh.' }
  }

  const updatedPlayers: [string, string] = [room.players[0], sessionId]

  await updateDoc(roomRef, {
    players: updatedPlayers,
  })

  return {
    roomId,
    room: {
      ...room,
      players: updatedPlayers,
      status: 'playing',
      answers: room.answers || {},
    },
  }
}

export async function reconnectRoom(
  roomId: string,
  sessionId: string
): Promise<{ room: Room; playerIndex: PlayerIndex } | null> {
  const roomSnap = await getDoc(getRoomRef(roomId))
  if (!roomSnap.exists()) return null

  const room = roomSnap.data() as Room
  if (!room.players.includes(sessionId)) return null
  const playerIndex = room.players.indexOf(sessionId) as PlayerIndex

  return { room, playerIndex }
}

export async function askQuestion(
  roomId: string,
  question: string,
  sessionId: string
): Promise<void> {
  const roomRef = getRoomRef(roomId)
  const roomSnap = await getDoc(roomRef)
  const room = roomSnap.data() as Room

  if (!room.players.includes(sessionId)) throw new Error('Player not in room')

  const updates: Record<string, any> = {
    usedQuestions: arrayUnion(question),
    lastQuestion: question,
    lastQuestionBy: sessionId,
    currentPhase: 'answering',
  }

  await updateDoc(roomRef, updates)
}

export async function answerQuestion(
  roomId: string,
  question: string,
  answer: string,
  sessionId: string
): Promise<void> {
  const roomRef = getRoomRef(roomId)
  const roomSnap = await getDoc(roomRef)
  const room = roomSnap.data() as Room

  if (!room.players.includes(sessionId)) throw new Error('Player not in room')

  const playerIndex = room.players.indexOf(sessionId) as PlayerIndex

  const remainingQuestions = room.questions.filter(
    (q) => !room.usedQuestions.includes(q) && q !== question
  )

  const updates: Record<string, any> = {
    [`answers.${question}`]: answer,
    lastAnswer: answer,
    lastAnswerBy: sessionId,
    lastAnswerFor: question,
    currentPhase: 'asking',
    currentTurn: playerIndex,
  }

  if (remainingQuestions.length === 0) {
    updates.status = 'finished'
  }

  await updateDoc(roomRef, updates)
}

export async function toggleReady(
  roomId: string,
  sessionId: string
): Promise<void> {
  const roomRef = getRoomRef(roomId)
  const roomSnap = await getDoc(roomRef)
  const room = roomSnap.data() as Room

  const idx = room.players.indexOf(sessionId)
  if (idx === -1) throw new Error('Player not in room')

  const newReady: [boolean, boolean] = [...room.ready] as [boolean, boolean]
  newReady[idx] = !newReady[idx]

  const updates: Record<string, any> = { ready: newReady }

  if (newReady[0] && newReady[1]) {
    updates.status = 'playing'
  }

  await updateDoc(roomRef, updates)
}

export async function sendReaction(
  roomId: string,
  sessionId: string,
  emoji: string
): Promise<void> {
  const roomRef = getRoomRef(roomId)
  await updateDoc(roomRef, {
    lastReaction: { from: sessionId, emoji },
  })
}

export function subscribeRoom(
  roomId: string,
  callback: (room: Room) => void
): Unsubscribe {
  return onSnapshot(getRoomRef(roomId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as Room)
    }
  })
}
