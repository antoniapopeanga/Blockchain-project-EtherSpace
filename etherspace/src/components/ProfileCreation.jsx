import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import styles from './css/ProfileCreation.module.css';

import { 
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI 
} from '../config/contracts';

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
                PROFILE_CONTRACT_ADDRESS,
                PROFILE_CONTRACT_ABI,
                signer
            );

            const tx = await contract.createProfile(
                username,
                bio,
                avatar || '',
                { gasLimit: 1000000 }
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
        <div className={styles['profile-creation-container']}>
            <h1 className={styles['profile-creation-title']}>
                Create EtherSpace Profile
            </h1>
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <input
                        type="text"
                        placeholder="Username (3-16 characters)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles['form-input']}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className={styles['form-group']}>
                    <textarea
                        placeholder="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className={styles['form-textarea']}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className={styles['form-group']}>
                    <input
                        type="text"
                        placeholder="Avatar URL (optional)"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className={styles['form-input']}
                        disabled={isLoading}
                    />
                </div>
                <button 
                    type="submit" 
                    className={styles['submit-button']}
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating Profile...' : 'Create Profile'}
                </button>
            </form>
        </div>
    );
}

export default ProfileCreation;