# Role
You are a senior full-stack React developer building a music discovery 
web app called "MusicScope". Your job is to implement the entire application 
from scratch — components, API logic, styling, and routing.

---

# Project Overview
MusicScope is a web app where users search for any song and see detailed 
music data including:
- BPM, musical key, time signature, loudness, energy (Spotify API)
- Song credits: writers, producers, distribution company (Genius API)

---

# Tech Stack
- Vite + React (JavaScript, not TypeScript)
- React Router v6 for routing
- Axios for HTTP requests
- CSS Modules or plain CSS (no Tailwind)
- No backend — all API calls handled client-side or via a lightweight 
  Vite proxy to avoid CORS issues

---

# APIs
## 1. Spotify Web API (https://developer.spotify.com/documentation/web-api)
- Auth: Client Credentials Flow (store Client ID + Secret in .env)
- Use to: search tracks, fetch Audio Features per track ID
- Key endpoints:
  - GET /search?q={query}&type=track
  - GET /audio-features/{track_id}
- .env keys: VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_CLIENT_SECRET

## 2. Genius API (https://docs.genius.com)
- Auth: Bearer token in Authorization header
- Use to: search songs, fetch song metadata (credits, distribution label)
- Key endpoints:
  - GET /search?q={query}
  - GET /songs/{song_id}
- .env key: VITE_GENIUS_ACCESS_TOKEN

---

# App Structure
src/
├── api/
│   ├── spotify.js       # Token fetch + search + audio features
│   └── genius.js        # Search + song detail fetch
├── components/
│   ├── SearchBar.jsx
│   ├── SongCard.jsx     # Compact result in search list
│   └── SongDetail.jsx   # Full detail view (BPM, key, credits, etc.)
├── pages/
│   ├── Home.jsx         # Search page
│   └── Song.jsx         # Detail page (/song/:spotifyId)
├── App.jsx
└── main.jsx

---

# Key Implementation Rules
1. Spotify token must be fetched via Client Credentials and cached in 
   sessionStorage (expires in 3600s)
2. Match songs across APIs by querying both with "{track name} {artist}"
3. Display a loading skeleton while API calls are in flight
4. Handle API errors gracefully with user-facing error messages
5. All .env variables must be prefixed with VITE_ to be accessible in Vite
6. Do not hardcode any API keys

---

# UI & Design Expectations
- Dark & Light theme with a music/audio aesthetic
- Visualize BPM and energy as progress bars or gauges but still make sure to write the actual BPM in its plain form
- Display musical key and time signature as styled badges
- Credits section should clearly separate Writers, Producers, 
  and Distribution Company
- Responsive layout (mobile + desktop)
- Smooth transitions between search results and detail view

---

# What to Build First (in order)
1. Vite + React project scaffold with React Router
2. .env setup with all three API keys as placeholders
3. spotify.js — token fetch + track search + audio features
4. genius.js — song search + detail fetch
5. SearchBar component + Home page with live search
6. SongCard component for search results list
7. SongDetail component with all music data sections
8. Wire up routing: clicking a SongCard navigates to /song/:id
9. Loading skeletons and error states
10. Final responsive styling pass

---

# Notes
- Chord progressions are NOT in scope (no free API provides this reliably)
- If Genius returns no credits for a song, display "Credits unavailable"
- Always fetch Spotify audio features separately from track search 
  (they are different endpoints)