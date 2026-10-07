
import './css/App.css'
import Home from './pages/Home'
import Favourites from './pages/Favourites'
import NavBar from './components/NavBar'
import {Routes, Route} from 'react-router-dom'

function App() {
  return (
    <div>
      <NavBar />
    <main className= "main-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favourites" element={<Favourites />} />
      </Routes>
    </main> 
    </div>
  );
}

export default App;