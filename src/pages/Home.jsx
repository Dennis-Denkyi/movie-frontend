import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import '../css/Home.css'

function Home() {

  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setmovies] = useState ([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {

    const loadPopularMovies = async () => {
      try {
        const popularMovies = await getPopularMovies()
        setmovies(popularMovies)
    }catch (error) {
      console.log(error)
      setError("Failed to load popular...")
    }
    finally{
      setLoading(false)
    }
  }
  loadPopularMovies()

  },[])

  const handleSearch = async(e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return
    if (loading) return

    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setmovies(searchResults)
      setError(null)
    }
      catch (error) {
        console.log(error)
        setError("Failed to search movies...")
      }
      finally{
        setLoading(false)
      }

    
    setSearchQuery("");
  };

  return (
   


    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for a movie..."
          classsName="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className= "loading">Loading...</div>
      ):(
        <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
     
  )}
  </div>
);
}

export default Home;
