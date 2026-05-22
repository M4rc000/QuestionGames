import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { isFirebaseConfigured, initFirebase } from './firebase/config'

if (isFirebaseConfigured()) {
  initFirebase()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
