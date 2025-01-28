import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import the Navbar component
import LandingPage from './components/LandingPage';
import ProfileCreation from './components/ProfileCreation';
import UserProfile from './components/UserProfile';
import UserSearch from './components/UserSearch';
import Feed from './components/Feed'
import './App.css';


function App() {
  const userAddress = localStorage.getItem('userAddress');

  return (
    <div className="App">
      <Navbar />
 
      <main className="App-main">
        <Routes>
          <Route 
            path="/" 
            element={ <LandingPage />} 
          />
          <Route path="/register" element={<ProfileCreation />} />
          <Route path="/profile/:address" element={<UserProfile />} />
          <Route path="/search" element={<UserSearch />} />
          <Route path="/feed" element={<Feed />} /> {/* Add this route */}

          
        </Routes>
      </main>
 
      <footer className="App-footer">
        <p>Built with Ethereum & React</p>
      </footer>
    </div>
  );
}
function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;