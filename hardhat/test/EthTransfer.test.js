const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EthTransfer", function () {
  let EthTransfer;
  let ethTransfer;
  let owner;
  let user1;
  let user2;
  const depositAmount = ethers.parseEther("1.0"); 
  const transferAmount = ethers.parseEther("0.5"); 

  beforeEach(async function () {
    // Get test accounts
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const EthTransfer = await ethers.getContractFactory("EthTransfer");
    ethTransfer = await EthTransfer.deploy();
    await ethTransfer.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ethTransfer.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero balance", async function () {
      expect(await ethTransfer.connect(user1).getBalance()).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should accept deposits and emit Deposit event", async function () {
      await expect(ethTransfer.connect(user1).deposit({ value: depositAmount }))
        .to.emit(ethTransfer, "Deposit")
        .withArgs(user1.address, depositAmount);

      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount);
    });

    it("Should not accept zero deposits", async function () {
      await expect(
        ethTransfer.connect(user1).deposit({ value: 0 })
      ).to.be.revertedWith("Deposit amount must be greater than 0");
    });

    it("Should accept ETH via receive function", async function () {
      // Send ETH directly to contract
      await expect(
        user1.sendTransaction({
          to: ethTransfer.target,
          value: depositAmount
        })
      ).to.emit(ethTransfer, "Deposit")
        .withArgs(user1.address, depositAmount);

      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Deposit some ETH first
      await ethTransfer.connect(user1).deposit({ value: depositAmount });
    });

    it("Should allow withdrawals and emit Withdrawal event", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      const initialBalance = await ethers.provider.getBalance(user1.address);

      await expect(ethTransfer.connect(user1).withdraw(withdrawAmount))
        .to.emit(ethTransfer, "Withdrawal")
        .withArgs(user1.address, withdrawAmount);

      // Check user's ETH balance increased
      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.gt(initialBalance - withdrawAmount);

      // Check contract balance for user decreased
      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount - withdrawAmount);
    });

    it("Should not allow withdrawals exceeding balance", async function () {
      const excessAmount = ethers.parseEther("2.0");
      await expect(
        ethTransfer.connect(user1).withdraw(excessAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      // Deposit some ETH first
      await ethTransfer.connect(user1).deposit({ value: depositAmount });
    });

    it("Should allow transfers between users and emit Transfer event", async function () {
      await expect(ethTransfer.connect(user1).transferTo(user2.address, transferAmount))
        .to.emit(ethTransfer, "Transfer")
        .withArgs(user1.address, user2.address, transferAmount);

      // Check balances updated correctly
      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount - transferAmount);
      expect(await ethTransfer.connect(user2).getBalance()).to.equal(transferAmount);
    });

    it("Should not allow transfers to zero address", async function () {
      await expect(
        ethTransfer.connect(user1).transferTo(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWith("Invalid recipient address");
    });

    it("Should not allow transfers to self", async function () {
      await expect(
        ethTransfer.connect(user1).transferTo(user1.address, transferAmount)
      ).to.be.revertedWith("Cannot transfer to yourself");
    });

    it("Should not allow transfers exceeding balance", async function () {
      const excessAmount = ethers.parseEther("2.0"); 
      await expect(
        ethTransfer.connect(user1).transferTo(user2.address, excessAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Balance Checking", function () {
    it("Should correctly report user balance", async function () {
      await ethTransfer.connect(user1).deposit({ value: depositAmount });
      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount);
    });

    it("Should allow owner to check contract balance", async function () {
      await ethTransfer.connect(user1).deposit({ value: depositAmount });
      expect(await ethTransfer.connect(owner).getContractBalance()).to.equal(depositAmount);
    });

    it("Should not allow non-owner to check contract balance", async function () {
      await expect(
        ethTransfer.connect(user1).getContractBalance()
      ).to.be.revertedWith("Only the contract owner can call this function");
    });
  });

  describe("Complex Scenarios", function () {
    it("Should handle multiple deposits and withdrawals correctly", async function () {
      // First deposit
      await ethTransfer.connect(user1).deposit({ value: depositAmount });
      
      // Second deposit
      await ethTransfer.connect(user1).deposit({ value: depositAmount });
      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount * 2n);

      // Partial withdrawal
      await ethTransfer.connect(user1).withdraw(transferAmount);
      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount * 2n - transferAmount);
    });

    it("Should handle multiple transfers correctly", async function () {
      // Initial deposit by user1
      await ethTransfer.connect(user1).deposit({ value: depositAmount });

      // Transfer to user2
      await ethTransfer.connect(user1).transferTo(user2.address, transferAmount);

      // Transfer half back to user1
      const halfTransfer = transferAmount / 2n;
      await ethTransfer.connect(user2).transferTo(user1.address, halfTransfer);

      // Check final balances
      expect(await ethTransfer.connect(user1).getBalance()).to.equal(depositAmount - transferAmount + halfTransfer);
      expect(await ethTransfer.connect(user2).getBalance()).to.equal(transferAmount - halfTransfer);
    });
  });
});