import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './css/WalletManagement.module.css';

import { 
    ETH_TRANSFER_CONTRACT_ADDRESS, 
    ETH_TRANSFER_CONTRACT_ABI
} from '../config/contracts';

/**
 * WalletManagement Component
 * Provides interface for users to deposit and withdraw ETH from a smart contract
 * Handles real-time balance updates and transaction management
 */
function WalletManagement() {
    //state management for wallet operations
    const [contractBalance, setContractBalance] = useState('0');
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /**
     * Fetches and updates the current balance in the smart contract
     * Converts the balance from wei to ETH for display
     */
    const fetchContractBalance = async (contract) => {
        try {
            const balance = await contract.getBalance();
            setContractBalance(ethers.formatEther(balance));
        } catch (err) {
            console.error('Error fetching balance:', err);
            setError('Failed to fetch balance');
        }
    };

    /**
     * Handles the deposit of ETH into the smart contract
     * Validates input, processes the transaction, and updates the display
     */
    const handleDeposit = async () => {
        try {
            //input validation
            const amount = parseFloat(depositAmount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid deposit amount');
                return;
            }

            //connect to wallet and create contract instance
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const ethTransferContract = new ethers.Contract(
                ETH_TRANSFER_CONTRACT_ADDRESS, 
                ETH_TRANSFER_CONTRACT_ABI, 
                signer
            );
    
            //process deposit transaction
            const depositInWei = ethers.parseEther(depositAmount);
            const tx = await ethTransferContract.deposit({
                value: depositInWei
            });
            await tx.wait();
    
            //update UI after successful deposit
            await fetchContractBalance(ethTransferContract);
            setSuccess(`Deposited ${depositAmount} ETH successfully!`);
            setError('');
            setDepositAmount('');
        } catch (err) {
            console.error('Deposit error:', err);
            handleTransactionError(err, 'deposit');
        }
    };

    /**
     * Handles the withdrawal of ETH from the smart contract
     * Validates input, processes the transaction, and updates the display
     */
    const handleWithdraw = async () => {
        try {
            //input validation
            const amount = parseFloat(withdrawAmount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid withdrawal amount');
                return;
            }

            //connect to wallet and create contract instance
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const ethTransferContract = new ethers.Contract(
                ETH_TRANSFER_CONTRACT_ADDRESS, 
                ETH_TRANSFER_CONTRACT_ABI, 
                signer
            );
    
            //process withdrawal transaction
            const withdrawInWei = ethers.parseEther(withdrawAmount);
            const tx = await ethTransferContract.withdraw(withdrawInWei);
            await tx.wait();
    
            //update UI after successful withdrawal
            await fetchContractBalance(ethTransferContract);
            setSuccess(`Withdrawn ${withdrawAmount} ETH successfully!`);
            setError('');
            setWithdrawAmount('');
        } catch (err) {
            console.error('Withdrawal error:', err);
            handleTransactionError(err, 'withdraw');
        }
    };

    /**
     * Helper function to handle different types of transaction errors
     */
    const handleTransactionError = (err, operation) => {
        if (err.code === 'ACTION_REJECTED') {
            setError(`${operation} was rejected by the user`);
        } else if (err.info && err.info.error) {
            setError(`Failed to ${operation}: ${err.info.error.message}`);
        } else if (err.reason) {
            setError(`Failed to ${operation}: ${err.reason}`);
        } else {
            setError(`Failed to ${operation}: ${err.message}`);
        }
        setSuccess('');
    };

    //initialize contract and fetch initial balance
    useEffect(() => {
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