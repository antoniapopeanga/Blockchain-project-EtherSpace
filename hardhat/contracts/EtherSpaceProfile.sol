// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract EtherSpaceProfile {
    //define the basic structure for a user profile
    struct Profile {
        string username;    
        string bio;        
        string avatar;     
        bool exists;      
    }
    

    address public owner;
    mapping(address => Profile) public profiles;
    mapping(string => bool) public usernameExists;
    
    //events to track profile changes
    event ProfileCreated(address indexed userAddress, string username);
    event ProfileUpdated(address indexed userAddress);
    
 
    constructor() {
        owner = msg.sender;
    }
    
    //modifier to check if sender has a profile
    modifier hasProfile() {
        require(profiles[msg.sender].exists, "Profile does not exist");
        _;
    }
    
    //modifier to check if username is valid
    modifier validUsername(string memory _username) {
        require(bytes(_username).length >= 3, "Username too short");
        require(bytes(_username).length <= 16, "Username too long");
        require(!usernameExists[_username], "Username already taken");
        _;
    }
    

    function createProfile(
        string memory _username,
        string memory _bio,
        string memory _avatar
    ) public validUsername(_username) {
        require(!profiles[msg.sender].exists, "Profile already exists");
        
        profiles[msg.sender] = Profile({
            username: _username,
            bio: _bio,
            avatar: _avatar,
            exists: true
        });
        
        usernameExists[_username] = true;
        emit ProfileCreated(msg.sender, _username);
    }
    

    function updateProfile(
        string memory _bio,
        string memory _avatar
    ) public hasProfile {
        Profile storage profile = profiles[msg.sender];
        profile.bio = _bio;
        profile.avatar = _avatar;
        
        emit ProfileUpdated(msg.sender);
    }


    //returns the profile data based on user address
    function getProfile(address _address) public view returns (
        string memory username,
        string memory bio,
        string memory avatar,
        bool exists
    ) {
        Profile memory profile = profiles[_address];
        return (
            profile.username,
            profile.bio,
            profile.avatar,
            profile.exists
        );
    }
}