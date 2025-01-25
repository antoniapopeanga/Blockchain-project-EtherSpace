import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import the Navbar component
import LandingPage from './components/LandingPage';
import ProfileCreation from './components/ProfileCreation';
import UserProfile from './components/UserProfile';
import UserSearch from './components/UserSearch';
import './App.css';
import { Navigate } from 'react-router-dom';


function App() {
  const userAddress = localStorage.getItem('userAddress');

  return (
    <div className="App">
      <Navbar />
 
      <main className="App-main">
        <Routes>
          <Route 
            path="/" 
            element={userAddress ? <Navigate to={`/profile/${userAddress}`} /> : <LandingPage />} 
          />
          <Route path="/register" element={<ProfileCreation />} />
          <Route path="/profile/:address" element={<UserProfile />} />
          <Route path="/search" element={<UserSearch />} />
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