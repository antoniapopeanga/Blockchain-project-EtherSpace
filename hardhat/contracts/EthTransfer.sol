// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthTransfer {
    // Contract owner
    address public owner;
    
    // Mapping to store user balances
    mapping(address => uint256) private balances;

    // Events to log transfers
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    // Modifier to check if the caller is the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    // Modifier to ensure sufficient balance
    modifier sufficientBalance(address _user, uint256 _amount) {
        require(balances[_user] >= _amount, "Insufficient balance");
        _;
    }

    // Constructor sets the contract deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // External payable function to deposit ETH
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // External function to withdraw ETH
    function withdraw(uint256 _amount) external sufficientBalance(msg.sender, _amount) {
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Withdrawal(msg.sender, _amount);
    }

    // External function to transfer ETH between users
    function transferTo(address _recipient, uint256 _amount) 
        external 
        sufficientBalance(msg.sender, _amount)
    {
        require(_recipient != address(0), "Invalid recipient address");
        require(_recipient != msg.sender, "Cannot transfer to yourself");

        balances[msg.sender] -= _amount;
        balances[_recipient] += _amount;
        emit Transfer(msg.sender, _recipient, _amount);
    }

    // External view function to check user balance
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    // External view function to check contract balance (only owner)
    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    // Allow the contract to receive ETH
    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}