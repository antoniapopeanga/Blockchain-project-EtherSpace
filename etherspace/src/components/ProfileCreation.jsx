import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';


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
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const account = await signer.getAddress();
            
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );

            const tx = await contract.createProfile(
                username,
                bio,
                avatar || '',
                { gasLimit: 500000 }
            );

            const receipt = await tx.wait();
            alert('Profile created successfully!');
            navigate(`/profile/${account}`);

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
    );
}

export default ProfileCreation;