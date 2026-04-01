import { useRef, useState } from 'react'
import { Play, Pause, ExternalLink } from 'lucide-react'
import { formatMusicalKey, formatTimeSignature, normalizeEnergy } from '../utils/music'

function MetricBar({ label, value, max = 100, unit = '' }) {
  const hasValue = typeof value === 'number' && Number.isFinite(value)
  const percentage = hasValue
    ? Math.min(100, Math.round((Math.max(0, value) / max) * 100))
    : 0

  return (
    <div className="metric-bar">
      <div className="metric-head">
        <span>{label}</span>
        <strong>
          {hasValue ? `${value}${unit}` : 'N/A'}
        </strong>
      </div>
      <div className="meter-track">
        <div
          className={`meter-fill ${hasValue ? '' : 'meter-fill-empty'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function CreditsGroup({ title, values }) {
  return (
    <div className="credits-group">
      <h4>{title}</h4>
      {values?.length ? (
        <p>
          {values.map((item, idx) => {
            const isObject = typeof item === 'object'
            const name = isObject ? item.name : item
            const url = isObject ? item.url : null

            return (
              <span key={idx}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="artist-link">
                    {name}
                  </a>
                ) : (
                  name
                )}
                {idx < values.length - 1 ? ', ' : ''}
              </span>
            )
          })}
        </p>
      ) : (
        <p>Credits unavailable</p>
      )}
    </div>
  )
}

function isDirectAudioUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  return /(\.mp3|\.m4a|\.ogg|\.wav)(\?|$)/i.test(url) || url.includes('dzcdn.net')
}

function PreviewPlayer({ preview }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const canPlayInline = isDirectAudioUrl(preview?.url)

  async function handleTogglePreview() {
    if (!audioRef.current) {
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  if (!preview?.url) {
    return (
      <button type="button" className="preview-button" disabled title="Preview unavailable" aria-label="Preview unavailable">
        <Pause size={20} />
      </button>
    )
  }

  if (!canPlayInline) {
    return (
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="preview-button-link"
        title="Open preview"
        aria-label="Open preview"
      >
        <ExternalLink size={20} />
      </a>
    )
  }

  return (
    <div className="preview-inline">
      <audio
        ref={audioRef}
        src={preview.url}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        className="preview-button"
        onClick={handleTogglePreview}
        title={isPlaying ? 'Pause preview' : 'Play preview'}
        aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      {isPlaying ? (
        <div className="waveform" aria-hidden="true">
          <span style={{ animationDelay: '0ms' }} />
          <span style={{ animationDelay: '70ms' }} />
          <span style={{ animationDelay: '140ms' }} />
          <span style={{ animationDelay: '210ms' }} />
          <span style={{ animationDelay: '280ms' }} />
        </div>
      ) : null}
    </div>
  )
}

function SongDetail({ track, audioFeatures, credits }) {
  const hasAudioFeatures = Boolean(audioFeatures)
  const energy = typeof audioFeatures?.energy === 'number'
    ? normalizeEnergy(audioFeatures?.energy)
    : null
  const bpm = typeof audioFeatures?.tempo === 'number'
    ? Math.round(audioFeatures?.tempo)
    : null
  const loudness = typeof audioFeatures?.loudness === 'number'
    ? Math.round(Math.abs(audioFeatures?.loudness))
    : null

  return (
    <article className="song-detail">
      <header className="song-detail-header">
        <img
          src={track.album?.images?.[0]?.url}
          alt={`${track.name} cover art`}
          className="song-detail-cover"
        />
        <div className="song-detail-meta">
          <div className="song-detail-info">
            <p className="eyebrow">Now inspecting</p>
            <h1>{track.name}</h1>
            <p>
              {track.artists?.map((artist, idx) => (
                <span key={artist.id || idx}>
                  <a
                    href={artist.external_urls?.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="artist-link"
                  >
                    {artist.name}
                  </a>
                  {idx < track.artists.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <div className="badge-row">
              <span className="badge">{formatMusicalKey(audioFeatures?.key, audioFeatures?.mode)}</span>
              <span className="badge">{formatTimeSignature(audioFeatures?.time_signature)}</span>
            </div>
          </div>
          <div className="song-preview-action">
            <PreviewPlayer preview={credits?.preview} />
          </div>
        </div>
      </header>

      <section className="detail-section">
        <h2>Audio Profile</h2>
        {hasAudioFeatures ? (
          <>
            <MetricBar label="BPM" value={bpm} max={220} />
            <MetricBar label="Energy" value={energy} unit="%" />
            <MetricBar label="Loudness" value={loudness} max={60} unit=" dB" />
            <p className="audio-source-note">
              Audio metrics are sourced from Deezer fallback data. Key and time signature are not
              provided by this source, and energy is an estimate.
            </p>
          </>
        ) : (
          <p className="audio-unavailable">
            Audio analysis data is currently unavailable for this track.
          </p>
        )}
      </section>

      <section className="detail-section">
        <h2>Credits</h2>
        <div className="credits-layout">
          <CreditsGroup title="Writers" values={credits?.writers} />
          <CreditsGroup title="Producers" values={credits?.producers} />
          <CreditsGroup
            title="Distribution Company"
            values={credits?.distributionCompany ? [credits.distributionCompany] : []}
          />
        </div>
      </section>

    </article>
  )
}

export default SongDetail
