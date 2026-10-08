import "../css/Recommendations.css"
import { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { getRecommendedMovies } from "../services/recommendations";
import MovieCard from "../components/MovieCard";
import EmptyFavourites from "../components/EmptyFavourites";

function describeMatch(matchedFavourites) {
  if (matchedFavourites.length === 1) return `Because you liked ${matchedFavourites[0]}`;
  return `Matches ${matchedFavourites.length} of your favourites`;
}

function Recommendations() {
  const { favourites } = useMovieContext();
  const [recommendations, setRecommendations] = useState([]);
  const [resultsFor, setResultsFor] = useState(null);
  const [error, setError] = useState(null);

  // Refetch only when the set of favourite IDs changes, not on every re-render.
  const favouritesKey = favourites.map((movie) => movie.id).join(",");
  const loading = resultsFor !== favouritesKey;

  useEffect(() => {
    if (!favouritesKey) return;
    const controller = new AbortController();

    const loadRecommendations = async () => {
      try {
        const results = await getRecommendedMovies(favourites, controller.signal);
        setRecommendations(results)
        setError(null)
      } catch (error) {
        if (error.name === "AbortError") return
        console.log(error)
        setError("Failed to load recommendations...")
      }
      setResultsFor(favouritesKey)
    }
    loadRecommendations()

    return () => controller.abort();
    // favourites is read via favouritesKey so adding/removing triggers a refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favouritesKey])

  if (favourites.length === 0) {
    return (
      <EmptyFavourites
        title="No Recommended Movies"
        message="Add movies to your favourites and we'll recommend similar ones here!"
      />
    );
  }

  return (
    <div className="recommendations">
      <h2>Recommended For You</h2>
      <p className="recommendations-subtitle">
        Based on {favourites.length} favourite{favourites.length === 1 ? "" : "s"}
      </p>

      {error && <div className="error">{error}</div>}

      {loading && recommendations.length === 0 ? (
        <div className="loading">Finding recommendations...</div>
      ) : !loading && recommendations.length === 0 && !error ? (
        <div className="no-results">No recommendations found yet. Try adding a few more favourites.</div>
      ) : (
        <div className={`movies-grid ${loading ? "stale" : ""}`}>
          {recommendations.map(({ movie, matchedFavourites }) => (
            <MovieCard movie={movie} key={movie.id} note={describeMatch(matchedFavourites)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommendations;
