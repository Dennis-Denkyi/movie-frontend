import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/MovieContext";

function MovieCard({ movie, note }) {
  const { addToFavourites, removeFromFavourites, isFavourite } = useMovieContext();
  const favourite = isFavourite(movie.id);

  // TMDB's "User Score" is vote_average (0-10) as a percentage.
  const rated = movie.vote_count > 0 && movie.vote_average > 0;
  const score = rated ? Math.round(movie.vote_average * 10) : null;
  const level = !rated ? "none" : score >= 70 ? "high" : score >= 40 ? "mid" : "low";

  function onFavouriteClick(e) {
    e.preventDefault();
    if (favourite) removeFromFavourites(movie.id);
    else addToFavourites(movie);
  }

  return (
    <div className="movie-card">
      <div className="movie-poster">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />
        ) : (
          <div className="no-poster">No Image</div>
        )}
        <div className="movie-overlay">
          <button className={`favourite-btn ${favourite ? "active" : ""}`} onClick={onFavouriteClick}>
            ♥
          </button>
        </div>
        <div
          className={`user-score ${level}`}
          style={{ "--score": score ?? 0 }}
          title={rated ? `User score: ${score}%` : "Not rated yet"}
          aria-label={rated ? `User score ${score} percent` : "Not rated"}
        >
          <span>{rated ? <>{score}<sup>%</sup></> : "NR"}</span>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date?.split("-")[0]}</p>
        {note && <p className="movie-note">{note}</p>}
      </div>
    </div>
  );
}

export default MovieCard;
