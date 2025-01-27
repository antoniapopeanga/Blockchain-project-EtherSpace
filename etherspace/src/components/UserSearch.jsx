import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import styles from './css/UserSearch.module.css';


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
        <div className={styles.container}>
            <input 
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search users"
                className={styles.searchInput}
            />

            <div>
                {searchTerm && searchResults.length === 0 ? (
                    <p className={styles.noResults}>No users found</p>
                ) : (
                    searchResults.map((user) => (
                        <div 
                            key={user.address} 
                            className={styles.userCard}
                            onClick={() => navigateToProfile(user.address)}
                        >
                            <div className={styles.userInfo}>
                                <h3 className={styles.username}>
                                    {user.username}
                                </h3>
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.username}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder} />
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