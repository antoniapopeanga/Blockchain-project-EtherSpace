import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Modal from './Modal';
import styles from './css/LandingPage.module.css';
import logo from './css/logo.png'; 


import { 
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI 
} from '../config/contracts';

function LandingPage() {
    const [account, setAccount] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [showExistingProfileModal, setShowExistingProfileModal] = useState(false);
    const [showNoProfileModal, setShowNoProfileModal] = useState(false);
    const navigate = useNavigate();

    async function connectAndCheck() {
        try {
            setIsConnecting(true);
            
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to use this application');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            const userAddress = accounts[0];
            setAccount(userAddress);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                PROFILE_CONTRACT_ADDRESS,
                PROFILE_CONTRACT_ABI,
                provider
            );

            const profileData = await contract.getProfile(userAddress);
            
            if (profileData[3]) {
                setShowExistingProfileModal(true);
            } else {
                setShowNoProfileModal(true);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting wallet: ' + error.message);
        } finally {
            setIsConnecting(false);
        }
    }

    const handleExistingProfileConfirm = () => {
        localStorage.setItem('userAddress', account);
        navigate(`/profile/${account}`, { replace: true });
        setShowExistingProfileModal(false);
    };

    const handleNoProfileConfirm = () => {
        localStorage.setItem('userAddress', account);
        navigate('/register', { replace: true });
        setShowNoProfileModal(false);
    };

    const handleCancel = () => {
        setShowExistingProfileModal(false);
        setShowNoProfileModal(false);
    };

    //stars animation
    useEffect(() => {
        const starField = document.createElement('div');
        starField.className = styles.starField;
        
        // Create 20 stars
        for (let i = 0; i < 60; i++) {
            const star = document.createElement('div');
            star.className = styles.star;
            
            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random animation duration
            star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
            
            // Random animation delay
            star.style.animationDelay = `${Math.random() * 3}s`;
            
            starField.appendChild(star);
        }
        
        const logoContainer = document.querySelector(`.${styles['logo-container']}`);
        if (logoContainer) {
            logoContainer.appendChild(starField);
        }
        
        return () => starField.remove();
    }, []);

    return (
        <div className={`${styles.container} ${styles.fadeIn}`}>
           <div className={styles['logo-container']}>
                <img 
                    src={logo} 
                    alt="EtherSpace Logo" 
                    className={styles.logo}
                />
            </div>
            <h1 className={styles.title}>Welcome to EtherSpace</h1>
            <p className={styles.subtitle}>Connect your wallet to get started</p>
            <button 
                onClick={connectAndCheck}
                className={styles.connectButton}
                disabled={isConnecting}
            >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>

            {showExistingProfileModal && (
                <Modal
                    message="This wallet is already linked to a profile. Redirecting to your profile."
                    onConfirm={handleExistingProfileConfirm}
                    onCancel={handleCancel}
                />
            )}

            {showNoProfileModal && (
                <Modal
                    message="This wallet doesn't have a profile yet. Would you like to create one?"
                    onConfirm={handleNoProfileConfirm}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}

export default LandingPage;