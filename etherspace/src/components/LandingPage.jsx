import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Modal from './Modal';
import styles from './css/LandingPage.module.css';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "address","name": "_address","type": "address"}],
        "name": "getProfile",
        "outputs": [
            {"internalType": "string","name": "username","type": "string"},
            {"internalType": "string","name": "bio","type": "string"},
            {"internalType": "string","name": "avatar","type": "string"},
            {"internalType": "bool","name": "exists","type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

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
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
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

    return (
        <div className={`${styles.container} ${styles.fadeIn}`}>
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