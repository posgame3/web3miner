// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEthermax {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function addMinter(address _minter) external;
    function removeMinter(address _minter) external;
    function authorizedMinters(address _minter) external view returns (bool);
    function amtBurned() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
} 