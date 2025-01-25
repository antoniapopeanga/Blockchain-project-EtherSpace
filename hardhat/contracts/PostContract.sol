// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PostContract {
    struct Post {
        address author;
        string content;
        uint256 timestamp;
        bool exists;
    }

    mapping(address => Post[]) public userPosts;

    event PostCreated(address indexed author, string content, uint256 timestamp);
    event PostUpdated(address indexed author, uint256 indexed postIndex, string newContent);
    event PostDeleted(address indexed author, uint256 indexed postIndex);

    function createPost(string memory _content) public {
        require(bytes(_content).length > 0 && bytes(_content).length <= 280, "Invalid post length");
        
        Post memory newPost = Post({
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            exists: true
        });
        
        userPosts[msg.sender].push(newPost);
        
        emit PostCreated(msg.sender, _content, block.timestamp);
    }

    function updatePost(uint256 _postIndex, string memory _newContent) public {
        require(_postIndex < userPosts[msg.sender].length, "Post index out of bounds");
        require(userPosts[msg.sender][_postIndex].exists, "Post does not exist");
        require(bytes(_newContent).length > 0 && bytes(_newContent).length <= 280, "Invalid post length");

        userPosts[msg.sender][_postIndex].content = _newContent;
        
        emit PostUpdated(msg.sender, _postIndex, _newContent);
    }

    function deletePost(uint256 _postIndex) public {
        require(_postIndex < userPosts[msg.sender].length, "Post index out of bounds");
        require(userPosts[msg.sender][_postIndex].exists, "Post does not exist");

        userPosts[msg.sender][_postIndex].exists = false;
        
        emit PostDeleted(msg.sender, _postIndex);
    }

    function getUserPosts(address _user) public view returns (Post[] memory) {
        // Return only existing posts
        Post[] memory allPosts = userPosts[_user];
        uint256 existingPostCount = 0;
        
        // First count existing posts
        for (uint256 i = 0; i < allPosts.length; i++) {
            if (allPosts[i].exists) {
                existingPostCount++;
            }
        }
        
        // Create a new array with only existing posts
        Post[] memory existingPosts = new Post[](existingPostCount);
        uint256 j = 0;
        for (uint256 i = 0; i < allPosts.length; i++) {
            if (allPosts[i].exists) {
                existingPosts[j] = allPosts[i];
                j++;
            }
        }
        
        return existingPosts;
    }
}