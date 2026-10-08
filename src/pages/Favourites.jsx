import "../css/Favourites.css"
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import EmptyFavourites from "../components/EmptyFavourites";

function Favourites() {
  const { favourites } = useMovieContext();

  if (favourites.length > 0) {
    return (
      <div className="favourites">
        <h2>Your Favourites</h2>
        <div className="movies-grid">
        {favourites.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
        </div>
      </div>
  );
  }

  return <EmptyFavourites />;
}

export default Favourites;
