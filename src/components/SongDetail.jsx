import { formatMusicalKey, formatTimeSignature, normalizeEnergy } from '../utils/music'

function MetricBar({ label, value, max = 100, unit = '' }) {
  const percentage = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="metric-bar">
      <div className="metric-head">
        <span>{label}</span>
        <strong>
          {value}
          {unit}
        </strong>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function CreditsGroup({ title, values }) {
  return (
    <div className="credits-group">
      <h4>{title}</h4>
      {values?.length ? <p>{values.join(', ')}</p> : <p>Credits unavailable</p>}
    </div>
  )
}

function SongDetail({ track, audioFeatures, credits }) {
  const hasAudioFeatures = Boolean(audioFeatures)
  const energy = normalizeEnergy(audioFeatures?.energy)
  const bpm = Math.round(audioFeatures?.tempo ?? 0)
  const loudness = Math.round(audioFeatures?.loudness ?? 0)

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
          <p>{track.artists?.map((artist) => artist.name).join(', ')}</p>
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
            <MetricBar label="Loudness" value={Math.abs(loudness)} max={60} unit=" dB" />
          </>
        ) : (
          <p className="audio-unavailable">
            BPM, key, time signature, energy, and loudness are unavailable because Spotify marks
            the audio-features endpoints as deprecated in the current OpenAPI schema.
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
