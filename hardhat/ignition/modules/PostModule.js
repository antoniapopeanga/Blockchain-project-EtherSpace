// deployment/modules/PostModule.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

/**
 * Deployment module for PostContract
 * This module handles the deployment of the post system for EtherSpace
 */
module.exports = buildModule("EtherSpacePostModule", (m) => {
    // Deploy the PostContract with optional configuration
    const postContract = m.contract("PostContract");

    // Return the deployed contract instance
    return { postContract };
});