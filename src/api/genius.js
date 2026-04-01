import axios from 'axios'

const geniusApiBase = import.meta.env.DEV
  ? '/api/genius'
  : 'https://api.genius.com'

function getGeniusHeaders() {
  const token = import.meta.env.VITE_GENIUS_ACCESS_TOKEN

  if (!token) {
    throw new Error('Genius access token is missing. Check your environment variables.')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

function parseSongHit(hit) {
  if (!hit?.result) {
    return null
  }

  const { result } = hit
  return {
    id: result.id,
    title: result.title,
    fullTitle: result.full_title,
    artist: result.primary_artist?.name,
    image: result.song_art_image_thumbnail_url || result.song_art_image_url,
  }
}

function extractDistribution(song) {
  const label = song?.label?.name
  if (label) {
    return label
  }

  const matchingPerf = song?.custom_performances?.find((item) =>
    item.label?.toLowerCase().includes('distribution'),
  )

  if (!matchingPerf?.artists?.length) {
    return null
  }

  return matchingPerf.artists.map((artist) => artist.name).join(', ')
}

export function extractCredits(song) {
  if (!song) {
    return {
      writers: [],
      producers: [],
      distributionCompany: null,
    }
  }

  const writers = (song.writer_artists || [])
    .map((artist) => ({
      name: artist?.name,
      url: artist?.url,
    }))
    .filter((item) => item.name)

  const producers = (song.producer_artists || [])
    .map((artist) => ({
      name: artist?.name,
      url: artist?.url,
    }))
    .filter((item) => item.name)

  const distributionCompany = extractDistribution(song)

  return {
    writers,
    producers,
    distributionCompany,
  }
}

export async function searchGeniusSongs(query) {
  const response = await axios.get(
    `${geniusApiBase}/search?q=${encodeURIComponent(query)}`,
    {
      headers: getGeniusHeaders(),
    },
  )

  return (response.data.response?.hits ?? [])
    .map(parseSongHit)
    .filter(Boolean)
}

export async function getGeniusSong(songId) {
  const response = await axios.get(`${geniusApiBase}/songs/${songId}`, {
    headers: getGeniusHeaders(),
  })

  const song = response.data.response?.song

  if (!song) {
    return null
  }

  return song
}

export async function findGeniusMatch(trackName, artistName) {
  const query = `${trackName} ${artistName}`.trim()
  const hits = await searchGeniusSongs(query)
  return hits[0] ?? null
}
