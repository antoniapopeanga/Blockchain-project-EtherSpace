import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';



const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = [
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
    },
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

function UserProfile() {
    const { address } = useParams();
    return <UserProfileContent address={address} />;
}

function UserProfileContent({ address })  {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchProfile() {
            try {
                console.log("Fetching for address:", address);
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    CONTRACT_ABI,
                    provider
                );
    
                const profileData = await contract.getProfile(address);
                console.log("Profile data:", profileData);
                
                setProfile({
                    username: profileData[0],
                    bio: profileData[1],
                    avatar: profileData[2],
                    exists: profileData[3]
                });
            } catch (err) {
                setError('Failed to load profile');
                console.error("Error details:", err);
            }
        }
    
        if (address) {
            fetchProfile();
        } else {
            console.log("No address provided");
        }
    }, [address]);

    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!profile) return <div className="text-center">Loading...</div>;
    if (!profile.exists) return <div className="text-center">Profile not found</div>;

    return (
        <div
            className="flex items-center justify-center h-screen bg-gray-100"
        >
            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                {profile.avatar ? (
                    <img 
                        src={profile.avatar} 
                        alt={profile.username}
                        className="w-32 h-32 rounded-full mx-auto mb-4"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/128'} 
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200" />
                )}
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Bio</h2>
                    <p className="text-gray-700">{profile.bio}</p>
                </div>
            </div>
        </div>
    );
    
}

export default UserProfile;