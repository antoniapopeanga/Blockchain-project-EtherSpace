// deployment/modules/ProfileModule.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

/**
 * Deployment module for EtherSpaceProfile contract
 * This module handles the deployment of the core profile system for EtherSpace
 */
module.exports = buildModule("EtherSpaceProfileModule", (m) => {
    // Deploy the EtherSpaceProfile contract
    const profileContract = m.contract("EtherSpaceProfile");

    // Return the deployed contract instance
    return { profileContract };
});