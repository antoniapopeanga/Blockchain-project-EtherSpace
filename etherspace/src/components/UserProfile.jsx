import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { PostCreation, UserPosts } from './PostComponent'; // Adjust import path as needed

const PROFILE_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const PROFILE_CONTRACT_ABI = [
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                console.log("Fetching for address:", address);
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    PROFILE_CONTRACT_ADDRESS,
                    PROFILE_CONTRACT_ABI,
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
            } finally {
                setLoading(false);
            }
        }
    
        if (address) {
            fetchProfile();
        } else {
            setError("No address provided");
            setLoading(false);
        }
    }, [address]);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;
    if (!profile || !profile.exists) return <div className="text-center">Profile not found</div>;

    return (
        <div className="flex flex-col items-center bg-gray-100 min-h-screen p-6">
            <div className="p-6 bg-white rounded-lg shadow-md text-center w-full max-w-md mb-6">
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
            
            <div className="w-full max-w-md">
                <PostCreation />
                <UserPosts address={address} />
            </div>
        </div>
    );
}

export default UserProfile;