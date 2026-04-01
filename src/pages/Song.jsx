import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import SongDetail from '../components/SongDetail'
import LoadingSkeleton from '../components/LoadingSkeleton'
import {
  getSpotifyTrackById,
} from '../api/spotify'
import { getDeezerAudioMetrics } from '../api/deezer'
import {
  extractCredits,
  findGeniusMatch,
  getGeniusSong,
} from '../api/genius'

function Song() {
  const { spotifyId } = useParams()
  const location = useLocation()
  const [track, setTrack] = useState(location.state?.track ?? null)
  const [audioFeatures, setAudioFeatures] = useState(null)
  const [credits, setCredits] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadSongDetails() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const routeTrack = location.state?.track
        const resolvedTrack =
          routeTrack?.id === spotifyId ? routeTrack : await getSpotifyTrackById(spotifyId)
        if (ignore) {
          return
        }

        setTrack(resolvedTrack)

        const artistName = resolvedTrack.artists?.[0]?.name || ''
        const [geniusResult, deezerResult] = await Promise.allSettled([
          findGeniusMatch(resolvedTrack.name, artistName),
          getDeezerAudioMetrics(resolvedTrack.name, artistName),
        ])

        if (ignore) {
          return
        }

        setAudioFeatures(deezerResult.status === 'fulfilled' ? deezerResult.value : null)

        const geniusMatch = geniusResult.status === 'fulfilled' ? geniusResult.value : null

        if (!geniusMatch?.id) {
          setCredits({ writers: [], producers: [], distributionCompany: null })
          return
        }

        const geniusSong = await getGeniusSong(geniusMatch.id)
        if (ignore) {
          return
        }

        const extractedCredits = extractCredits(geniusSong)
        setCredits(extractedCredits)
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.error_description ||
            error?.response?.data?.message ||
            error?.message ||
            'Unable to load song details right now.',
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadSongDetails()

    return () => {
      ignore = true
    }
  }, [spotifyId, location.state])

  if (isLoading) {
    return <LoadingSkeleton type="detail" />
  }

  if (errorMessage) {
    return <p className="error-banner">{errorMessage}</p>
  }

  if (!track) {
    return <p className="error-banner">Track data is unavailable.</p>
  }

  return (
    <section className="song-page fade-in">
      <SongDetail track={track} audioFeatures={audioFeatures} credits={credits} />
    </section>
  )
}

export default Song
