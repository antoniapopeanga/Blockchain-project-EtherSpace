const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherSpaceProfile", function () {
  let EtherSpaceProfile;
  let profile;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const EtherSpaceProfile = await ethers.getContractFactory("EtherSpaceProfile");
    profile = await EtherSpaceProfile.deploy();
    // Remove the .deployed() call and wait for deployment to complete
    await profile.waitForDeployment();
  });

  describe("Profile Creation", function () {
    it("Should create a new profile", async function () {
      const username = "testuser";
      const bio = "Test bio";
      const avatar = "test_avatar.jpg";

      await profile.connect(addr1).createProfile(username, bio, avatar);
      
      const newProfile = await profile.getProfile(addr1.address);
      expect(newProfile.username).to.equal(username);
      expect(newProfile.bio).to.equal(bio);
      expect(newProfile.avatar).to.equal(avatar);
      expect(newProfile.exists).to.equal(true);
    });

    it("Should emit ProfileCreated event", async function () {
      const username = "testuser";
      const bio = "Test bio";
      const avatar = "test_avatar.jpg";

      await expect(profile.connect(addr1).createProfile(username, bio, avatar))
        .to.emit(profile, "ProfileCreated")
        .withArgs(addr1.address, username);
    });

    it("Should not allow duplicate usernames", async function () {
      const username = "testuser";
      const bio = "Test bio";
      const avatar = "test_avatar.jpg";

      await profile.connect(addr1).createProfile(username, bio, avatar);
      
      await expect(
        profile.connect(addr2).createProfile(username, "Different bio", "different_avatar.jpg")
      ).to.be.revertedWith("Username already taken");
    });

    it("Should validate username length", async function () {
      const bio = "Test bio";
      const avatar = "test_avatar.jpg";

      // Test too short username
      await expect(
        profile.connect(addr1).createProfile("ab", bio, avatar)
      ).to.be.revertedWith("Username too short");

      // Test too long username
      await expect(
        profile.connect(addr1).createProfile("thisusernameistoolong", bio, avatar)
      ).to.be.revertedWith("Username too long");
    });

    it("Should not allow multiple profiles for same address", async function () {
      await profile.connect(addr1).createProfile("user1", "Bio 1", "avatar1.jpg");
      
      await expect(
        profile.connect(addr1).createProfile("user2", "Bio 2", "avatar2.jpg")
      ).to.be.revertedWith("Profile already exists");
    });
  });

  describe("Profile Updates", function () {
    beforeEach(async function () {
      // Create a profile before each test
      await profile.connect(addr1).createProfile("testuser", "Initial bio", "initial_avatar.jpg");
    });

    it("Should update profile bio and avatar", async function () {
      const newBio = "Updated bio";
      const newAvatar = "new_avatar.jpg";

      await profile.connect(addr1).updateProfile(newBio, newAvatar);
      
      const updatedProfile = await profile.getProfile(addr1.address);
      expect(updatedProfile.bio).to.equal(newBio);
      expect(updatedProfile.avatar).to.equal(newAvatar);
      // Username should remain unchanged
      expect(updatedProfile.username).to.equal("testuser");
    });

    it("Should emit ProfileUpdated event", async function () {
      await expect(profile.connect(addr1).updateProfile("New bio", "new_avatar.jpg"))
        .to.emit(profile, "ProfileUpdated")
        .withArgs(addr1.address);
    });

    it("Should not allow updates for non-existent profiles", async function () {
      await expect(
        profile.connect(addr2).updateProfile("New bio", "new_avatar.jpg")
      ).to.be.revertedWith("Profile does not exist");
    });
  });

  describe("Profile Retrieval", function () {
    it("Should return empty profile for non-existent address", async function () {
      const emptyProfile = await profile.getProfile(addr1.address);
      expect(emptyProfile.exists).to.equal(false);
      expect(emptyProfile.username).to.equal("");
      expect(emptyProfile.bio).to.equal("");
      expect(emptyProfile.avatar).to.equal("");
    });

    it("Should return correct profile data", async function () {
      const username = "testuser";
      const bio = "Test bio";
      const avatar = "test_avatar.jpg";

      await profile.connect(addr1).createProfile(username, bio, avatar);
      
      const retrievedProfile = await profile.getProfile(addr1.address);
      expect(retrievedProfile.username).to.equal(username);
      expect(retrievedProfile.bio).to.equal(bio);
      expect(retrievedProfile.avatar).to.equal(avatar);
      expect(retrievedProfile.exists).to.equal(true);
    });
  });
});