import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const okResponse = (results) => ({ ok: true, status: 200, json: async () => ({ results }) });

let api;

beforeEach(async () => {
  // Fresh module each test so the in-memory cache starts empty.
  vi.resetModules();
  api = await import("./api");
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("api cache", () => {
  it("serves repeat searches from cache, ignoring case and spaces", async () => {
    fetch.mockResolvedValue(okResponse([{ id: 1 }]));

    await api.searchMovies("Batman");
    const second = await api.searchMovies("  batman ");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(second).toEqual([{ id: 1 }]);
  });

  it("caches popular movies", async () => {
    fetch.mockResolvedValue(okResponse([{ id: 1 }]));

    await api.getPopularMovies();
    await api.getPopularMovies();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws on a failed response and does not cache it", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });
    fetch.mockResolvedValueOnce(okResponse([{ id: 2 }]));

    await expect(api.searchMovies("dune")).rejects.toThrow("401");
    await expect(api.searchMovies("dune")).resolves.toEqual([{ id: 2 }]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("falls back to similar movies when there are no recommendations", async () => {
    fetch.mockResolvedValueOnce(okResponse([]));
    fetch.mockResolvedValueOnce(okResponse([{ id: 3 }]));

    const results = await api.getRecommendations(550);

    expect(results).toEqual([{ id: 3 }]);
    expect(fetch.mock.calls[0][0]).toContain("/movie/550/recommendations");
    expect(fetch.mock.calls[1][0]).toContain("/movie/550/similar");
  });
});
