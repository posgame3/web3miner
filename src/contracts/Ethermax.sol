//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ethermax is ERC20, Ownable {
    error NotMinter();

    uint256 public constant MAX_SUPPLY = 420_000_000e18;

    /// @dev is EtherMax.sol
    address public minter;

    uint256 public amtBurned;

    mapping(address => bool) public authorizedMinters;

    constructor(address _lpAddress) ERC20("PIXELMINER", "PXL") Ownable(msg.sender) {
        _mint(_lpAddress, 4_200_000e18); // Pre-mine for LP
    }

    /**
     * @dev Mints tokens when a miner claims their rewards.
     */
    function mint(address to, uint256 amount) external {
         if (!authorizedMinters[msg.sender]) revert NotMinter();

        // Calculate the effective total supply (circulating + burned)
        uint256 effectiveSupply = totalSupply() + amtBurned;
        
        // Guarantees that MAX_SUPPLY never exceeds 420m
        if (effectiveSupply + amount > MAX_SUPPLY) {
            amount = MAX_SUPPLY - effectiveSupply;
        }

        // Only mint if there is still supply left
        if (amount > 0) {
            _mint(to, amount);
        }
    }

    function burn(uint256 value) external {
        amtBurned += value;
        _burn(_msgSender(), value);
    }
    
    /// @dev Add staking smart contract address to authorizedMinters
    function addMinter(address _minter) external onlyOwner {
        authorizedMinters[_minter] = true;
    }

    function removeMinter(address _minter) external onlyOwner {
        authorizedMinters[_minter] = false;
    }
} 