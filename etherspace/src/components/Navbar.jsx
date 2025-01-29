import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, User, Wallet } from 'lucide-react';
import styles from './css/Navbar.module.css';

// LogoutButton Component
function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userAddress');
    navigate('/');
  };

  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      Logout
    </button>
  );
}

function LogoLink({ to, children }) {
  return (
    <Link to={to} className={styles.logo}>
      {children}
    </Link>
  );
}

function NavLink({ to, children, isActive }) {
  return (
    <Link 
      to={to} 
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
    >
      {children}
    </Link>
  );
}

function Navbar() {
  const location = useLocation();
  const [currentAddress, setCurrentAddress] = useState(null);
  const [contractBalance, setContractBalance] = useState('0');

  useEffect(() => {
    const storedAddress = localStorage.getItem('userAddress');
    if (storedAddress) {
      setCurrentAddress(storedAddress);
    } else {
      setCurrentAddress(null);
    }
  }, [location.pathname]);

  const isLandingPage = location.pathname === '/';
  const isCreateProfilePage = location.pathname === '/register';

  if (isLandingPage || isCreateProfilePage) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.logoSection}>
          <LogoLink to="/">
            EtherSpace
          </LogoLink>
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoSection}>
        <LogoLink to={currentAddress ? `/profile/${currentAddress}` : '/'}>
          EtherSpace
        </LogoLink>
      </div>

      <div className={styles.navLinks}>
        <NavLink to="/feed" isActive={location.pathname === '/feed'}>
          <Home size={20} />
          <span>Feed</span>
        </NavLink>
        <NavLink to="/search" isActive={location.pathname === '/search'}>
          <Search size={20} />
          <span>Search Users</span>
        </NavLink>
        <NavLink 
          to={currentAddress ? `/profile/${currentAddress}` : '/'} 
          isActive={location.pathname === `/profile/${currentAddress}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
        <NavLink 
          to="/wallet" 
          isActive={location.pathname === '/wallet'}
        >
          <Wallet size={20} />
          <span>Wallet</span>
        </NavLink>
      </div>

      <div className={styles.rightSection}>
        <LogoutButton />
      </div>
    </nav>
  );
}

export default Navbar;