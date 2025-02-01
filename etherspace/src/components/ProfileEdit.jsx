import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import styles from './css/UserProfile.module.css';

import { 
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI,
    PINATA_JWT
} from '../config/contracts';

/*
 * ProfileEdit Component
 * Allows users to edit their existing profile information including bio and avatar
 * Integrates with blockchain for updates and IPFS for avatar storage
 */
function ProfileEdit({ profile, onUpdate, onCancel }) {
    //initialize state with existing profile data
    const [bio, setBio] = useState(profile.bio);
    const [avatar, setAvatar] = useState(profile.avatar);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handles file selection for avatar update
     * Stores the selected file for later upload
     */
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setAvatar(URL.createObjectURL(file));
        }
    };

    /**
     * Uploads the selected avatar file to IPFS via Pinata
     * Returns the IPFS gateway URL for the uploaded file
     */
    const uploadToIPFS = async (file) => {
        if (!file) return null;

        try {
            const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
            const formData = new FormData();
            formData.append('file', file);

            //prepare metadata for Pinata
            const pinataMetadata = JSON.stringify({
                name: file.name,
                keyvalues: { type: 'avatar' }
            });
            formData.append('pinataMetadata', pinataMetadata);

            const pinataOptions = JSON.stringify({
                cidVersion: 0
            });
            formData.append('pinataOptions', pinataOptions);

            //upload to Pinata
            const response = await axios.post(url, formData, {
                maxBodyLength: Infinity,
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            //return the IPFS gateway URL
            return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw new Error('Failed to upload image');
        }
    };

    /**
     * Handles form submission
     * Updates profile information on the blockchain and IPFS if needed
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            //handle avatar upload if a new file was selected
            let newAvatarUrl = avatar;
            if (selectedFile) {
                newAvatarUrl = await uploadToIPFS(selectedFile);
                if (!newAvatarUrl) {
                    throw new Error('Failed to upload avatar');
                }
             setAvatar(newAvatarUrl);

            }

            //set up blockchain connection
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            //initialize contract with signer for transactions
            const contract = new ethers.Contract(
                PROFILE_CONTRACT_ADDRESS,
                PROFILE_CONTRACT_ABI,
                signer
            );

            console.log('Updating profile with:', {
                bio: bio,
                avatar: newAvatarUrl
            });

            //send transaction to update profile
            const tx = await contract.updateProfile(
                bio,
                newAvatarUrl || '',
                { gasLimit: 500000 }
            );


            await tx.wait();

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
                    
                    <img 
                        src={avatar} 
                        alt="Avatar preview" 
                        className={styles.avatarPreview}
                    />
                    
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