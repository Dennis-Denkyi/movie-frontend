import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRecommendations } from "./api";
import { getRecommendedMovies } from "./recommendations";

vi.mock("./api", () => ({ getRecommendations: vi.fn() }));

const movie = (id, title, vote_average = 7, vote_count = 1000) => ({ id, title, vote_average, vote_count });

// Maps favourite id -> list of recommended movies TMDB would return for it.
function mockRecommendations(byFavouriteId) {
  getRecommendations.mockImplementation(async (id) => {
    const result = byFavouriteId[id];
    if (result instanceof Error) throw result;
    return result ?? [];
  });
}

describe("getRecommendedMovies", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ranks movies recommended by more favourites higher", async () => {
    const shared = movie(100, "Shared Pick", 6.0, 500);
    const single = movie(200, "Single Pick", 9.0, 50000);
    mockRecommendations({ 1: [shared, single], 2: [shared], 3: [shared] });

    const results = await getRecommendedMovies([movie(1, "A"), movie(2, "B"), movie(3, "C")]);

    expect(results.map((r) => r.movie.id)).toEqual([100, 200]);
    expect(results[0].matchedFavourites).toEqual(["A", "B", "C"]);
    expect(results[1].matchedFavourites).toEqual(["A"]);
  });

  it("breaks ties with a vote-weighted rating, not the raw average", async () => {
    const fewVotes = movie(100, "Hidden Gem", 9.0, 10);
    const manyVotes = movie(200, "Crowd Favourite", 7.8, 20000);
    mockRecommendations({ 1: [fewVotes, manyVotes] });

    const results = await getRecommendedMovies([movie(1, "A")]);

    expect(results.map((r) => r.movie.id)).toEqual([200, 100]);
  });

  it("excludes movies that are already favourites", async () => {
    mockRecommendations({ 1: [movie(2, "B"), movie(100, "New")], 2: [movie(1, "A")] });

    const results = await getRecommendedMovies([movie(1, "A"), movie(2, "B")]);

    expect(results.map((r) => r.movie.id)).toEqual([100]);
  });

  it("returns at most 10 recommendations", async () => {
    const many = Array.from({ length: 25 }, (_, i) => movie(100 + i, `M${i}`));
    mockRecommendations({ 1: many });

    const results = await getRecommendedMovies([movie(1, "A")]);

    expect(results).toHaveLength(10);
  });

  it("still returns results when some favourites fail", async () => {
    mockRecommendations({ 1: new Error("boom"), 2: [movie(100, "Survivor")] });

    const results = await getRecommendedMovies([movie(1, "A"), movie(2, "B")]);

    expect(results.map((r) => r.movie.id)).toEqual([100]);
  });

  it("throws when every favourite fails", async () => {
    mockRecommendations({ 1: new Error("down"), 2: new Error("down") });

    await expect(getRecommendedMovies([movie(1, "A"), movie(2, "B")])).rejects.toThrow("down");
  });
});
