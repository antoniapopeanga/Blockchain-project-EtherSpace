import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './css/ProfileCreation.module.css';

import { 
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI,
    PINATA_JWT 
} from '../config/contracts';

/**
 * ProfileCreation Component
 * Handles the creation of user profiles with avatar upload functionality
 * Integrates with Ethereum blockchain and IPFS for decentralized storage
 */
function ProfileCreation() {
    //navigation and state management
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handles file selection for avatar upload
     * Creates a preview URL for the selected image
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    /**
     * Uploads file to IPFS using Pinata service
     * Falls back to default avatar(default_avatar.png) if no file is provided
     */
    const uploadToIPFS = async (file) => {
        try {
            const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
            const formData = new FormData();
    
            //handle default avatar
            if (!file) {
                const response = await fetch('/default_avatar.jpg');
                const blob = await response.blob();
                formData.append('file', blob, 'default_avatar.jpg');
            } else {
                formData.append('file', file);
            }
    
            //prepare metadata for Pinata
            const pinataMetadata = JSON.stringify({
                name: file ? file.name : 'default_avatar.jpg',
                keyvalues: { type: 'avatar' }
            });
            formData.append('pinataMetadata', pinataMetadata);
    
            const pinataOptions = JSON.stringify({
                cidVersion: 0
            });
            formData.append('pinataOptions', pinataOptions);
    
            //make request to Pinata
            const response = await axios.post(url, formData, {
                maxBodyLength: Infinity,
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            console.log('Pinata Upload Response:', response.data);
    
            //extract IPFS hash from response
            const ipfsHash = response.data.IpfsHash || 
                           response.data.hash || 
                           response.data.result?.IpfsHash;
    
            if (!ipfsHash) {
                throw new Error('Failed to extract IPFS hash from Pinata response');
            }
    
            return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        } catch (error) {
            console.error('Pinata Upload Error Details:', {
                fullError: error,
                responseStatus: error.response?.status,
                responseData: error.response?.data,
                errorMessage: error.message,
                requestConfig: error.config
            });
    
            if (error.response) {
                alert(`Upload failed: \n    Status ${error.response.status}\n    ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                alert('Upload failed: No response from Pinata. Check your network connection.');
            } else {
                alert(`Upload failed: ${error.message}`);
            }
    
            return '';
        }
    };

    /**
     * Handles form submission
     * Creates blockchain profile and stores avatar on IPFS
     */
    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            //upload avatar to IPFS
            const avatarUrl = await uploadToIPFS(avatar);
    
            //set up blockchain connection
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const account = await signer.getAddress();
    
            //initialize smart contract
            const contract = new ethers.Contract(
                PROFILE_CONTRACT_ADDRESS,
                PROFILE_CONTRACT_ABI,
                signer
            );
    
            //create profile on blockchain
            const tx = await contract.createProfile(
                username,
                bio,
                avatarUrl || '',
                { gasLimit: 1000000 }
            );
    
            await tx.wait();
    
            //store user address and redirect
            localStorage.setItem('userAddress', account);
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
                    <div className={styles['file-input-container']}>
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles['file-input']}
                            disabled={isLoading}
                        />
                        <label 
                            htmlFor="avatar-upload" 
                            className={`${styles['file-input-label']} ${isLoading ? styles.disabled : ''}`}
                        >
                            {avatar ? 'Change Avatar' : 'Choose Avatar'}
                        </label>
                        {avatar && (
                            <div className={styles['file-name']}>
                                {avatar.name}
                            </div>
                        )}
                    </div>
                    {avatarPreview && (
                        <img 
                            src={avatarPreview} 
                            alt="Avatar Preview" 
                            className={styles['avatar-preview']}
                        />
                    )}
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