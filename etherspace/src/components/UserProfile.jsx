import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { PostCreation, UserPosts } from './PostComponent';
import ProfileEdit from './ProfileEdit';

import styles from './css/UserProfile.module.css';

import { 
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI 
} from '../config/contracts';

function UserProfile() {
    const { address } = useParams();
    return <UserProfileContent address={address} />;
}

function UserProfileContent({ address }) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);


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


    useEffect(() => {
        if (!profile) return; // Only create stars when profile is loaded
    
        const starField = document.createElement('div');
        starField.className = styles.starField;
        
        // Create 20 stars
        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.className = styles.star;
            
            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random animation duration
            star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
            
            // Random animation delay
            star.style.animationDelay = `${Math.random() * 3}s`;
            
            starField.appendChild(star);
        }
        
        const profileCard = document.querySelector(`.${styles.profileCard}`);
        if (profileCard) {
            profileCard.appendChild(starField);
        }
        
        return () => {
            if (starField.parentElement) {
                starField.remove();
            }
        };
    }, [profile]); // Add profile as dependency

    if (loading) return <div className={styles.loadingText}>Loading...</div>;
    if (error) return <div className={styles.errorText}>{error}</div>;
    if (!profile || !profile.exists) return <div className={styles.notFoundText}>Profile not found</div>;
    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleUpdateSuccess = (updatedProfile) => {
        setProfile(updatedProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    
    if (loading) return <div className={styles.loadingText}>Loading...</div>;
    if (error) return <div className={styles.errorText}>{error}</div>;
    if (!profile || !profile.exists) return <div className={styles.notFoundText}>Profile not found</div>;
    
    const isCurrentUser = address.toLowerCase() === localStorage.getItem('userAddress').toLowerCase();



    return (
        <div className={styles.container}>
            {isEditing ? (
                <ProfileEdit 
                    profile={profile}
                    onUpdate={handleUpdateSuccess}
                    onCancel={handleCancel}
                />
            ) : (
                <div className={styles.profileCard}>
                    {profile.avatar ? (
                        <img 
                        src={profile.avatar || '/default_avatar.jpg'} 
                        alt={profile.username}
                        className={styles.avatar}
                        onError={(e) => {
                            console.log('Avatar load error, falling back to default');
                            e.target.src = '/default_avatar.jpg';
                        }} 
                    />
                    ) : (
                        <div className={styles.avatarPlaceholder} />
                    )}
                    <h1 className={styles.username}>{profile.username}</h1>
                    <div className={styles.bioSection}>
                        <h2 className={styles.bioTitle}>Bio</h2>
                        <p className={styles.bioText}>{profile.bio}</p>
                    </div>
                    {isCurrentUser && (
                        <button 
                            onClick={handleEdit}
                            className={styles.editButton}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            )}
            
            <div className={styles.postsSection}>
                {isCurrentUser &&<PostCreation />}
                
                <UserPosts address={address} />
            </div>
        </div>
    );
}

export default UserProfile;