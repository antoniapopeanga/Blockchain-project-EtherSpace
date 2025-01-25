import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ProfileCreation from './components/ProfileCreation';
import UserProfile from './components/UserProfile';
import './App.css';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userAddress');
    
    if (window.ethereum) {
      window.ethereum.removeAllListeners();
    }

    navigate('/');
  };

  return (
    <button 
      onClick={handleLogout} 
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
    >
      Logout
    </button>
  );
}

function App() {
  const location = useLocation();
  const showLogoutButton = location.pathname.startsWith('/profile/');

  return (
    <div className="App">
      <header className="App-header relative flex items-center justify-between p-4">
        <div className="flex-grow text-center">
          <h1 className="text-2xl font-bold">EtherSpace</h1>
        </div>
        {showLogoutButton && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <LogoutButton />
          </div>
        )}
      </header>

      <main className="App-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<ProfileCreation />} />
          <Route path="/profile/:address" element={<UserProfile />} />
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