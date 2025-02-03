const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PostContract", function () {
  let PostContract;
  let postContract;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // Get test accounts
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const PostContract = await ethers.getContractFactory("PostContract");
    postContract = await PostContract.deploy();
    await postContract.waitForDeployment();
  });

  describe("Post Creation", function () {
    it("Should create a new post", async function () {
      const content = "Hello World!";
      await postContract.connect(user1).createPost(content);
      
      const posts = await postContract.getUserPosts(user1.address);
      expect(posts.length).to.equal(1);
      expect(posts[0].content).to.equal(content);
      expect(posts[0].author).to.equal(user1.address);
      expect(posts[0].exists).to.equal(true);
      expect(posts[0].tipCount).to.equal(0);
      expect(posts[0].totalTips).to.equal(0);
    });

    it("Should emit PostCreated event", async function () {
      const content = "Hello World!";
      const tx = await postContract.connect(user1).createPost(content);
      
      // Get the transaction receipt
      const receipt = await tx.wait();
      
      // Get the event from the logs
      const event = receipt.logs[0];
      const iface = postContract.interface;
      const decodedEvent = iface.parseLog(event);
      
      // Verify the event details
      expect(decodedEvent.name).to.equal("PostCreated");
      expect(decodedEvent.args[0]).to.equal(user1.address); // author
      expect(decodedEvent.args[1]).to.equal(content);       // content
      expect(decodedEvent.args[2]).to.be.a('bigint');      // timestamp
    });

    it("Should not allow empty posts", async function () {
      await expect(
        postContract.connect(user1).createPost("")
      ).to.be.revertedWith("Invalid post length");
    });

    it("Should not allow posts longer than 280 characters", async function () {
      const longContent = "a".repeat(281);
      await expect(
        postContract.connect(user1).createPost(longContent)
      ).to.be.revertedWith("Invalid post length");
    });

    it("Should track new users correctly", async function () {
      await postContract.connect(user1).createPost("First post");
      
      expect(await postContract.hasPosted(user1.address)).to.be.true;
      const allUsers = await postContract.getAllUsers();
      expect(allUsers).to.include(user1.address);
    });
  });

  describe("Post Updates", function () {
    beforeEach(async function () {
      await postContract.connect(user1).createPost("Original content");
    });

    it("Should update post content", async function () {
      const newContent = "Updated content";
      await postContract.connect(user1).updatePost(0, newContent);
      
      const posts = await postContract.getUserPosts(user1.address);
      expect(posts[0].content).to.equal(newContent);
    });

    it("Should emit PostUpdated event", async function () {
      const newContent = "Updated content";
      await expect(postContract.connect(user1).updatePost(0, newContent))
        .to.emit(postContract, "PostUpdated")
        .withArgs(user1.address, 0, newContent);
    });

    it("Should not allow updating non-existent posts", async function () {
      await expect(
        postContract.connect(user1).updatePost(99, "New content")
      ).to.be.revertedWith("Post index out of bounds");
    });
  });

  describe("Post Deletion", function () {
    beforeEach(async function () {
      await postContract.connect(user1).createPost("Test post");
    });

    it("Should mark post as deleted", async function () {
      await postContract.connect(user1).deletePost(0);
      const posts = await postContract.getUserPosts(user1.address);
      expect(posts.length).to.equal(0); // Should not return deleted posts
    });

    it("Should emit PostDeleted event", async function () {
      await expect(postContract.connect(user1).deletePost(0))
        .to.emit(postContract, "PostDeleted")
        .withArgs(user1.address, 0);
    });

    it("Should not allow deleting non-existent posts", async function () {
      await expect(
        postContract.connect(user1).deletePost(99)
      ).to.be.revertedWith("Post index out of bounds");
    });
  });

  describe("Post Tipping", function () {
    beforeEach(async function () {
      await postContract.connect(user1).createPost("Tippable post");
    });

    it("Should record tips correctly", async function () {
      const tipAmount = ethers.parseEther("0.1");
      await postContract.connect(user2).recordTip(user1.address, 0, tipAmount);
      
      const [tipCount, totalTips] = await postContract.getPostTipStats(user1.address, 0);
      expect(tipCount).to.equal(1);
      expect(totalTips).to.equal(tipAmount);
    });

    it("Should emit PostTipped event", async function () {
      const tipAmount = ethers.parseEther("0.1");
      await expect(postContract.connect(user2).recordTip(user1.address, 0, tipAmount))
        .to.emit(postContract, "PostTipped")
        .withArgs(user2.address, user1.address, 0, tipAmount);
    });

    it("Should calculate average tip correctly", async function () {
      const tipAmount1 = ethers.parseEther("0.1");
      const tipAmount2 = ethers.parseEther("0.3");
      
      await postContract.connect(user2).recordTip(user1.address, 0, tipAmount1);
      await postContract.connect(user2).recordTip(user1.address, 0, tipAmount2);
      
      const [tipCount, totalTips] = await postContract.getPostTipStats(user1.address, 0);
      const averageTip = await postContract.calculateAverageTip(totalTips, tipCount);
      expect(averageTip).to.equal((tipAmount1 + tipAmount2) / 2n);
    });

    it("Should not allow tipping non-existent posts", async function () {
      await expect(
        postContract.connect(user2).recordTip(user1.address, 99, ethers.parseEther("0.1"))
      ).to.be.revertedWith("Post index out of bounds");
    });
  });

  describe("Post Retrieval", function () {
    beforeEach(async function () {
      await postContract.connect(user1).createPost("Post 1");
      await postContract.connect(user1).createPost("Post 2");
      await postContract.connect(user1).deletePost(0); // Delete first post
    });

    it("Should only return existing posts", async function () {
      const posts = await postContract.getUserPosts(user1.address);
      expect(posts.length).to.equal(1);
      expect(posts[0].content).to.equal("Post 2");
    });

    it("Should return all users who have posted", async function () {
      await postContract.connect(user2).createPost("Another user's post");
      
      const allUsers = await postContract.getAllUsers();
      expect(allUsers).to.include(user1.address);
      expect(allUsers).to.include(user2.address);
      expect(allUsers.length).to.equal(2);
    });
  });
});