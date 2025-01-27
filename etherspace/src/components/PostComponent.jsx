import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './css/PostComponent.module.css';


const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "string","name": "_content","type": "string"}],
        "name": "createPost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256","name": "_postIndex","type": "uint256"},
            {"internalType": "string","name": "_newContent","type": "string"}
        ],
        "name": "updatePost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256","name": "_postIndex","type": "uint256"}],
        "name": "deletePost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "_user","type": "address"}],
        "name": "getUserPosts",
        "outputs": [
            {
                "components": [
                    {"internalType": "address","name": "author","type": "address"},
                    {"internalType": "string","name": "content","type": "string"},
                    {"internalType": "uint256","name": "timestamp","type": "uint256"},
                    {"internalType": "bool","name": "exists","type": "bool"}
                ],
                "internalType": "struct PostContract.Post[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

function PostCreation() {
    const [postContent, setPostContent] = useState('');
    const [error, setError] = useState('');

    const handleCreatePost = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.createPost(postContent);
            await tx.wait();

            setPostContent('');
            setError('');
        } catch (err) {
            console.error('Error creating post:', err);
            setError('Failed to create post');
        }
    };

    return (
        <div className={styles.container}>
            <textarea 
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                maxLength={280}
                className={styles.textArea}
                placeholder="What's on your mind? (Max 280 characters)"
                rows={4}
            />
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

function UserPosts({ address }) {
    const [posts, setPosts] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchPosts() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

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

    const handleUpdatePost = async (index) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.updatePost(index, editContent);
            await tx.wait();

            // Refresh posts
            const updatedPosts = await contract.getUserPosts(address);
            setPosts(updatedPosts);
            
            setEditingIndex(null);
            setEditContent('');
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post');
        }
    };

    const handleDeletePost = async (index) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.deletePost(index);
            await tx.wait();

            // Refresh posts
            const updatedPosts = await contract.getUserPosts(address);
            setPosts(updatedPosts);
        } catch (err) {
            console.error('Error deleting post:', err);
            setError('Failed to delete post');
        }
    };

    if (error) return <div className={styles.errorText}>{error}</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.postTitle}>Posts</h2>
            {posts.length === 0 ? (
                <p className={styles.noPostsText}>No posts yet</p>
            ) : (
                posts.map((post, index) => (
                    <div key={index} className={styles.postCard}>
                        {editingIndex === index ? (
                            <div>
                                <textarea 
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    maxLength={280}
                                    className={styles.textArea}
                                    rows={4}
                                />
                                <div className={styles.buttonContainer}>
                                    <button 
                                        onClick={() => handleUpdatePost(index)}
                                        className={styles.saveButton}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => setEditingIndex(null)}
                                        className={styles.cancelButton}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className={styles.postContent}>{post.content}</p>
                                <div className={styles.timestamp}>
                                    Posted on {new Date(Number(post.timestamp) * 1000).toLocaleString()}
                                </div>
                                <div className={styles.buttonContainer}>
                                    <button 
                                        onClick={() => {
                                            setEditingIndex(index);
                                            setEditContent(post.content);
                                        }}
                                        className={styles.editButton}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePost(index)}
                                        className={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export { PostCreation, UserPosts };