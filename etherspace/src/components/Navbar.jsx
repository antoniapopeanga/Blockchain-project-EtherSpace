import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const userAddress = localStorage.getItem('userAddress');

    // If the user is logged in and tries to go to '/', redirect them to their profile
    if (isLandingPage && userAddress) {
      navigate('/profile');
    }
  }, [isLandingPage, navigate]);

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ flex: 1 }}>
        <Link to="/" className="text-2xl font-bold">
          EtherSpace
        </Link>
      </div>

      {/* Hide "Search Users" and "Logout" buttons on the landing page */}
      {!isLandingPage && (
        <div style={{ flex: 1, textAlign: 'center' }}>
          <Link to="/search">Search Users</Link>
        </div>
      )}

      {!isLandingPage && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <LogoutButton />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
