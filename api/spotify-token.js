export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method Not Allowed' })
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return response.status(500).json({
      error: 'Missing server env vars: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET',
    })
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const spotifyResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    })

    const payload = await spotifyResponse.json()

    if (!spotifyResponse.ok) {
      return response.status(spotifyResponse.status).json(payload)
    }

    return response.status(200).json(payload)
  } catch {
    return response.status(500).json({
      error: 'Spotify token exchange failed unexpectedly.',
    })
  }
}
