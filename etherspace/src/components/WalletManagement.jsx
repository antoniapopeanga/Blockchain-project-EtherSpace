import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './css/WalletManagement.module.css';

import { 
    ETH_TRANSFER_CONTRACT_ADDRESS, 
    ETH_TRANSFER_CONTRACT_ABI
} from '../config/contracts';

function WalletManagement() {
    const [contractBalance, setContractBalance] = useState('0');
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch contract balance
    const fetchContractBalance = async (contract) => {
        try {
            const balance = await contract.getBalance();
            setContractBalance(ethers.formatEther(balance));
        } catch (err) {
            console.error('Error fetching balance:', err);
            setError('Failed to fetch balance');
        }
    };

    // Deposit funds
    const handleDeposit = async () => {
        try {
            // Validate input
            const amount = parseFloat(depositAmount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid deposit amount');
                return;
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Create contract instance
            const ethTransferContract = new ethers.Contract(
                ETH_TRANSFER_CONTRACT_ADDRESS, 
                ETH_TRANSFER_CONTRACT_ABI, 
                signer
            );
    
            // Convert deposit amount to wei
            const depositInWei = ethers.parseEther(depositAmount);
    
            // Deposit ETH into the contract
            const tx = await ethTransferContract.deposit({
                value: depositInWei
            });
            
            // Wait for transaction confirmation
            await tx.wait();
    
            // Fetch updated balance
            await fetchContractBalance(ethTransferContract);
    
            // Show success message
            setSuccess(`Deposited ${depositAmount} ETH successfully!`);
            setError('');
            setDepositAmount('');
        } catch (err) {
            console.error('Deposit error:', err);
            
            // Error handling
            if (err.code === 'ACTION_REJECTED') {
                setError('Deposit was rejected by the user');
            } else if (err.info && err.info.error) {
                setError(`Failed to deposit: ${err.info.error.message}`);
            } else if (err.reason) {
                setError(`Failed to deposit: ${err.reason}`);
            } else {
                setError(`Failed to deposit: ${err.message}`);
            }
            setSuccess('');
        }
    };

    // Withdraw funds
    const handleWithdraw = async () => {
        try {
            // Validate input
            const amount = parseFloat(withdrawAmount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid withdrawal amount');
                return;
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Create provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Create contract instance
            const ethTransferContract = new ethers.Contract(
                ETH_TRANSFER_CONTRACT_ADDRESS, 
                ETH_TRANSFER_CONTRACT_ABI, 
                signer
            );
    
            // Convert withdrawal amount to wei
            const withdrawInWei = ethers.parseEther(withdrawAmount);
    
            // Withdraw ETH from the contract
            const tx = await ethTransferContract.withdraw(withdrawInWei);
            
            // Wait for transaction confirmation
            await tx.wait();
    
            // Fetch updated balance
            await fetchContractBalance(ethTransferContract);
    
            // Show success message
            setSuccess(`Withdrawn ${withdrawAmount} ETH successfully!`);
            setError('');
            setWithdrawAmount('');
        } catch (err) {
            console.error('Withdrawal error:', err);
            
            // Error handling
            if (err.code === 'ACTION_REJECTED') {
                setError('Withdrawal was rejected by the user');
            } else if (err.info && err.info.error) {
                setError(`Failed to withdraw: ${err.info.error.message}`);
            } else if (err.reason) {
                setError(`Failed to withdraw: ${err.reason}`);
            } else {
                setError(`Failed to withdraw: ${err.message}`);
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
                
                // Create contract instance
                const ethTransferContract = new ethers.Contract(
                    ETH_TRANSFER_CONTRACT_ADDRESS, 
                    ETH_TRANSFER_CONTRACT_ABI, 
                    signer
                );

                // Fetch initial balance
                await fetchContractBalance(ethTransferContract);
            } catch (err) {
                console.error('Error initializing:', err);
            }
        };

        initializeBalance();
    }, []);

    return (
        <div className={styles.walletContainer}>
            <h2>Wallet Management</h2>
            
            <div className={styles.balanceDisplay}>
                <p>Contract Balance: <span>{contractBalance}</span> ETH</p>
            </div>

            <div className={styles.actionSection}>
                <div className={styles.depositSection}>
                    <h3>Deposit Funds</h3>
                    <input 
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Amount to deposit (ETH)"
                        min="0"
                        step="0.01"
                        className={styles.inputField}
                    />
                    <button 
                        onClick={handleDeposit}
                        className={styles.actionButton}
                    >
                        Deposit
                    </button>
                </div>

                <div className={styles.withdrawSection}>
                    <h3>Withdraw Funds</h3>
                    <input 
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Amount to withdraw (ETH)"
                        min="0"
                        step="0.01"
                        className={styles.inputField}
                    />
                    <button 
                        onClick={handleWithdraw}
                        className={styles.actionButton}
                        disabled={parseFloat(withdrawAmount) > parseFloat(contractBalance)}
                    >
                        Withdraw
                    </button>
                </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
            {success && <p className={styles.successText}>{success}</p>}
        </div>
    );
}

export default WalletManagement;