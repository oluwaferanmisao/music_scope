# MusicScope

MusicScope is a React + Vite music discovery app that searches Spotify tracks and shows track metadata with songwriting and production credits from Genius.

## Features

- Live song search via Spotify
- Audio profile fallback via Deezer (`bpm` and loudness with estimated energy)
- Credits view: Writers, Producers, Distribution Company
- Loading skeletons and graceful error states
- Responsive layout with light and dark themes

## Stack

- Vite + React (JavaScript)
- React Router v6
- Axios
- Plain CSS

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Fill the values below:

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
VITE_SPOTIFY_TOKEN_ENDPOINT=/api/spotify-token
VITE_GENIUS_ACCESS_TOKEN=
```

## Deploy Fix For "secure backend" Error

This app requires a secure backend endpoint for Spotify token exchange in production.

1. Keep Spotify secrets server-side only:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

2. Ensure `/api/spotify-token` is deployed (this repo includes [api/spotify-token.js](api/spotify-token.js) for serverless platforms like Vercel).
3. Set frontend env var `VITE_SPOTIFY_TOKEN_ENDPOINT` to your deployed token endpoint path or URL.
4. Redeploy.

If your platform is not Vercel, implement an equivalent backend route that calls `https://accounts.spotify.com/api/token` using Client Credentials and returns the token response.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Notes

- Spotify uses Client Credentials only for public, non-user data.
- Spotify client secret is read by the Vite server proxy only (not exposed to browser code).
- Spotify access token is cached in sessionStorage and re-requested automatically on expiry or 401.
- Spotify 429 responses are retried with exponential backoff and Retry-After support.
- Spotify integration uses OpenAPI-defined paths: /search and /tracks/{id}.
- Spotify OpenAPI currently marks /audio-features endpoints deprecated, so this app does not call them.
- Audio analysis fallback uses Deezer public endpoints when Spotify audio-features are unavailable.
- For any future user-specific Spotify features, use Authorization Code with PKCE, HTTPS redirect URIs (or http://127.0.0.1 locally), and minimum required scopes.
- In development, Vite proxy routes are used for Spotify and Genius endpoints.
- If Genius has no available credits for a song, the UI shows Credits unavailable.
- Chord progressions are out of scope.
