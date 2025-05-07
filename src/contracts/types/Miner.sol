// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Miner {
    uint256 id;
    uint256 x;
    uint256 y;
    uint256 minerIndex;
    uint256 hashrate;
    uint256 powerConsumption;
    uint256 cost;
    bool inProduction;
} 