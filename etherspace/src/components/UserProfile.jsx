import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { PostCreation, UserPosts } from './PostComponent';
import styles from './css/UserProfile.module.css';

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

function UserProfileContent({ address }) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndFetchProfile = async () => {
            const storedAddress = localStorage.getItem('userAddress');
            if (!storedAddress || !window.ethereum) {
                navigate('/');
                return;
            }

            try {
                setLoading(true);
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    PROFILE_CONTRACT_ADDRESS,
                    PROFILE_CONTRACT_ABI,
                    provider
                );
    
                const profileData = await contract.getProfile(address);
                setProfile({
                    username: profileData[0],
                    bio: profileData[1],
                    avatar: profileData[2],
                    exists: profileData[3]
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
    
        if (address) {
            checkAuthAndFetchProfile();
        } else {
            setError("No address provided");
            setLoading(false);
        }
    }, [address, navigate]);

    // Add another effect to handle logout
    useEffect(() => {
        const checkAuth = () => {
            const storedAddress = localStorage.getItem('userAddress');
            if (!storedAddress || !window.ethereum) {
                navigate('/');
            }
        };

        // Check immediately
        checkAuth();

        // Set up an interval to check periodically
        const interval = setInterval(checkAuth, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [navigate]);

    if (loading) return <div className={styles.loadingText}>Loading...</div>;
    if (error) return <div className={styles.errorText}>{error}</div>;
    if (!profile || !profile.exists) return <div className={styles.notFoundText}>Profile not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                {profile.avatar ? (
                    <img 
                        src={profile.avatar} 
                        alt={profile.username}
                        className={styles.avatar}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/128'} 
                    />
                ) : (
                    <div className={styles.avatarPlaceholder} />
                )}
                <h1 className={styles.username}>{profile.username}</h1>
                <div className={styles.bioSection}>
                    <h2 className={styles.bioTitle}>Bio</h2>
                    <p className={styles.bioText}>{profile.bio}</p>
                </div>
            </div>
            
            <div className={styles.postsSection}>
                <PostCreation />
                <UserPosts address={address} />
            </div>
        </div>
    );
}

export default UserProfile;