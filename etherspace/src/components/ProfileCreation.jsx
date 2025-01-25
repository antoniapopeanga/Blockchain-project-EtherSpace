import React, { useState } from 'react';
import { ethers } from 'ethers';

// The contract address and ABI are critical for interacting with your smart contract
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = [
    // Defining the createProfile function exactly as it appears in your smart contract
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_username",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_bio",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_avatar",
                "type": "string"
            }
        ],
        "name": "createProfile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

function ProfileCreation() {
    // State management for our component
    const [account, setAccount] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Function to connect the user's wallet
    async function connectWallet() {
        try {
            if (window.ethereum) {
                // Request account access from MetaMask
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                setAccount(accounts[0]);
                console.log('Connected account:', accounts[0]);
            } else {
                alert('Please install MetaMask to use this feature!');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Error connecting wallet: ' + error.message);
        }
    }

    // Function to handle profile creation
    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!account) {
                throw new Error('Please connect your wallet first');
            }

            // Create provider and signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Create contract instance
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );

            console.log('Sending transaction with:', {
                username,
                bio,
                avatar: avatar || ''
            });

            // Send the transaction
            const tx = await contract.createProfile(
                username,
                bio,
                avatar || '',
                {
                    gasLimit: 200000  // Setting a reasonable gas limit
                }
            );

            console.log('Transaction sent:', tx.hash);
            
            // Wait for transaction to be mined
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            alert('Profile created successfully!');
            
            // Reset form
            setUsername('');
            setBio('');
            setAvatar('');

        } catch (error) {
            console.error('Error details:', error);
            alert('Error creating profile: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
                Create EtherSpace Profile
            </h1>

            {!account ? (
                <button 
                    onClick={connectWallet} 
                    style={{
                        padding: '10px',
                        width: '100%',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Connect Wallet
                </button>
            ) : (
                <div>
                    <p style={{ marginBottom: '20px' }}>
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Username (3-16 characters)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    padding: '8px',
                                    width: '100%',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd'
                                }}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <textarea
                                placeholder="Bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                style={{
                                    padding: '8px',
                                    width: '100%',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    minHeight: '100px'
                                }}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Avatar URL (optional)"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                style={{
                                    padding: '8px',
                                    width: '100%',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd'
                                }}
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            style={{
                                padding: '10px',
                                width: '100%',
                                backgroundColor: isLoading ? '#cccccc' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Profile...' : 'Create Profile'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ProfileCreation;