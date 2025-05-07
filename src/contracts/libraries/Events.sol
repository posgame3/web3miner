// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Events {
    event EthermaxSet(address indexed ethermax);
    event MinerAdded(uint256 indexed minerId, uint256 hashrate, uint256 powerConsumption, uint256 cost);
    event FacilityAdded(uint256 indexed facilityId, uint256 maxMiners, uint256 totalPowerOutput, uint256 cost);
    event MiningStarted(address indexed user, uint256 minerId, uint256 facilityId);
    event MiningStopped(address indexed user, uint256 minerId, uint256 facilityId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event NewMinerAdded(uint256 indexed minerId, uint256 hashrate, uint256 powerConsumption, uint256 cost, bool inProduction);
    event MinerProductionToggled(uint256 indexed minerId, bool inProduction);
    event NewFacilityAdded(uint256 indexed facilityId, uint256 totalPowerOutput, uint256 cost, bool inProduction, uint256 x, uint256 y);
    event FacilityProductionToggled(uint256 indexed facilityId, bool inProduction);
    event MinerSecondaryMarketAdded(uint256 indexed minerId, uint256 price);
    event InitialFacilityPurchased(address indexed user);
    event MinerBought(address indexed user, uint256 minerIndex, uint256 cost, uint256 minerId, uint256 x, uint256 y);
    event MinerSold(address indexed user, uint256 minerIndex, uint256 price, uint256 minerId, uint256 x, uint256 y);
    event FacilityBought(address indexed user, uint256 facilityIndex, uint256 cost);
    event MiningStarted(uint256 startBlock);
    event PlayerHashrateIncreased(address indexed user, uint256 hashrate, uint256 pendingRewards);
    event PlayerHashrateDecreased(address indexed user, uint256 hashrate, uint256 pendingRewards);
    event MinerCostChanged(uint256 indexed minerId, uint256 newCost);
    event FacilityCostChanged(uint256 indexed facilityId, uint256 newCost);
} 