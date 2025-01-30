import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import styles from './css/UserProfile.module.css';

import { 
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI,
    PINATA_JWT
} from '../config/contracts';

function ProfileEdit({ profile, onUpdate, onCancel }) {
    const [bio, setBio] = useState(profile.bio);
    const [avatar, setAvatar] = useState(profile.avatar);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const uploadToIPFS = async (file) => {
        if (!file) return null;

        try {
            const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
            const formData = new FormData();
            formData.append('file', file);

            const pinataMetadata = JSON.stringify({
                name: file.name,
                keyvalues: {
                    type: 'avatar'
                }
            });
            formData.append('pinataMetadata', pinataMetadata);

            const pinataOptions = JSON.stringify({
                cidVersion: 0
            });
            formData.append('pinataOptions', pinataOptions);

            const response = await axios.post(url, formData, {
                maxBodyLength: Infinity,
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw new Error('Failed to upload image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Upload new avatar if selected
            let newAvatarUrl = avatar;
            if (selectedFile) {
                newAvatarUrl = await uploadToIPFS(selectedFile);
                if (!newAvatarUrl) {
                    throw new Error('Failed to upload avatar');
                }
            }

            // Connect to the blockchain
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Create contract instance with signer
            const contract = new ethers.Contract(
                PROFILE_CONTRACT_ADDRESS,
                PROFILE_CONTRACT_ABI,
                signer
            );

            // Call the updateProfile function with proper parameters
            console.log('Updating profile with:', {
                bio: bio,
                avatar: newAvatarUrl
            });

            const tx = await contract.updateProfile(
                bio,
                newAvatarUrl || '',
                { gasLimit: 500000 }
            );

            // Wait for transaction to be mined
            await tx.wait();

            // Update local state and notify parent component
            onUpdate({
                ...profile,
                bio,
                avatar: newAvatarUrl
            });
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.editForm}>
            <h2 className={styles.editTitle}>Edit Profile</h2>
            {error && <p className={styles.errorText}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="bio">Bio:</label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className={styles.bioInput}
                        rows="4"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="avatar">Avatar:</label>
                    <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    {avatar && !selectedFile && (
                        <img 
                            src={avatar} 
                            alt="Current avatar" 
                            className={styles.avatarPreview}
                        />
                    )}
                </div>

                <div className={styles.buttonGroup}>
                    <button 
                        type="submit" 
                        className={styles.saveButton}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEdit;