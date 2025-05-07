// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Facility {
    uint256 facilityIndex;
    uint256 maxMiners;
    uint256 totalPowerOutput;
    uint256 x;
    uint256 y;
    uint256 currMiners;
    uint256 currPowerOutput;
} 