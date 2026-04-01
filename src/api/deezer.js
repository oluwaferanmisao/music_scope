import axios from 'axios'

const deezerApiBase = '/api/deezer'

function normalize(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreMatch(result, trackName, artistName) {
  const title = normalize(result?.title)
  const artist = normalize(result?.artist?.name)
  const wantedTitle = normalize(trackName)
  const wantedArtist = normalize(artistName)

  let score = 0

  if (title === wantedTitle) {
    score += 3
  } else if (title.includes(wantedTitle) || wantedTitle.includes(title)) {
    score += 2
  }

  if (artist === wantedArtist) {
    score += 3
  } else if (artist.includes(wantedArtist) || wantedArtist.includes(artist)) {
    score += 2
  }

  score += Number(result?.rank || 0) / 1_000_000

  return score
}

function estimateEnergy(tempo, loudness) {
  if (typeof tempo !== 'number' || typeof loudness !== 'number') {
    return null
  }

  const tempoScore = Math.min(1, Math.max(0, tempo / 180))
  const loudnessScore = Math.min(1, Math.max(0, (loudness + 60) / 60))

  return Number((tempoScore * 0.6 + loudnessScore * 0.4).toFixed(3))
}

function mapDeezerToAudioMetrics(track) {
  const tempo = Number(track?.bpm)
  const loudness = Number(track?.gain)

  const normalizedTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : null
  const normalizedLoudness = Number.isFinite(loudness) ? loudness : null

  return {
    source: 'deezer',
    tempo: normalizedTempo,
    key: null,
    mode: null,
    time_signature: null,
    loudness: normalizedLoudness,
    energy: estimateEnergy(normalizedTempo, normalizedLoudness),
    isEstimatedEnergy: true,
  }
}

async function searchDeezerTrack(trackName, artistName) {
  const query = `${trackName} ${artistName}`.trim()

  const response = await axios.get(`${deezerApiBase}/search`, {
    params: {
      q: query,
      limit: 10,
    },
  })

  const tracks = response.data?.data ?? []
  if (!tracks.length) {
    return null
  }

  return [...tracks]
    .sort((a, b) => scoreMatch(b, trackName, artistName) - scoreMatch(a, trackName, artistName))[0]
}

export async function getDeezerAudioMetrics(trackName, artistName) {
  const matchedTrack = await searchDeezerTrack(trackName, artistName)
  if (!matchedTrack?.id) {
    return null
  }

  const response = await axios.get(`${deezerApiBase}/track/${matchedTrack.id}`)
  return mapDeezerToAudioMetrics(response.data)
}
