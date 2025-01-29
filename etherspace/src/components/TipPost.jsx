import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './css/TipPost.module.css';

import { 
    ETH_TRANSFER_CONTRACT_ADDRESS, 
    ETH_TRANSFER_CONTRACT_ABI,
    POST_CONTRACT_ADDRESS,
    POST_CONTRACT_ABI
} from '../config/contracts';

const TipPost = ({ post, authorAddress }) => {
    const [tipAmount, setTipAmount] = useState('0.01');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tipCount, setTipCount] = useState(0);
    const [userBalance, setUserBalance] = useState('0');
    const [totalTips, setTotalTips] = useState(0);
    const [averageTip, setAverageTip] = useState(0);


    // Check and update user's contract balance
    const fetchUserBalance = async (contract) => {
        try {
            const balance = await contract.getBalance();
            setUserBalance(ethers.formatEther(balance));
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };

    const fetchPostTipStats = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const postContract = new ethers.Contract(
                POST_CONTRACT_ADDRESS,
                POST_CONTRACT_ABI,
                provider
            );
    
            const [tipCount, totalTips] = await postContract.getPostTipStats(authorAddress, post.index);
    
            setTipCount(Number(tipCount));
            setTotalTips(ethers.formatEther(totalTips)); // Convert after fetching
    
            if (Number(tipCount) > 0) {
                const avgTip = await postContract.calculateAverageTip(totalTips, tipCount);
                setAverageTip(ethers.formatEther(avgTip)); // Convert only after calculation
            } else {
                setAverageTip(0);
            }
        } catch (err) {
            console.error("Error fetching tip stats:", err);
        }
    };
    

    const handleTip = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
    
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
    
            const ethTransferContract = new ethers.Contract(
                ETH_TRANSFER_CONTRACT_ADDRESS,
                ETH_TRANSFER_CONTRACT_ABI,
                signer
            );
    
            const postContract = new ethers.Contract(
                POST_CONTRACT_ADDRESS,
                POST_CONTRACT_ABI,
                signer
            );
    
            // Convert tip amount to wei
            const tipInWei = ethers.parseEther(tipAmount);
    
            // Listen for Transfer event and trigger recordTip
            ethTransferContract.once("Transfer", async (from, to, amount) => {
                console.log(`Transfer detected: ${from} sent ${amount} ETH to ${to}`);
    
                try {
                    // Now that ETH transfer succeeded, record the tip
                    const tipTx = await postContract.recordTip(authorAddress, post.index, tipInWei);
                    await tipTx.wait();
                    
                    // Update UI
                    await fetchPostTipStats();
                    setSuccess(`Tipped ${tipAmount} ETH successfully!`);
                } catch (err) {
                    console.error('Record Tip failed:', err);
                    setError('Tip recording failed: ' + (err.message || 'Unknown error'));
                }
            });
    
            // Perform the transfer (this will emit the event)
            const tx = await ethTransferContract.transferTo(authorAddress, tipInWei);
            await tx.wait();
    
        } catch (err) {
            console.error('Unexpected error:', err);
            setError(`Failed to tip post: ${err.message || 'Unknown error'}`);
            setSuccess('');
        }
    };
    

    // Fetch balance on component mount
    useEffect(() => {
        fetchPostTipStats();
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
    },[post.index, authorAddress]);

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
            <span>Total Tips: {tipCount} ETH</span>
            <span>Average Tip: {averageTip} ETH</span>
            </div>
        </div>
    );
};

export default TipPost;