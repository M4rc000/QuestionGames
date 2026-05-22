import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore'
import {
  getAuth,
  signInAnonymously,
  connectAuthEmulator,
  type Auth,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key'

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let initialized = false

export function isFirebaseConfigured(): boolean {
  return hasFirebaseConfig
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (!hasFirebaseConfig) {
      throw new Error(
        'Firebase belum dikonfigurasi. Salin .env.example ke .env dan isi dengan credentials Firebase Anda.'
      )
    }
    app = initializeApp(firebaseConfig)
  }
  return app
}

export function getDb(): Firestore {
  if (!db) {
    if (!hasFirebaseConfig) {
      throw new Error(
        'Firebase belum dikonfigurasi. Salin .env.example ke .env dan isi dengan credentials Firebase Anda.'
      )
    }
    db = getFirestore(getFirebaseApp())
  }
  return db
}

function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

/** Panggil sekali di awal app sebelum operasi Firestore */
export async function initFirebase(): Promise<void> {
  if (initialized || !hasFirebaseConfig) return

  try {
    const authInstance = getAuthInstance()
    if (!authInstance.currentUser) {
      await signInAnonymously(authInstance)
    }
  } catch (e) {
    console.warn('Anonymous auth gagal:', e)
  }
  initialized = true
}

export { connectFirestoreEmulator, connectAuthEmulator }
