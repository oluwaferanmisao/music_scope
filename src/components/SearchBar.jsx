import { useEffect, useState } from 'react'

function SearchBar({ initialValue = '', onQueryChange, isLoading }) {
  const [query, setQuery] = useState(initialValue)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onQueryChange(query)
    }, 450)

    return () => clearTimeout(timeoutId)
  }, [query, onQueryChange])

  return (
    <form
      className="search-bar"
      onSubmit={(event) => event.preventDefault()}
      aria-label="Search songs"
    >
      <label className="search-label" htmlFor="song-search">
        Search songs by title or artist
      </label>
      <div className="search-control">
        <input
          id="song-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          type="search"
          placeholder="Try Blinding Lights The Weeknd"
          autoComplete="off"
        />
        {isLoading && <span className="search-status">Searching...</span>}
      </div>
    </form>
  )
}

export default SearchBar
