const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

/**
 * Deployment module for EthTransfer contract
 */
module.exports = buildModule("EthTransferModule", (m) => {
    // Deploy the EthTransfer contract
    const ethTransferContract = m.contract("EthTransfer");

    // Return the deployed contract instance
    return { ethTransferContract };
});