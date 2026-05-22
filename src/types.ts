export type PlayerIndex = 0 | 1
export type RoomStatus = 'waiting' | 'playing' | 'finished'
export type GamePhase = 'asking' | 'answering'

export interface Room {
  code: string
  questions: string[]
  usedQuestions: string[]
  answers: Record<string, string>
  players: string[]
  ready: [boolean, boolean]
  status: RoomStatus
  currentTurn: PlayerIndex
  currentPhase: GamePhase
  pickChances: Record<string, number>
  lastQuestion: string
  lastQuestionBy: string
  lastAnswer: string
  lastAnswerBy: string
  lastAnswerFor: string
  lastReaction: { from: string; emoji: string } | null
  createdAt: any
  playerNames: [string, string]
}

export interface LocalSession {
  sessionId: string
  roomId: string
  playerIndex: PlayerIndex
}

export interface Theme {
  id: string
  name: string
  primary: string
  primaryDark: string
  secondary: string
  secondaryDark: string
  accent: string
  gradient: string
  gradientRev: string
  bgFrom: string
  bgVia: string
  bgTo: string
  icon: string
}

export const themes: Theme[] = [
  {
    id: 'romantic',
    name: 'Romantic',
    primary: '#ec4899',
    primaryDark: '#db2777',
    secondary: '#8b5cf6',
    secondaryDark: '#7c3aed',
    accent: '#f472b6',
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    gradientRev: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    bgFrom: '#fdf2f8',
    bgVia: '#ffffff',
    bgTo: '#f3e8ff',
    icon: '💗',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    primary: '#f43f5e',
    primaryDark: '#e11d48',
    secondary: '#f59e0b',
    secondaryDark: '#d97706',
    accent: '#fb923c',
    gradient: 'linear-gradient(135deg, #f43f5e, #f59e0b)',
    gradientRev: 'linear-gradient(135deg, #f59e0b, #f43f5e)',
    bgFrom: '#fff1f2',
    bgVia: '#ffffff',
    bgTo: '#fef3c7',
    icon: '🌹',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    primary: '#06b6d4',
    primaryDark: '#0891b2',
    secondary: '#3b82f6',
    secondaryDark: '#2563eb',
    accent: '#22d3ee',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    gradientRev: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    bgFrom: '#ecfeff',
    bgVia: '#ffffff',
    bgTo: '#dbeafe',
    icon: '🌊',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: '#f97316',
    primaryDark: '#ea580c',
    secondary: '#eab308',
    secondaryDark: '#ca8a04',
    accent: '#fb923c',
    gradient: 'linear-gradient(135deg, #f97316, #eab308)',
    gradientRev: 'linear-gradient(135deg, #eab308, #f97316)',
    bgFrom: '#fff7ed',
    bgVia: '#ffffff',
    bgTo: '#fefce8',
    icon: '🌅',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '#10b981',
    primaryDark: '#059669',
    secondary: '#14b8a6',
    secondaryDark: '#0d9488',
    accent: '#34d399',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    gradientRev: 'linear-gradient(135deg, #14b8a6, #10b981)',
    bgFrom: '#ecfdf5',
    bgVia: '#ffffff',
    bgTo: '#f0fdfa',
    icon: '🌿',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    secondary: '#a855f7',
    secondaryDark: '#9333ea',
    accent: '#818cf8',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    gradientRev: 'linear-gradient(135deg, #a855f7, #6366f1)',
    bgFrom: '#eef2ff',
    bgVia: '#ffffff',
    bgTo: '#f3e8ff',
    icon: '🌙',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    primary: '#6b7280',
    primaryDark: '#4b5563',
    secondary: '#9ca3af',
    secondaryDark: '#6b7280',
    accent: '#9ca3af',
    gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
    gradientRev: 'linear-gradient(135deg, #9ca3af, #6b7280)',
    bgFrom: '#f9fafb',
    bgVia: '#ffffff',
    bgTo: '#f3f4f6',
    icon: '⚪',
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    primary: '#f43f5e',
    primaryDark: '#e11d48',
    secondary: '#d946ef',
    secondaryDark: '#c026d3',
    accent: '#f472b6',
    gradient: 'linear-gradient(135deg, #f43f5e, #d946ef)',
    gradientRev: 'linear-gradient(135deg, #d946ef, #f43f5e)',
    bgFrom: '#fdf2f8',
    bgVia: '#ffffff',
    bgTo: '#fae8ff',
    icon: '🌸',
  },
]
