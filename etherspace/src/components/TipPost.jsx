import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './css/TipPost.module.css';

import { 
    ETH_TRANSFER_CONTRACT_ADDRESS, 
    ETH_TRANSFER_CONTRACT_ABI,
} from '../config/contracts';

const TipPost = ({ post, authorAddress }) => {
    const [tipAmount, setTipAmount] = useState('0.01');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tipCount, setTipCount] = useState(0);
    const [userBalance, setUserBalance] = useState('0');

    // Check and update user's contract balance
    const fetchUserBalance = async (contract) => {
        try {
            const balance = await contract.getBalance();
            setUserBalance(ethers.formatEther(balance));
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };


    const handleTip = async () => {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Create contract instances
            const ethTransferContract = new ethers.Contract(
                ETH_TRANSFER_CONTRACT_ADDRESS, 
                ETH_TRANSFER_CONTRACT_ABI, 
                signer
            );
    
            // Convert tip amount to wei
            const tipInWei = ethers.parseEther(tipAmount);
    
            // Perform the transfer
            const tx = await ethTransferContract.transferTo(authorAddress, tipInWei);
            
            // Wait for transaction confirmation
            await tx.wait();
    
            // Update tip count 
            setTipCount(prevCount => prevCount + 1);
    
            // Fetch updated balance
            await fetchUserBalance(ethTransferContract);
    
            // Show success message
            setSuccess(`Tipped ${tipAmount} ETH successfully!`);
            setError('');
        } catch (err) {
            console.error('Full error:', err);
            
            // Error handling
            if (err.code === 'ACTION_REJECTED') {
                setError('Transaction was rejected by the user');
            } else if (err.info && err.info.error) {
                setError(`Failed to tip post: ${err.info.error.message}`);
            } else if (err.reason) {
                setError(`Failed to tip post: ${err.reason}`);
            } else {
                setError(`Failed to tip post: ${err.message}`);
            }
            setSuccess('');
        }
    };

    // Fetch balance on component mount
    useEffect(() => {
        const initializeBalance = async () => {
            try {
                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                // Create provider and signer
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                
                // Create contract instances
                const ethTransferContract = new ethers.Contract(
                    ETH_TRANSFER_CONTRACT_ADDRESS, 
                    ETH_TRANSFER_CONTRACT_ABI, 
                    signer
                );

                // Fetch initial balance
                await fetchUserBalance(ethTransferContract);
            } catch (err) {
                console.error('Error initializing:', err);
            }
        };

        initializeBalance();
    }, []);

    return (
        <div className={styles.tipContainer}>
            <div className={styles.tipStats}>
                <span>Your Contract Balance: {userBalance} ETH</span>
            </div>
            <div className={styles.tipInputContainer}>
                <input 
                    type="number" 
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className={styles.tipInput}
                    placeholder="Tip amount (ETH)"
                />
                <button 
                    onClick={handleTip}
                    className={styles.tipButton}
                    disabled={parseFloat(tipAmount) > parseFloat(userBalance)}
                >
                    Tip Post
                </button>
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            {success && <p className={styles.successText}>{success}</p>}
            <div className={styles.tipStats}>
                <span>Tips: {tipCount}</span>
            </div>
        </div>
    );
};

export default TipPost;