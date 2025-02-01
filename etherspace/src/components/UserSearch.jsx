import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import styles from './css/UserSearch.module.css';

import { 
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI 
} from '../config/contracts';

/**
 * UserSearch Component
 * Provides functionality to search and display users who have profiles on the platform
 */
function UserSearch() {
    //state management for search functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [profiledUsers, setProfiledUsers] = useState([]);
    const navigate = useNavigate();

    //effect to fetch all users with profiles when component mounts
    useEffect(() => {
        const fetchProfiledUsers = async () => {
            try {
                //request connection to user's Ethereum wallet
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                //set up blockchain connection
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    PROFILE_CONTRACT_ADDRESS, 
                    PROFILE_CONTRACT_ABI, 
                    provider
                );

                //create promises to fetch each user's profile
                const profilePromises = accounts.map(async (address) => {
                    try {
                        const profileData = await contract.getProfile(address);
                        
                        //only return profiles that exist
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

                //wait for all profile fetches to complete
                const profiles = await Promise.all(profilePromises);
                //filter out any null profiles (failed fetches or non-existent profiles)
                const validProfiles = profiles.filter(profile => profile !== null);
                setProfiledUsers(validProfiles);
            } catch (error) {
                console.error('Error fetching profiled users:', error);
            }
        };

        fetchProfiledUsers();
    }, []);

    /**
     * Handles search input changes and filters users based on search term
     * Searches through both usernames and bios
     */
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const results = profiledUsers.filter(user => 
            user.username.toLowerCase().includes(term) || 
            user.bio.toLowerCase().includes(term)
        );

        setSearchResults(results);
    };

    /**
     * Navigates to a user's profile page when their card is clicked
     */
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