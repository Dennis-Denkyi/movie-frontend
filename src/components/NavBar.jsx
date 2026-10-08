import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import '../css/NavBar.css'

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand"> 
        <Link to="/">Movie App</Link>  
      </div>

      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/favourites" className="nav-link">Favourites</Link>
        <Link to="/recommendations" className="nav-link">Recommendations</Link>
        <ThemeToggle />
      </div>

    </nav>
  );
}

export default NavBar;
