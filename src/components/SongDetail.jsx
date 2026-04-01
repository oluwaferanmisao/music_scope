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
        <div>
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

      <section className="detail-section">
        <h2>Music Preview</h2>
        {credits?.preview?.url ? (
          <p className="preview-note">
            <a
              href={credits.preview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="artist-link"
            >
              Open preview on {credits.preview.provider}
            </a>
          </p>
        ) : (
          <p className="audio-unavailable">Preview unavailable for this track from Genius and Deezer.</p>
        )}
      </section>
    </article>
  )
}

export default SongDetail
