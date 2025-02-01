import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './css/PostComponent.module.css';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
    POST_CONTRACT_ADDRESS, 
    POST_CONTRACT_ABI 
} from '../config/contracts';

/**
 * PostCreation Component
 * Provides an interface for users to create new posts with emoji support
 * Posts are stored on the blockchain through a smart contract
 */
function PostCreation() {
    //state for managing post content and UI elements
    const [postContent, setPostContent] = useState('');
    const [error, setError] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);

    /**
     * Handles emoji insertion
     */
    const handleEmojiSelect = (emoji) => {
        const text = postContent;
        const start = text.substring(0, cursorPosition);
        const end = text.substring(cursorPosition);
        const newText = start + emoji.native + end;
        setPostContent(newText);
        setShowEmojiPicker(false);
    };

    /**
     * Creates a new post on the blockchain
     */
    const handleCreatePost = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                POST_CONTRACT_ADDRESS, 
                POST_CONTRACT_ABI, 
                signer
            );

            const tx = await contract.createPost(postContent);
            await tx.wait();

            setPostContent('');
            setError('');
            setShowEmojiPicker(false);
        } catch (err) {
            console.error('Error creating post:', err);
            setError('Failed to create post');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputContainer}>
                <textarea 
                    value={postContent}
                    onChange={(e) => {
                        setPostContent(e.target.value);
                        setCursorPosition(e.target.selectionStart);
                    }}
                    onSelect={(e) => setCursorPosition(e.target.selectionStart)}
                    maxLength={280}
                    className={styles.textArea}
                    placeholder="What's on your mind? (Max 280 characters)"
                    rows={4}
                />
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={styles.emojiButton}
                >
                    <Smile className={styles.emojiIcon} />
                </button>
            </div>

            {showEmojiPicker && (
                <div className={styles.emojiPickerContainer}>
                    <Picker 
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="light"
                        previewPosition="none"
                    />
                </div>
            )}
            
            {error && <p className={styles.errorText}>{error}</p>}
            <button 
                onClick={handleCreatePost}
                className={styles.postButton}
            >
                Post
            </button>
        </div>
    );
}

/**
 * UserPosts Component
 * Displays and manages a user's posts with editing and deletion capabilities
 * Includes smooth animations for all interactions
 */
function UserPosts({ address }) {
    const [posts, setPosts] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState('');

    //fetch user's posts when component mounts or address changes
    useEffect(() => {
        async function fetchPosts() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    POST_CONTRACT_ADDRESS, 
                    POST_CONTRACT_ABI, 
                    provider
                );

                const userPosts = await contract.getUserPosts(address);
                setPosts(userPosts);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to load posts');
            }
        }

        if (address) {
            fetchPosts();
        }
    }, [address]);

    /**
     * Updates an existing post
     */
    const handleUpdatePost = async (index) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                POST_CONTRACT_ADDRESS, 
                POST_CONTRACT_ABI, 
                signer
            );

            const tx = await contract.updatePost(index, editContent);
            await tx.wait();

            //refresh posts after update
            const updatedPosts = await contract.getUserPosts(address);
            setPosts(updatedPosts);
            
            setEditingIndex(null);
            setEditContent('');
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post');
        }
    };

    /**
     * marks a post as inactive-- soft delete
     */
    const handleDeletePost = async (index) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                POST_CONTRACT_ADDRESS, 
                POST_CONTRACT_ABI, 
                signer
            );

            const tx = await contract.deletePost(index);
            await tx.wait();

            //refresh posts after deletion
            const updatedPosts = await contract.getUserPosts(address);
            setPosts(updatedPosts);
        } catch (err) {
            console.error('Error deleting post:', err);
            setError('Failed to delete post');
        }
    };

    if (error) return <div className={styles.errorText}>{error}</div>;
    const isCurrentUser = address.toLowerCase() === localStorage.getItem('userAddress').toLowerCase();

    return (
        <motion.div 
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.h2 
                className={styles.postTitle}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {isCurrentUser ? "Your posts" : "Posts"}
            </motion.h2>

            <AnimatePresence mode="wait">
                {posts.length === 0 ? (
                    <motion.p 
                        className={styles.noPostsText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        No posts yet
                    </motion.p>
                ) : (
                    <motion.div layout>
                        {posts.map((post, index) => (
                            <motion.div 
                                key={index}
                                className={styles.postCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                layout
                            >
                                {editingIndex === index ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <textarea 
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            maxLength={280}
                                            className={styles.textArea}
                                            rows={4}
                                        />
                                        <div className={styles.buttonContainer}>
                                            <motion.button 
                                                onClick={() => handleUpdatePost(index)}
                                                className={styles.saveButton}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Save
                                            </motion.button>
                                            <motion.button 
                                                onClick={() => setEditingIndex(null)}
                                                className={styles.cancelButton}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div layout>
                                        <motion.p 
                                            className={styles.postContent}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {post.content}
                                        </motion.p>
                                        <motion.div className={styles.timestamp}>
                                            Posted on {new Date(Number(post.timestamp) * 1000).toLocaleString()}
                                        </motion.div>
                                        {isCurrentUser && (
                                            <div className={styles.buttonContainer}>
                                                <motion.button 
                                                    onClick={() => {
                                                        setEditingIndex(index);
                                                        setEditContent(post.content);
                                                    }}
                                                    className={styles.editButton}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Edit
                                                </motion.button>
                                                <motion.button 
                                                    onClick={() => handleDeletePost(index)}
                                                    className={styles.deleteButton}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Delete
                                                </motion.button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export { PostCreation, UserPosts };