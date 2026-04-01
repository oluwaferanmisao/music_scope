import { useNavigate } from 'react-router-dom'
import { formatDuration } from '../utils/music'

function SongCard({ track }) {
  const navigate = useNavigate()

  return (
    <article
      className="song-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/song/${track.id}`, { state: { track } })}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          navigate(`/song/${track.id}`, { state: { track } })
        }
      }}
      aria-label={`Open details for ${track.name} by ${track.artists?.[0]?.name}`}
    >
      <img
        src={track.album?.images?.[1]?.url || track.album?.images?.[0]?.url}
        alt={`${track.name} album cover`}
      />
      <div className="song-card-content">
        <h3>{track.name}</h3>
        <p>{track.artists?.map((artist) => artist.name).join(', ')}</p>
        <span>{formatDuration(track.duration_ms)}</span>
      </div>
    </article>
  )
}

export default SongCard
