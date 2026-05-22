import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import ThemePicker from './components/ThemePicker'
import Home from './pages/Home'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import GameOver from './pages/GameOver'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <GameProvider>
          <div
            className="min-h-screen transition-colors duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--theme-bg-from), var(--theme-bg-via), var(--theme-bg-to))',
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateRoom />} />
              <Route path="/join" element={<JoinRoom />} />
              <Route path="/lobby/:roomId" element={<Lobby />} />
              <Route path="/game/:roomId" element={<Game />} />
              <Route path="/gameover/:roomId" element={<GameOver />} />
            </Routes>
            <ThemePicker />
          </div>
        </GameProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
