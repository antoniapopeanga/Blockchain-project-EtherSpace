import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import styles from './css/TipPost.module.css';

import { 
    ETH_TRANSFER_CONTRACT_ADDRESS, 
    ETH_TRANSFER_CONTRACT_ABI,
    POST_CONTRACT_ADDRESS,
    POST_CONTRACT_ABI
} from '../config/contracts';

/**
 * TipPost Component
 * Allows users to send ETH tips to post authors
 * Tracks and displays tipping statistics for each post
 */
const TipPost = ({ post, authorAddress }) => {
    //state management for tipping functionality
    const [tipAmount, setTipAmount] = useState('0.01');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    //state for tip statistics
    const [tipCount, setTipCount] = useState(0);
    const [userBalance, setUserBalance] = useState('0');
    const [averageTip, setAverageTip] = useState(0);

    /**
     * Fetches and updates the user's available balance
     */
    const fetchUserBalance = async (contract) => {
        try {
            const balance = await contract.getBalance();
            setUserBalance(ethers.formatEther(balance));
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };

    /**
     * Fetches statistics about tips given to this post
     * Including tip count and average tip amount
     */
    const fetchPostTipStats = useCallback(async () => {
        try {
            //connect to Ethereum provider
            const provider = new ethers.BrowserProvider(window.ethereum);
            const postContract = new ethers.Contract(
                POST_CONTRACT_ADDRESS,
                POST_CONTRACT_ABI,
                provider
            );
    
            //get tip statistics from the blockchain
            const [tipCount, rawTotalTips] = await postContract.getPostTipStats(
                authorAddress, 
                post.index
            );
    
            //update tip count state
            setTipCount(Number(tipCount));
    
           
            if (Number(tipCount) > 0) {
                const avgTip = await postContract.calculateAverageTip(rawTotalTips, tipCount);
                setAverageTip(ethers.formatEther(avgTip));
            } else {
                setAverageTip(0);
            }
        } catch (err) {
            console.error("Error fetching tip stats:", err);
        }
    }, [authorAddress, post.index]); 

    /**
     * Handles the tipping process
     * Transfers ETH to author and records the tip in the contract
     */
    const handleTip = async () => {
        try {
            //connect to user's wallet
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
    
            //initialize contract instances
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
    
            //convert tip amount to blockchain format (wei)
            const tipInWei = ethers.parseEther(tipAmount);
    
            //listen for successful transfer before recording tip
            ethTransferContract.once("Transfer", async (from, to, amount) => {
                console.log(`Transfer detected: ${from} sent ${amount} ETH to ${to}`);
    
                try {
                    //record the tip in the post contract
                    const tipTx = await postContract.recordTip(
                        authorAddress, 
                        post.index, 
                        tipInWei
                    );
                    await tipTx.wait();
                    
                    //update UI with new statistics
                    await fetchPostTipStats();
                    setSuccess(`Tipped ${tipAmount} ETH successfully!`);
                } catch (err) {
                    console.error('Record Tip failed:', err);
                    setError('Tip recording failed: ' + (err.message || 'Unknown error'));
                }
            });
    
            //perform the ETH transfer
            const tx = await ethTransferContract.transferTo(authorAddress, tipInWei);
            await tx.wait();
    
        } catch (err) {
            console.error('Unexpected error:', err);
            setError(`Failed to tip post: ${err.message || 'Unknown error'}`);
            setSuccess('');
        }
    };

    //initialize component and fetch initial data
    useEffect(() => {
        fetchPostTipStats();
        
        const initializeBalance = async () => {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                
                const ethTransferContract = new ethers.Contract(
                    ETH_TRANSFER_CONTRACT_ADDRESS, 
                    ETH_TRANSFER_CONTRACT_ABI, 
                    signer
                );

                await fetchUserBalance(ethTransferContract);
            } catch (err) {
                console.error('Error initializing:', err);
            }
        };

        initializeBalance();
    }, [fetchPostTipStats, post.index, authorAddress]); 

    return (
        <div className={styles.tipContainer}>
            <div className={styles.balanceSection}>
                Your Wallet Balance: {userBalance} ETH
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
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Total Tips</span>
                    <span className={styles.statValue}>{tipCount}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Average Tip</span>
                    <span className={styles.statValue}>{Number(averageTip).toFixed(3)} ETH</span>
                </div>

            </div>
        </div>
    );
}

export default TipPost;