import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, User, Wallet, Menu } from 'lucide-react';
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

function NavLink({ to, children, isActive, onClick }) {
  return (
    <Link 
      to={to} 
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function Navbar() {
  const location = useLocation();
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem('userAddress');
    if (storedAddress) {
      setCurrentAddress(storedAddress);
    } else {
      setCurrentAddress(null);
    }
  }, [location.pathname]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const navbar = document.querySelector(`.${styles.navbar}`);
    if (navbar) {
      const starField = document.createElement('div');
      starField.className = styles.starField;
      
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = styles.star;
        
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        starField.appendChild(star);
      }
      
      navbar.appendChild(starField);
      return () => starField.remove();
    }
  }, []);

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

      <button 
        className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} color="white" />
      </button>

      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)}></div>
      
      <div className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
        <NavLink 
          to="/feed" 
          isActive={location.pathname === '/feed'}
          onClick={() => setIsOpen(false)}
        >
          <Home size={20} />
          <span>Feed</span>
        </NavLink>
        <NavLink 
          to="/search" 
          isActive={location.pathname === '/search'}
          onClick={() => setIsOpen(false)}
        >
          <Search size={20} />
          <span>Search Users</span>
        </NavLink>
        <NavLink 
          to={currentAddress ? `/profile/${currentAddress}` : '/'} 
          isActive={location.pathname === `/profile/${currentAddress}`}
          onClick={() => setIsOpen(false)}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
        <NavLink 
          to="/wallet" 
          isActive={location.pathname === '/wallet'}
          onClick={() => setIsOpen(false)}
        >
          <Wallet size={20} />
          <span>Wallet</span>
        </NavLink>
        <div className={styles.mobileLogout}>
          <LogoutButton />
        </div>
      </div>

      <div className={styles.rightSection}>
        <LogoutButton />
      </div>
    </nav>
  );
}

export default Navbar;