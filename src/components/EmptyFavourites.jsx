import "../css/Favourites.css"

function EmptyFavourites({
  title = "No Favourites Movies",
  message = "Start adding movies to your favourites and they will appear here!",
}) {
  return (
    <div className="favourites-empty">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}

export default EmptyFavourites;
