# Movie App

A React app for discovering movies, built on [The Movie Database (TMDB)](https://www.themoviedb.org/) API. Browse popular titles, search as you type, save favourites, and get personalised recommendations based on what you like.

## Features

- **Popular movies & live search**: results update as you type, without calling the API on every keystroke.
- **Favourites**: save movies with one click; they're stored in the browser and survive page reloads.
- **Recommendations**: a "Recommended For You" page built from your favourites (see [how it works](#how-recommendations-work)).
- **User score**: each poster shows TMDB's user score as a colour-coded ring (green / yellow / red, or "NR" if unrated).
- **Light & dark mode**: dark by default; the choice is remembered, with no flash on reload.
- **Responsive** layout from phone to desktop.

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React 19, React Router 7, Vite |
| State | React Context + localStorage |
| Testing | Vitest, React Testing Library, jsdom |
| Quality | ESLint (incl. React Hooks rules) |
| Deployment | Docker (multi-stage build, served by nginx) |
| Dev environment | VS Code Dev Containers |

## How recommendations work

No machine-learning model is needed. TMDB's recommendation data does the heavy lifting:

1. For each favourite, fetch TMDB's recommendations for that movie (falling back to "similar movies" when there are none).
2. Count how many of your favourites each candidate was recommended for. A movie linked to 3 of your favourites is a stronger match than one linked to 1.
3. Break ties with a **vote-weighted rating**, so a 9.0 from 10 votes doesn't beat a 7.8 from 20,000.
4. Remove movies you've already favourited and show the top 10, each labelled with why it was picked (e.g. "Because you liked Dune").

## API efficiency

- **Debounced search**: requests fire 500 ms after you stop typing (pressing Enter searches immediately).
- **In-memory cache**: results are cached for 5 minutes (up to 50 entries), so repeat searches and revisiting pages don't refetch.
- **Request cancellation**: outdated requests are aborted, so a slow response can never overwrite newer results.

## Getting started

**Prerequisites:** Node.js 20.19+ (or 22.12+) and a free [TMDB API key](https://www.themoviedb.org/settings/api).

```bash
git clone https://github.com/Dennis-Denkyi/movie-frontend.git
cd movie-frontend
npm install
```

Create a `.env.local` file in the project root (it's gitignored):

```
VITE_TMDB_API_KEY=your_tmdb_api_key
```

Then start the dev server:

```bash
npm run dev
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Testing

19 unit tests cover the parts of the app with real logic. TMDB is mocked, so tests run offline in about a second.

| Area | What's covered |
|---|---|
| Recommendations | Overlap ranking, vote-weighted tiebreak, excluding favourites, top-10 cap, partial and total API failure |
| API caching | Cache hits (case/whitespace-insensitive), failed responses not cached, similar-movies fallback |
| Favourites | Persist across reloads; add/remove updates storage |
| Movie card | Score colour boundaries (70% / 40%), "NR" for unrated, favourite toggle |

Several are regression tests for real bugs found during development.

## Docker

The Dockerfile runs the tests, builds the app, and serves it from a small nginx image (~76 MB). Vite embeds env vars at build time, so the API key is passed as a build argument:

```bash
docker build --build-arg VITE_TMDB_API_KEY=your_tmdb_api_key -t movie-frontend .
docker run -p 8080:80 movie-frontend
```

Then open http://localhost:8080. nginx is configured so client-side routes like `/favourites` work on refresh.

### Dev container

With Docker and the VS Code **Dev Containers** extension installed, run **"Dev Containers: Reopen in Container"** for a ready-to-code Node 22 environment. It also works in GitHub Codespaces.

## Project structure

```
src/
├── components/   MovieCard, NavBar, ThemeToggle, EmptyFavourites
├── contexts/     MovieContext (favourites state + persistence)
├── pages/        Home, Favourites, Recommendations
├── services/     api.js (TMDB + caching), recommendations.js (scoring)
├── css/          Styles, with theme colours as CSS variables
└── test/         Test setup
```

## A note on the API key

This is a frontend-only app, so the TMDB key is included in the browser bundle. It is kept out of the repository, but anyone using the site can see it. A production app would route requests through a small backend to keep the key private.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
