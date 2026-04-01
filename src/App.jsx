import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Song from './pages/Song'
import NotFound from './pages/NotFound'
import './styles/app.css'
import './styles/home.css'
import './styles/components.css'
import './styles/song.css'

const THEME_KEY = 'musicscope_theme_pref'

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const themeLabel = useMemo(
    () => (theme === 'dark' ? 'Switch to light' : 'Switch to dark'),
    [theme],
  )

  return (
    <main className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-link" aria-label="MusicScope home">
          <p className="brand">MusicScope</p>
        </Link>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        >
          {themeLabel}
        </button>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/song/:spotifyId" element={<Song />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="app-footer">
        <p>
          Music metadata and previews are powered by{' '}
          <a href="https://open.spotify.com" target="_blank" rel="noreferrer">
            Spotify
          </a>
          .
        </p>
      </footer>
    </main>
  )
}

export default App
