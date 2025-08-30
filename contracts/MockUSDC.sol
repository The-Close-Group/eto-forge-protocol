// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for ETO testnet with faucet functionality
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6; // USDC uses 6 decimals
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**6; // 1000 USDC
    uint256 public constant FAUCET_COOLDOWN = 0; // No cooldown
    
    mapping(address => uint256) public lastFaucetTime;

    constructor() ERC20("Mock USD Coin", "mUSDC") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Faucet function - allows users to mint free tokens
     */
    function faucet() external {
        
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @dev Mint function with amount - requires permission
     */
    function mintWithPermission(address to, uint256 amount) external {
        require(amount > 0, "MockUSDC: Amount must be greater than 0");
        require(amount <= 10000 * 10**6, "MockUSDC: Amount too large"); // Max 10k USDC per mint
        
        _mint(to, amount);
        emit MintedWithPermission(to, amount);
    }

    /**
     * @dev Owner can mint unlimited tokens
     */
    function ownerMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Check cooldown time remaining for an address
     */
    function getCooldownRemaining(address user) external view returns (uint256) {
        if (block.timestamp >= lastFaucetTime[user] + FAUCET_COOLDOWN) {
            return 0;
        }
        return (lastFaucetTime[user] + FAUCET_COOLDOWN) - block.timestamp;
    }

    event FaucetUsed(address indexed user, uint256 amount);
    event MintedWithPermission(address indexed to, uint256 amount);
}
