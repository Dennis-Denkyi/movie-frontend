import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MovieProvider, useMovieContext } from "./MovieContext";

const dune = { id: 1, title: "Dune" };

function Harness() {
  const { favourites, addToFavourites, removeFromFavourites, isFavourite } = useMovieContext();
  return (
    <div>
      <p data-testid="titles">{favourites.map((m) => m.title).join(",")}</p>
      <p data-testid="is-fav">{String(isFavourite(1))}</p>
      <button onClick={() => addToFavourites(dune)}>add</button>
      <button onClick={() => removeFromFavourites(1)}>remove</button>
    </div>
  );
}

const renderHarness = () => render(<MovieProvider><Harness /></MovieProvider>);

describe("MovieProvider", () => {
  it("loads saved favourites on startup without wiping them", () => {
    localStorage.setItem("favourites", JSON.stringify([dune]));

    renderHarness();

    expect(screen.getByTestId("titles")).toHaveTextContent("Dune");
    expect(JSON.parse(localStorage.getItem("favourites"))).toEqual([dune]);
  });

  it("adds and removes favourites and saves them", () => {
    renderHarness();

    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("is-fav")).toHaveTextContent("true");
    expect(JSON.parse(localStorage.getItem("favourites"))).toEqual([dune]);

    fireEvent.click(screen.getByText("remove"));
    expect(screen.getByTestId("is-fav")).toHaveTextContent("false");
    expect(JSON.parse(localStorage.getItem("favourites"))).toEqual([]);
  });
});
