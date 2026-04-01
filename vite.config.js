/* global process, Buffer */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const spotifyClientId = env.SPOTIFY_CLIENT_ID
  const spotifyClientSecret = env.SPOTIFY_CLIENT_SECRET

  const spotifyBasicAuth = spotifyClientId && spotifyClientSecret
    ? `Basic ${Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64')}`
    : ''

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/spotify-token': {
          target: 'https://accounts.spotify.com',
          changeOrigin: true,
          rewrite: () => '/api/token',
          headers: spotifyBasicAuth
            ? {
                Authorization: spotifyBasicAuth,
              }
            : {},
        },
        '/api/spotify': {
          target: 'https://api.spotify.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/spotify/, '/v1'),
        },
        '/api/genius': {
          target: 'https://api.genius.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/genius/, ''),
        },
      },
    },
  }
})
