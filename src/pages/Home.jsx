import { useCallback, useState } from 'react'
import SearchBar from '../components/SearchBar'
import SongCard from '../components/SongCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { searchSpotifyTracks } from '../api/spotify'

function Home() {
  const [tracks, setTracks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleQueryChange = useCallback(async (rawQuery) => {
    const query = rawQuery.trim()

    if (!query) {
      setTracks([])
      setErrorMessage('')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')
      const nextTracks = await searchSpotifyTracks(query)
      setTracks(nextTracks)
    } catch (error) {
      setTracks([])
      setErrorMessage(
        error?.response?.data?.error?.message ||
          error?.message ||
          'Unable to search tracks right now.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <section className="home-page fade-in">
      <header className="hero-panel">
        <p className="eyebrow">Music discovery</p>
        <h1>MusicScope</h1>
        <p>
          Search any song and inspect Spotify track metadata with available
          writing and production credits.
        </p>
      </header>

      <SearchBar onQueryChange={handleQueryChange} isLoading={isLoading} />

      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}

      {isLoading ? <LoadingSkeleton /> : null}

      {!isLoading && !errorMessage && tracks.length > 0 ? (
        <section className="results-grid" aria-live="polite">
          {tracks.map((track) => (
            <SongCard key={track.id} track={track} />
          ))}
        </section>
      ) : null}

      {!isLoading && !errorMessage && tracks.length === 0 ? (
        <p className="empty-state">No songs yet. Start typing above.</p>
      ) : null}
    </section>
  )
}

export default Home
