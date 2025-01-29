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

function ProfileCreation() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const uploadToIPFS = async (file) => {
        if (!file) return '';
    
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
    
            // Log full response for debugging
            console.log('Pinata Upload Response:', response.data);
    
            // Extract IPFS hash
            const ipfsHash = response.data.IpfsHash || 
                             response.data.hash || 
                             response.data.result?.IpfsHash;
    
            if (!ipfsHash) {
                throw new Error('Failed to extract IPFS hash from Pinata response');
            }
    
            return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        } catch (error) {
            // Comprehensive error logging
            console.error('Pinata Upload Error Details:', {
                fullError: error,
                responseStatus: error.response?.status,
                responseData: error.response?.data,
                errorMessage: error.message,
                requestConfig: error.config
            });
    
            // Detailed error alert
            if (error.response) {
                // Server responded with an error
                alert(`Upload failed: 
                    Status ${error.response.status}
                    ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // Request made but no response received
                alert('Upload failed: No response from Pinata. Check your network connection.');
            } else {
                // Something happened in setting up the request
                alert(`Upload failed: ${error.message}`);
            }
    
            return '';
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            // Upload avatar to IPFS first
            const avatarUrl = await uploadToIPFS(avatar);
    
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const account = await signer.getAddress();  // Get wallet address
    
            const contract = new ethers.Contract(
                PROFILE_CONTRACT_ADDRESS,
                PROFILE_CONTRACT_ABI,
                signer
            );
    
            const tx = await contract.createProfile(
                username,
                bio,
                avatarUrl || '',
                { gasLimit: 1000000 }
            );
    
            await tx.wait();
    
            // Store the wallet address in local state or session storage
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
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles['form-input']}
                        disabled={isLoading}
                    />
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