import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
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
        <div className="max-w-md mx-auto mt-6">
            <textarea 
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                maxLength={280}
                className="w-full p-2 border rounded"
                placeholder="What's on your mind? (Max 280 characters)"
                rows={4}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button 
                onClick={handleCreatePost}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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

    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="max-w-md mx-auto mt-6">
            <h2 className="text-xl font-bold mb-4">Posts</h2>
            {posts.length === 0 ? (
                <p className="text-gray-500">No posts yet</p>
            ) : (
                posts.map((post, index) => (
                    <div 
                        key={index} 
                        className="bg-white border rounded p-4 mb-4 shadow-sm"
                    >
                        {editingIndex === index ? (
                            <div>
                                <textarea 
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    maxLength={280}
                                    className="w-full p-2 border rounded mb-2"
                                    rows={4}
                                />
                                <div className="flex justify-between">
                                    <button 
                                        onClick={() => handleUpdatePost(index)}
                                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => setEditingIndex(null)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p>{post.content}</p>
                                <div className="text-sm text-gray-500 mt-2">
                                    Posted on {new Date(Number(post.timestamp) * 1000).toLocaleString()}
                                </div>
                                <div className="flex justify-between mt-2">
                                    <button 
                                        onClick={() => {
                                            setEditingIndex(index);
                                            setEditContent(post.content);
                                        }}
                                        className="bg-blue-500 text-white px-4 py-1 rounded mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePost(index)}
                                        className="bg-red-500 text-white px-4 py-1 rounded"
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