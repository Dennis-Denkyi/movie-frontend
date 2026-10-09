import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MovieProvider } from "../contexts/MovieContext";
import MovieCard from "./MovieCard";

const renderCard = (overrides = {}) => {
  const movie = { id: 1, title: "Dune", poster_path: "/p.jpg", release_date: "2024-03-01", vote_average: 8.2, vote_count: 500, ...overrides };
  return render(<MovieProvider><MovieCard movie={movie} /></MovieProvider>);
};

describe("MovieCard user score", () => {
  it.each([
    [8.2, "82", "high"],
    [7.0, "70", "high"],
    [5.5, "55", "mid"],
    [4.0, "40", "mid"],
    [3.0, "30", "low"],
  ])("shows %s as %s%% with the %s colour", (vote_average, text, level) => {
    renderCard({ vote_average });

    const badge = screen.getByLabelText(`User score ${text} percent`);
    expect(badge).toHaveTextContent(`${text}%`);
    expect(badge).toHaveClass(level);
  });

  it("shows NR for movies with no votes", () => {
    renderCard({ vote_average: 0, vote_count: 0 });

    const badge = screen.getByLabelText("Not rated");
    expect(badge).toHaveTextContent("NR");
    expect(badge).toHaveClass("none");
  });
});

describe("MovieCard favourite button", () => {
  it("toggles the movie in and out of favourites", () => {
    renderCard();
    const button = screen.getByRole("button");

    fireEvent.click(button);
    expect(button).toHaveClass("active");
    expect(JSON.parse(localStorage.getItem("favourites"))).toHaveLength(1);

    fireEvent.click(button);
    expect(button).not.toHaveClass("active");
  });
});
