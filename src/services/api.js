const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = "https://api.themoviedb.org/3"

// In-memory cache so repeat searches (and returning to popular) don't refetch.
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 50;
const cache = new Map();

const fetchResults = async (cacheKey, url, signal, errorMessage) => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) return cached.results;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${errorMessage} (${response.status})`);
  const data = await response.json();
  const results = data.results ?? [];

  cache.delete(cacheKey);
  cache.set(cacheKey, { results, time: Date.now() });
  if (cache.size > CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
  return results;
};

export const getPopularMovies = (signal) =>
  fetchResults(
    "popular",
    `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
    signal,
    "Failed to fetch popular movies"
  );

export const searchMovies = (query, signal) =>
  fetchResults(
    `search:${query.trim().toLowerCase()}`,
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query.trim())}`,
    signal,
    "Failed to search movies"
  );

export const getRecommendations = async (movieId, signal) => {
  const recommendations = await fetchResults(
    `recommendations:${movieId}`,
    `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`,
    signal,
    "Failed to fetch recommendations"
  );
  if (recommendations.length > 0) return recommendations;

  // Less popular movies often have no recommendations; similar movies is a decent fallback.
  return fetchResults(
    `similar:${movieId}`,
    `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`,
    signal,
    "Failed to fetch similar movies"
  );
};
