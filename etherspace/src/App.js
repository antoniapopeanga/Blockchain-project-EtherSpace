import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ProfileCreation from './components/ProfileCreation';
import UserProfile from './components/UserProfile';
import UserSearch from './components/UserSearch';
import Feed from './components/Feed'
import WalletManagement from './components/WalletManagement';
import './App.css';


function App() {
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
          <Route path="/wallet" element={<WalletManagement />} />

          
        </Routes>
      </main>
 
      <footer className="App-footer">
        <p>Your new decentralized social network</p>
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