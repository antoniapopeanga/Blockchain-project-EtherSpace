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

/**
 * Main UserProfile component that serves as a router wrapper
 * Determines which profile to display
 */
function UserProfile() {
    const { address } = useParams();
    return <UserProfileContent address={address} />;
}

/**
 * Core profile content component that handles the display and management
 * of a user's profile information and posts
 */
function UserProfileContent({ address }) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    //effect to fetch profile data and handle authentication
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

    //effect to handle authentication status
    useEffect(() => {
        const checkAuth = () => {
            const storedAddress = localStorage.getItem('userAddress');
            if (!storedAddress || !window.ethereum) {
                navigate('/');
            }
        };

        checkAuth();
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, [navigate]);

    //stars animation for profile card
    useEffect(() => {
        if (!profile) return;
    
        const starField = document.createElement('div');
        starField.className = styles.starField;
        
        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.className = styles.star;
            
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
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
    }, [profile]);

    const handleEdit = () => setIsEditing(true);
    const handleUpdateSuccess = (updatedProfile) => {
        setProfile(updatedProfile);
        setIsEditing(false);
    };
    const handleCancel = () => setIsEditing(false);


    if (loading) return <div className={styles.loadingText}>Loading...</div>;
    if (error) return <div className={styles.errorText}>{error}</div>;
    if (!profile || !profile.exists) return <div className={styles.notFoundText}>Profile not found</div>;
    
    //check if viewing user is the profile owner
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
                {isCurrentUser && <PostCreation />}
                <UserPosts address={address} />
            </div>
        </div>
    );
}

export default UserProfile;