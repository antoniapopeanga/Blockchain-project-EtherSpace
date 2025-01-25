import React, { useState, useEffect } from 'react';
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

function UserSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [profiledUsers, setProfiledUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfiledUsers = async () => {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

                const profilePromises = accounts.map(async (address) => {
                    try {
                        const profileData = await contract.getProfile(address);
                        
                        if (profileData[3]) {
                            return {
                                address,
                                username: profileData[0],
                                bio: profileData[1],
                                avatar: profileData[2]
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error(`Error fetching profile for ${address}:`, error);
                        return null;
                    }
                });

                const profiles = await Promise.all(profilePromises);
                const validProfiles = profiles.filter(profile => profile !== null);
                setProfiledUsers(validProfiles);
            } catch (error) {
                console.error('Error fetching profiled users:', error);
            }
        };

        fetchProfiledUsers();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const results = profiledUsers.filter(user => 
            user.username.toLowerCase().includes(term) || 
            user.bio.toLowerCase().includes(term)
        );

        setSearchResults(results);
    };

    const navigateToProfile = (address) => {
        navigate(`/profile/${address}`);
    };

    return (
        <div className="max-w-md mx-auto mt-6">
            <input 
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search users"
                className="w-full p-2 border rounded mb-4"
            />

            <div>
                {searchTerm && searchResults.length === 0 ? (
                    <p className="text-gray-500">No users found</p>
                ) : (
                    searchResults.map((user) => (
                        <div 
                            key={user.address} 
                            className="flex items-center justify-between bg-white border rounded p-4 mb-4 cursor-pointer hover:bg-gray-100"
                            onClick={() => navigateToProfile(user.address)}
                        >
                            <div className="flex items-center">
                                <h3 className="text-lg font-bold mr-2">{user.username}</h3>
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                        style={{ width: '2rem', height: '2rem', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default UserSearch;