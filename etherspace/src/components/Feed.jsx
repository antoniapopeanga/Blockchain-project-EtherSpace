import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from './css/Feed.module.css';
import { useNavigate } from 'react-router-dom';
import TipPost from './TipPost';

import { 
    POST_CONTRACT_ADDRESS, 
    POST_CONTRACT_ABI,
    PROFILE_CONTRACT_ADDRESS,
    PROFILE_CONTRACT_ABI 
} from '../config/contracts';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [contract, setContract] = useState(null);
    const [profileContract, setProfileContract] = useState(null);
    const [error, setError] = useState('');
    const [userProfiles, setUserProfiles] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                if (window.ethereum) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.send("eth_requestAccounts", []);
                    setCurrentUser(accounts[0]);
                    
                    const postContract = new ethers.Contract(
                        POST_CONTRACT_ADDRESS,
                        POST_CONTRACT_ABI,
                        provider
                    );
                    
                    const profileContractInstance = new ethers.Contract(
                        PROFILE_CONTRACT_ADDRESS,
                        PROFILE_CONTRACT_ABI,
                        provider
                    );

                    setContract(postContract);
                    setProfileContract(profileContractInstance);
                    console.log('Contracts initialized');
                }
            } catch (err) {
                console.error('Error in init:', err);
                setError('Failed to connect to blockchain');
            }
        };

        init();
    }, []);

    const fetchUserProfile = async (address) => {
        try {
            const profile = await profileContract.getProfile(address);
            return {
                username: profile[0],
                bio: profile[1],
                avatar: profile[2],
                exists: profile[3]
            };
        } catch (err) {
            console.error('Error fetching profile for:', address, err);
            return null;
        }
    };

    useEffect(() => {
        const fetchPosts = async () => {
            if (!contract || !currentUser || !profileContract) return;

            try {
                setLoading(true);
                const users = await contract.getAllUsers();
                console.log('Raw users:', users);
                
                const otherUsers = Array.from(users).filter(user => 
                    user.toLowerCase() !== currentUser.toLowerCase()
                );
                console.log('Filtered users:', otherUsers);

                // Fetch profiles for all users
                const profiles = {};
                for (const user of otherUsers) {
                    const profile = await fetchUserProfile(user);
                    if (profile) {
                        profiles[user.toLowerCase()] = profile;
                    }
                }
                setUserProfiles(profiles);

                const allPosts = await Promise.all(
                    otherUsers.map(async (user) => {
                        try {
                            const userPosts = await contract.getUserPosts(user);
                            console.log('Raw user posts for', user, ':', userPosts);
                            
                            return Array.from(userPosts)
                                .map((post, index) => ({
                                    author: post.author,
                                    content: post.content,
                                    timestamp: Number(post.timestamp.toString()),
                                    exists: post.exists,
                                    index
                                }))
                                .filter(post => post.exists);
                        } catch (err) {
                            console.error('Error fetching posts for user:', user, err);
                            return [];
                        }
                    })
                );

                const flattenedPosts = allPosts
                    .flat()
                    .sort((a, b) => b.timestamp - a.timestamp);
                
                console.log('Processed posts:', flattenedPosts);
                setPosts(flattenedPosts);
            } catch (err) {
                console.error('Error in fetchPosts:', err);
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [contract, currentUser, profileContract]);

    const handleAuthorClick = (authorAddress) => {
        navigate(`/profile/${authorAddress}`);
    };

    if (error) {
        return (
            <div className={styles['error-message']}>
                {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles['loading-container']}>
                Loading posts...
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className={styles['no-posts-message']}>
                No posts available from other users
            </div>
        );
    }

    return (

        <div className={styles['feed-container']}>
        <h1 className={styles.feedTitle}>What's new on EtherSpace</h1>
            {posts.map((post, i) => {
                const profile = userProfiles[post.author.toLowerCase()];
                return (
                    <div key={`${post.author}-${post.index}-${i}`} className={styles['post-card']}>
                        <div className={styles['post-content']}>
                            <div 
                                className={styles['author-info']}
                                onClick={() => handleAuthorClick(post.author)}
                            >
                                {profile && (
                                    <>
                                        <img 
                                            src={profile.avatar} 
                                            alt={profile.username}
                                            className={styles['author-avatar']}
                                        />
                                        <span className={styles['author-username']}>
                                            {profile.username}
                                        </span>
                                    </>
                                )}
                                {!profile && (
                                    <span className={styles['author-address']}>
                                        {post.author.slice(0, 6)}...{post.author.slice(-4)}
                                    </span>
                                )}
                            </div>
                            <p className={styles['post-text']}>{post.content}</p>
                        </div>
                        <div className={styles['post-footer']}>
                            {new Date(post.timestamp * 1000).toLocaleString()}
                        </div>
                        <TipPost 
                        post={post}
                        authorAddress={post.author}
                    />
                    </div>
                );
            })}
        </div>
        
    );
};

export default Feed;