// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PostContract {
    struct Post {
        address author;
        string content;
        uint256 timestamp;
        bool exists;
        uint256 tipCount;     // New field to track number of tips
        uint256 totalTips;    // New field to track total amount of tips in wei

    }

    mapping(address => bool) public hasPosted; // Track if an address has posted
    mapping(address => Post[]) public userPosts;
    address[] public allUsers; // Optional array to keep track of all users if needed

    event PostCreated(address indexed author, string content, uint256 timestamp);
    event PostUpdated(address indexed author, uint256 indexed postIndex, string newContent);
    event PostDeleted(address indexed author, uint256 indexed postIndex);
    event PostTipped(address indexed tipper, address indexed author, uint256 indexed postIndex, uint256 amount);


    function createPost(string memory _content) public {
        require(bytes(_content).length > 0 && bytes(_content).length <= 280, "Invalid post length");
        
        Post memory newPost = Post({
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            exists: true,
            tipCount: 0,        // Initialize tip count
            totalTips: 0 
        });

        userPosts[msg.sender].push(newPost);

        // Mark the user as having posted
        if (!hasPosted[msg.sender]) {
            hasPosted[msg.sender] = true;
            allUsers.push(msg.sender); // Optional: You can store the user in an array if needed
        }

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

    // Get all authors (optional)
    function getAllUsers() public view returns (address[] memory) {
        return allUsers;
    }


    
     // New function to record a tip for a post
    function recordTip(address _author, uint256 _postIndex, uint256 _amount) public {
        require(_postIndex < userPosts[_author].length, "Post index out of bounds");
        require(userPosts[_author][_postIndex].exists, "Post does not exist");
        
        Post storage post = userPosts[_author][_postIndex];
        post.tipCount += 1;
        post.totalTips += _amount;
        
        emit PostTipped(msg.sender, _author, _postIndex, _amount);
    }

    // New function to get tip statistics for a post
    function getPostTipStats(address _author, uint256 _postIndex) 
        public 
        view 
        returns (uint256 tipCount, uint256 totalTips) 
    {
        require(_postIndex < userPosts[_author].length, "Post index out of bounds");
        require(userPosts[_author][_postIndex].exists, "Post does not exist");
        
        Post memory post = userPosts[_author][_postIndex];
        return (post.tipCount, post.totalTips);
    }

    // Pure function to calculate average tip amount
    function calculateAverageTip(uint256 _totalTips, uint256 _tipCount) public pure returns (uint256) {
        require(_tipCount > 0, "No tips to calculate average");
        return _totalTips / _tipCount;
    }

}
