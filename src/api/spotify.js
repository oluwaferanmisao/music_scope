import axios from 'axios'

const SPOTIFY_TOKEN_CACHE_KEY = 'musicscope_spotify_token'
const TOKEN_EXPIRY_BUFFER_MS = 60_000
const MAX_RATE_LIMIT_RETRIES = 3
const BACKOFF_BASE_MS = 1000
const BACKOFF_MAX_MS = 10_000

const spotifyApiBase = import.meta.env.DEV
  ? '/api/spotify'
  : 'https://api.spotify.com/v1'

const spotifyTokenUrl = import.meta.env.VITE_SPOTIFY_TOKEN_ENDPOINT || '/api/spotify-token'

function clearTokenCache() {
  sessionStorage.removeItem(SPOTIFY_TOKEN_CACHE_KEY)
}

function readTokenCache() {
  const cached = sessionStorage.getItem(SPOTIFY_TOKEN_CACHE_KEY)
  if (!cached) {
    return null
  }

  try {
    const parsed = JSON.parse(cached)
    if (!parsed.accessToken || !parsed.expiresAt) {
      return null
    }

    if (Date.now() >= parsed.expiresAt) {
      clearTokenCache()
      return null
    }

    return parsed.accessToken
  } catch {
    clearTokenCache()
    return null
  }
}

function writeTokenCache(accessToken, expiresInSeconds) {
  const expiresAt = Date.now() + Number(expiresInSeconds ?? 3600) * 1000 - TOKEN_EXPIRY_BUFFER_MS

  sessionStorage.setItem(
    SPOTIFY_TOKEN_CACHE_KEY,
    JSON.stringify({ accessToken, expiresAt }),
  )
}

export async function getSpotifyToken() {
  const cachedToken = readTokenCache()
  if (cachedToken) {
    return cachedToken
  }

  try {
    const response = await axios.post(
      spotifyTokenUrl,
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )

    writeTokenCache(response.data.access_token, response.data.expires_in)
    return response.data.access_token
  } catch (error) {
    const status = error?.response?.status

    if (status === 404) {
      throw new Error(
        'Spotify token endpoint was not found. Deploy a secure /api/spotify-token backend or set VITE_SPOTIFY_TOKEN_ENDPOINT.',
      )
    }

    if (status === 500) {
      throw new Error('Spotify token endpoint failed. Check backend SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.')
    }

    throw mapSpotifyError(error)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetryDelayMs(error, attempt) {
  const retryAfterSeconds = Number(error?.response?.headers?.['retry-after'])
  const retryAfterMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds * 1000
    : 0

  const exponentialMs = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * (2 ** attempt))
  return Math.max(retryAfterMs, exponentialMs)
}

async function withSpotifyBackoff(requestFn, attempt = 0) {
  try {
    return await requestFn()
  } catch (error) {
    const status = error?.response?.status
    if (status !== 429 || attempt >= MAX_RATE_LIMIT_RETRIES) {
      throw error
    }

    const retryDelayMs = getRetryDelayMs(error, attempt)

    await delay(retryDelayMs)
    return withSpotifyBackoff(requestFn, attempt + 1)
  }
}

function mapSpotifyError(error) {
  if (!error?.response) {
    return new Error(error?.message || 'Spotify request failed.')
  }

  const status = error?.response?.status
  const apiMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.error_description ||
    error?.response?.data?.message

  if (status === 400) {
    return new Error(apiMessage || 'Spotify rejected the request (400).')
  }

  if (status === 401) {
    clearTokenCache()
    return new Error('Spotify authorization failed (401). Check server-side Spotify credentials.')
  }

  if (status === 403) {
    return new Error(apiMessage || 'Spotify denied access (403).')
  }

  if (status === 404) {
    return new Error('Spotify resource not found (404).')
  }

  if (status === 429) {
    return new Error('Spotify rate limit reached. Please try again shortly.')
  }

  if (status >= 500) {
    return new Error('Spotify service is temporarily unavailable.')
  }

  if (status) {
    return new Error(apiMessage || `Spotify request failed (${status}).`)
  }

  return new Error(apiMessage || 'Spotify request failed.')
}

async function spotifyGet(path, config = {}, allowAuthRetry = true) {
  const token = await getSpotifyToken()

  try {
    const response = await withSpotifyBackoff(() =>
      axios.get(`${spotifyApiBase}${path}`, {
        ...config,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(config.headers ?? {}),
        },
      }),
    )

    return response.data
  } catch (error) {
    const isUnauthorized = error?.response?.status === 401
    if (isUnauthorized && allowAuthRetry) {
      clearTokenCache()
      return spotifyGet(path, config, false)
    }

    throw mapSpotifyError(error)
  }
}

export async function searchSpotifyTracks(query, limit = 12) {
  const parsedQuery = query?.trim()
  if (!parsedQuery) {
    return []
  }

  const parsedLimit = Number.parseInt(limit, 10)
  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(10, Math.max(1, parsedLimit))
    : 12

  const data = await spotifyGet('/search', {
    params: {
      q: parsedQuery,
      type: 'track',
      limit: safeLimit,
    },
  })

  return data.tracks?.items ?? []
}

export async function getSpotifyTrackById(spotifyId) {
  return spotifyGet(`/tracks/${spotifyId}`)
}

export async function getSpotifyAudioFeatures(spotifyId) {
  void spotifyId
  return null
}
