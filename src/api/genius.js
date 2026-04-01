import axios from 'axios'

const geniusApiBase = '/api/genius'

function normalize(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

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

function pickPreviewMedia(song) {
  const media = song?.media ?? []
  const preferredProviders = ['spotify', 'apple_music', 'soundcloud', 'youtube']

  for (const provider of preferredProviders) {
    const match = media.find((item) => item?.provider === provider && item?.url)
    if (match) {
      return {
        provider,
        url: match.url,
      }
    }
  }

  const fallback = media.find((item) => item?.url)
  if (!fallback) {
    return null
  }

  return {
    provider: fallback.provider || 'external',
    url: fallback.url,
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
      preview: null,
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
  const preview = pickPreviewMedia(song)

  return {
    writers,
    producers,
    distributionCompany,
    preview,
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
  if (!hits.length) {
    return null
  }

  const normalizedTrack = normalize(trackName)
  const normalizedArtist = normalize(artistName)

  const bestMatch = [...hits]
    .sort((a, b) => {
      const aTitle = normalize(a.title)
      const bTitle = normalize(b.title)
      const aArtist = normalize(a.artist)
      const bArtist = normalize(b.artist)

      let aScore = 0
      let bScore = 0

      if (aTitle === normalizedTrack) {
        aScore += 3
      } else if (aTitle.includes(normalizedTrack) || normalizedTrack.includes(aTitle)) {
        aScore += 2
      }

      if (bTitle === normalizedTrack) {
        bScore += 3
      } else if (bTitle.includes(normalizedTrack) || normalizedTrack.includes(bTitle)) {
        bScore += 2
      }

      if (aArtist === normalizedArtist) {
        aScore += 3
      } else if (aArtist.includes(normalizedArtist) || normalizedArtist.includes(aArtist)) {
        aScore += 2
      }

      if (bArtist === normalizedArtist) {
        bScore += 3
      } else if (bArtist.includes(normalizedArtist) || normalizedArtist.includes(bArtist)) {
        bScore += 2
      }

      return bScore - aScore
    })[0]

  return bestMatch ?? null
}
