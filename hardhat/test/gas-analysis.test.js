const { expect } = require("chai");
const { ethers } = require("hardhat");

async function measureGas(transaction) {
    const tx = await transaction;
    const receipt = await tx.wait();
    return receipt.gasUsed;
}

describe("Gas Cost Analysis", function () {
    let owner, user1, user2;
    let profileContract, postContract, ethTransferContract;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const EtherSpaceProfile = await ethers.getContractFactory("EtherSpaceProfile");
        profileContract = await EtherSpaceProfile.deploy();
        await profileContract.waitForDeployment();

        const PostContract = await ethers.getContractFactory("PostContract");
        postContract = await PostContract.deploy();
        await postContract.waitForDeployment();

        const EthTransfer = await ethers.getContractFactory("EthTransfer");
        ethTransferContract = await EthTransfer.deploy();
        await ethTransferContract.waitForDeployment();
    });

    describe("EtherSpaceProfile Gas Analysis", function () {
        it("Should analyze profile creation costs", async function () {
            const estimatedGasShort = await profileContract.connect(user1).createProfile.estimateGas("bob", "bio", "avatar.jpg");
            const estimatedGasLong = await profileContract.connect(user2).createProfile.estimateGas("maximumusername", "bio", "avatar.jpg");
            
            console.log("Estimated Gas for Profile Creation:");
            console.log("- Short username (3 chars):", estimatedGasShort.toString());
            console.log("- Long username (13 chars):", estimatedGasLong.toString());

            const shortUsername = await measureGas(
                profileContract.connect(user1).createProfile("bob", "bio", "avatar.jpg", { gasLimit: estimatedGasShort })
            );
            
            const longUsername = await measureGas(
                profileContract.connect(user2).createProfile("maximumusername", "bio", "avatar.jpg", { gasLimit: estimatedGasLong })
            );

            console.log("Profile Creation Gas Costs:");
            console.log("- Short username (3 chars):", shortUsername.toString());
            console.log("- Long username (13 chars):", longUsername.toString());
        });
    });

    describe("PostContract Gas Analysis", function () {
        it("Should analyze post creation costs by length", async function () {
            const estimatedGasShort = await postContract.connect(user1).createPost.estimateGas("Hello!");
            const estimatedGasMedium = await postContract.connect(user1).createPost.estimateGas("A".repeat(140));
            const estimatedGasMax = await postContract.connect(user1).createPost.estimateGas("A".repeat(280));
            
            console.log("Estimated Gas for Post Creation:");
            console.log("- Short post (6 chars):", estimatedGasShort.toString());
            console.log("- Medium post (140 chars):", estimatedGasMedium.toString());
            console.log("- Max length post (280 chars):", estimatedGasMax.toString());

            const shortPost = await measureGas(
                postContract.connect(user1).createPost("Hello!", { gasLimit: estimatedGasShort })
            );

            const mediumPost = await measureGas(
                postContract.connect(user1).createPost("A".repeat(140), { gasLimit: estimatedGasMedium })
            );

            const maxPost = await measureGas(
                postContract.connect(user1).createPost("A".repeat(280), { gasLimit: estimatedGasMax })
            );

            console.log("Post Creation Gas Costs:");
            console.log("- Short post (6 chars):", shortPost.toString());
            console.log("- Medium post (140 chars):", mediumPost.toString());
            console.log("- Max length post (280 chars):", maxPost.toString());
        });
    });

    describe("EthTransfer Gas Analysis", function () {
        it("Should analyze deposit costs", async function () {
            const estimatedGasSmall = await ethTransferContract.connect(user1).deposit.estimateGas({ value: ethers.parseEther("0.1") });
            const estimatedGasLarge = await ethTransferContract.connect(user1).deposit.estimateGas({ value: ethers.parseEther("10") });
            
            console.log("Estimated Gas for Deposit:");
            console.log("- Small deposit (0.1 ETH):", estimatedGasSmall.toString());
            console.log("- Large deposit (10 ETH):", estimatedGasLarge.toString());

            const smallDeposit = await measureGas(
                ethTransferContract.connect(user1).deposit({ value: ethers.parseEther("0.1"), gasLimit: estimatedGasSmall })
            );

            const largeDeposit = await measureGas(
                ethTransferContract.connect(user1).deposit({ value: ethers.parseEther("10"), gasLimit: estimatedGasLarge })
            );

            console.log("Deposit Gas Costs:");
            console.log("- Small deposit (0.1 ETH):", smallDeposit.toString());
            console.log("- Large deposit (10 ETH):", largeDeposit.toString());
        });
    });
});
