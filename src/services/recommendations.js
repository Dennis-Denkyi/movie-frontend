import { getRecommendations } from "./api";

const MAX_SEED_FAVOURITES = 20;
const MAX_RESULTS = 10;

// Bayesian average: pulls ratings with few votes toward a typical score,
// so a 9.0 from 12 votes doesn't beat a 7.8 from 20,000.
const MIN_VOTES = 200;
const AVERAGE_RATING = 6.5;

function weightedRating(movie) {
  const votes = movie.vote_count ?? 0;
  const rating = movie.vote_average ?? 0;
  return (votes / (votes + MIN_VOTES)) * rating + (MIN_VOTES / (votes + MIN_VOTES)) * AVERAGE_RATING;
}

export async function getRecommendedMovies(favourites, signal) {
  // Use the most recently added favourites to cap the number of requests.
  const seeds = favourites.slice(-MAX_SEED_FAVOURITES);
  const favouriteIds = new Set(favourites.map((movie) => movie.id));

  const responses = await Promise.allSettled(
    seeds.map((movie) => getRecommendations(movie.id, signal))
  );
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const failed = responses.filter((r) => r.status === "rejected");
  if (failed.length === responses.length) throw failed[0].reason;

  const candidates = new Map();
  responses.forEach((response, i) => {
    if (response.status !== "fulfilled") return;
    for (const movie of response.value) {
      if (favouriteIds.has(movie.id)) continue;
      const entry = candidates.get(movie.id) ?? { movie, matchedFavourites: [] };
      if (!entry.matchedFavourites.includes(seeds[i].title)) entry.matchedFavourites.push(seeds[i].title);
      candidates.set(movie.id, entry);
    }
  });

  return [...candidates.values()]
    .map((entry) => ({ ...entry, rating: weightedRating(entry.movie) }))
    .sort((a, b) => b.matchedFavourites.length - a.matchedFavourites.length || b.rating - a.rating)
    .slice(0, MAX_RESULTS);
}
