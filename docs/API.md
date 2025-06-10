# PIXELMINER API Documentation

## Overview

This document provides detailed information about the PIXELMINER API endpoints, contract interactions, and data structures.

## Smart Contract Interactions

### PXLToken Contract

#### Contract Address
```typescript
const PXL_TOKEN_ADDRESS = "0x..."; // Sepolia testnet
```

#### Main Functions

##### balanceOf
```typescript
function balanceOf(address account) returns (uint256)
```
Returns the token balance of the specified account.

##### transfer
```typescript
function transfer(address to, uint256 amount) returns (bool)
```
Transfers tokens from the sender to the specified address.

##### approve
```typescript
function approve(address spender, uint256 amount) returns (bool)
```
Approves the specified address to spend tokens on behalf of the sender.

### MiningRig Contract

#### Contract Address
```typescript
const MINING_RIG_ADDRESS = "0x..."; // Sepolia testnet
```

#### Main Functions

##### buyMiner
```typescript
function buyMiner(uint256 minerType, uint256 x, uint256 y) returns (bool)
```
Purchases a new miner and places it at the specified coordinates.

##### claimRewards
```typescript
function claimRewards() returns (uint256)
```
Claims accumulated mining rewards.

##### getMinerInfo
```typescript
function getMinerInfo(uint256 x, uint256 y) returns (MinerInfo)
```
Returns information about the miner at the specified coordinates.

## Frontend API

### Hooks

#### useMiningStats
```typescript
const { data: stats, isLoading } = useMiningStats();
```
Returns current mining statistics including total hashrate and pending rewards.

#### useMinerInfo
```typescript
const { data: minerInfo } = useMinerInfo(x, y);
```
Returns information about a specific miner.

#### useRewards
```typescript
const { data: rewards, claim } = useRewards();
```
Manages mining rewards and provides claim functionality.

### Components

#### MiningGrid
```typescript
interface MiningGridProps {
  onTileClick: (x: number, y: number) => void;
  selectedTile?: { x: number; y: number };
}
```
Renders the mining grid and handles tile selection.

#### MinerCard
```typescript
interface MinerCardProps {
  minerType: number;
  hashrate: number;
  powerConsumption: number;
  onSelect: () => void;
}
```
Displays information about a specific miner type.

## Data Structures

### MinerInfo
```typescript
interface MinerInfo {
  owner: string;
  minerType: number;
  hashrate: number;
  powerConsumption: number;
  lastClaimTime: number;
  pendingRewards: string;
}
```

### MiningStats
```typescript
interface MiningStats {
  totalHashrate: number;
  totalMiners: number;
  totalRewards: string;
  networkDifficulty: number;
}
```

## Error Handling

### Common Errors

#### InsufficientBalance
```typescript
class InsufficientBalance extends Error {
  constructor(required: string, available: string) {
    super(`Insufficient balance. Required: ${required}, Available: ${available}`);
  }
}
```

#### InvalidCoordinates
```typescript
class InvalidCoordinates extends Error {
  constructor(x: number, y: number) {
    super(`Invalid coordinates: (${x}, ${y})`);
  }
}
```

## Rate Limits

- Maximum 100 requests per minute per IP
- Maximum 1000 requests per hour per wallet
- Maximum 10,000 requests per day per wallet

## Best Practices

1. Always check for sufficient balance before transactions
2. Implement proper error handling
3. Use appropriate gas limits
4. Cache frequently accessed data
5. Implement retry logic for failed transactions

## Examples

### Buying a Miner
```typescript
const buyMiner = async (minerType: number, x: number, y: number) => {
  try {
    const tx = await contract.buyMiner(minerType, x, y);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Failed to buy miner:', error);
    throw error;
  }
};
```

### Claiming Rewards
```typescript
const claimRewards = async () => {
  try {
    const tx = await contract.claimRewards();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Failed to claim rewards:', error);
    throw error;
  }
};
```

## Support

For API support, please:
1. Check the [FAQ](https://docs.pixelminer.org/faq)
2. Join our [Discord](https://discord.gg/pixelminer)
3. Open an issue on [GitHub](https://github.com/posgame3/web3miner)

---

*This API documentation is maintained by the PIXELMINER development team. Last updated: [Current Date]* 