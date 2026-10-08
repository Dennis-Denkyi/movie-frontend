
import './css/App.css'
import Home from './pages/Home'
import Favourites from './pages/Favourites'
import Recommendations from './pages/Recommendations'
import NavBar from './components/NavBar'
import {Routes, Route} from 'react-router-dom'
import { MovieProvider } from './contexts/MovieContext'

function App() {
  return (
    <MovieProvider>
      <NavBar />
    <main className= "main-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </main> 
    </MovieProvider>
  );
}

export default App;