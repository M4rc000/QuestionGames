export type PlayerIndex = 0 | 1
export type RoomStatus = 'waiting' | 'playing' | 'finished'
export type GamePhase = 'asking' | 'answering'

export interface Room {
  code: string
  questions: string[]
  usedQuestions: string[]
  answers: Record<string, string>
  players: string[]
  status: RoomStatus
  currentTurn: PlayerIndex
  currentPhase: GamePhase
  pickChances: Record<string, number>
  lastQuestion: string
  lastQuestionBy: string
  createdAt: any
  playerNames: [string, string]
}

export interface LocalSession {
  sessionId: string
  roomId: string
  playerIndex: PlayerIndex
}
