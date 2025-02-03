require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
};


require("hardhat-gas-reporter");

module.exports = {
  solidity: "0.8.20",
  gasReporter: {
    enabled: true,
    currency: "USD", 
    gasPrice: 20, 
  },
};

