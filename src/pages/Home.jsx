import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import '../css/Home.css'

const SEARCH_DEBOUNCE_MS = 500;

function Home() {

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [resultsFor, setResultsFor] = useState(null);
  const [error, setError] = useState(null);

  const loading = resultsFor !== debouncedQuery;

  // Wait until the user stops typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Abort the previous request so a slow, outdated response can't overwrite newer results.
    const controller = new AbortController();

    const loadMovies = async () => {
      try {
        const results = debouncedQuery
          ? await searchMovies(debouncedQuery, controller.signal)
          : await getPopularMovies(controller.signal);
        setMovies(results)
        setError(null)
      } catch (error) {
        if (error.name === "AbortError") return
        console.log(error)
        setError(debouncedQuery ? "Failed to search movies..." : "Failed to load popular movies...")
      }
      setResultsFor(debouncedQuery)
    }
    loadMovies()

    return () => controller.abort();
  }, [debouncedQuery])

  const handleSearch = (e) => {
    e.preventDefault();
    // Pressing Enter / Search skips the debounce wait.
    setDebouncedQuery(searchQuery.trim());
  };

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for a movie..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading && movies.length === 0 ? (
        <div className="loading">Loading...</div>
      ) : !loading && movies.length === 0 && !error ? (
        <div className="no-results">No movies found for "{debouncedQuery}"</div>
      ) : (
        <div className={`movies-grid ${loading ? "stale" : ""}`}>
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
