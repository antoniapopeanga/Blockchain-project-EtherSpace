import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

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
    const navigate = useNavigate();

    async function connectAndCheck() {
        try {
            if (window.ethereum) {
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
                
                if (profileData[3]) { // exists
                    alert('Welcome back!');
                    navigate(`/profile/${userAddress}`);
                } else {
                    alert('No profile found. Redirecting to registration...');
                    navigate('/register');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting wallet: ' + error.message);
        }
    }

    return (
        <div className="max-w-2xl mx-auto text-center p-6">
            <h1 className="text-4xl font-bold mb-8">Welcome to EtherSpace</h1>
            <p className="text-xl mb-8">Connect your wallet to get started</p>
            <button 
                onClick={connectAndCheck}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
            >
                Connect Wallet
            </button>
        </div>
    );
}

export default LandingPage;