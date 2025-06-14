# PIXELMINER Technical Documentation

## Architecture Overview

PIXELMINER is built using a modern tech stack that combines React for the frontend, Solidity for smart contracts, and Base L2 for efficient transaction processing.

### Tech Stack
- **Frontend**: React, TypeScript, Chakra UI
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Base L2 (Ethereum L2)
- **State Management**: wagmi, React Query
- **Testing**: Jest, Hardhat Tests
- **Documentation**: GitBook, Markdown

## Smart Contract Architecture

### PXLToken.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PXLToken is ERC20, Ownable {
    // Token implementation with minting and burning capabilities
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

### MiningRig.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MiningRig is ReentrancyGuard, Ownable {
    // Mining rig implementation with grid-based mining system
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

    // Constants for reward calculation
    uint256 public constant BLOCK_TIME = 2; // 2 seconds per block
    uint256 public constant BLOCKS_PER_DAY = 43200; // 86400 seconds / 2 seconds per block
    uint256 public constant STARTER_MINER_HASHRATE = 120; // 120 H/s
    uint256 public constant STARTER_MINER_POWER = 12; // 12 GW

    mapping(uint256 => mapping(uint256 => Miner)) public miners;
    
    function buyFacility(address referrer) external payable {
        require(msg.value >= 0.001 ether, "Insufficient ETH for facility");
        require(referrer != address(0) && referrer != msg.sender, "Invalid referrer");
        
        // Process facility purchase
        _placeStarterMiner(msg.sender);
        
        // Record referral
        referrals[msg.sender] = referrer;
    }

    function _placeStarterMiner(address owner) internal {
        // Implementation for placing starter miner
        // Starter miner has 120 H/s hashrate and 12 GW power consumption
    }

    function calculateRewards(uint256 hashrate, uint256 totalHashrate) public view returns (uint256) {
        if (totalHashrate == 0) return 0;
        return (hashrate * currentBlockReward) / totalHashrate;
    }

    function buyMiner(uint256 minerType, uint256 x, uint256 y) external nonReentrant {
        // Implementation
    }

    function claimRewards() external nonReentrant {
        // Implementation
    }

    function calculateReferralReward(uint256 miningReward) internal view returns (uint256) {
        return (miningReward * REFERRAL_PERCENTAGE) / 100;
    }
}
```

## Mining Mechanics

### Reward Calculation

The mining rewards are calculated using the following formula:
```solidity
rewards = (playerHashrate * currentBlockReward) / totalHashrate
```

Where:
- `playerHashrate`: Miner's hashrate in H/s
- `currentBlockReward`: Current block reward (halved every 6 months)
- `totalHashrate`: Total network hashrate

### Starter Miner Details

When a user purchases a facility (cost: 0.001 ETH), they automatically receive a free starter miner with the following specifications:
- Base Hashrate: 120 H/s
- Power Consumption: 12 GW
- Placement: Any available tile in 2x2 grid

### Miner Types and Specifications

| Miner Type | Hashrate | Power Consumption | PXL Cost |
|------------|----------|-------------------|----------|
| Starter    | 120 H/s  | 12 GW            | FREE     |
| Basic      | 320 H/s  | 18 GW            | 120 PXL  |
| Advanced   | 600 H/s  | 22 GW            | 220 PXL  |
| Pro        | 920 H/s  | 30 GW            | 402 PXL  |

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── MiningRig.tsx
│   ├── NetworkStats.tsx
│   ├── ResourceManagement.tsx
│   ├── BuyMinerModal.tsx
│   └── ...
├── hooks/
│   ├── usePixelMining.ts
│   ├── useMiningStats.ts
│   ├── useMinerInfo.ts
│   └── ...
├── pages/
│   ├── Room.tsx
│   └── Mining.tsx
└── ...
```

### Key Components

#### MiningRig Component
```typescript
interface MiningRigProps {
  hashrate: number;
  pendingRewards: string;
  lastClaimTime: number;
  onClaim: () => Promise<void>;
  onUpgrade: () => Promise<void>;
}

const MiningRig: React.FC<MiningRigProps> = ({
  hashrate,
  pendingRewards,
  lastClaimTime,
  onClaim,
  onUpgrade
}) => {
  // Component implementation
};
```

#### NetworkStats Component
```typescript
interface NetworkStats {
  totalHashrate: number;
  totalBurned: number;
  blockReward: number;
  nextHalving: number;
  networkDifficulty: number;
}

const NetworkStats: React.FC<{ stats: NetworkStats }> = ({ stats }) => {
  // Component implementation
};
```

## API Integration

### Contract Interactions
```typescript
// Example of contract interaction with wagmi
const { data: hashrate } = useContractRead({
  address: MINING_RIG_ADDRESS,
  abi: MINING_RIG_ABI,
  functionName: 'getHashrate',
  args: [address],
});

const { write: buyMiner } = useContractWrite({
  address: MINING_RIG_ADDRESS,
  abi: MINING_RIG_ABI,
  functionName: 'buyMiner',
});
```

### Web3 Integration
```typescript
// Wallet connection with wagmi
const { connect } = useConnect({
  connector: new InjectedConnector(),
});

const { data: account } = useAccount();
const { data: balance } = useBalance({
  address: account?.address,
});
```

## State Management

### Global State
- Mining status
- User balance
- Network statistics
- Contract interactions
- Grid state
- Selected miner

### Local State
- UI components
- Form data
- Temporary calculations
- Modal states
- Loading states

## Security Considerations

### Smart Contract Security
- Reentrancy protection
- Access control
- Emergency pause
- Rate limiting
- Input validation
- Gas optimization

### Frontend Security
- Input validation
- Error handling
- Transaction confirmation
- Wallet connection security
- Rate limiting
- Data sanitization

## Testing

### Unit Tests
```typescript
describe('MiningRig', () => {
  it('should calculate correct rewards', () => {
    const rig = new MiningRig();
    const rewards = rig.calculateRewards(100, 24);
    expect(rewards).toBe(2400);
  });

  it('should handle miner purchase', async () => {
    const rig = new MiningRig();
    await rig.buyMiner(1, 0, 0);
    const miner = await rig.getMinerInfo(0, 0);
    expect(miner.owner).toBe(accounts[0]);
  });
});
```

### Integration Tests
```typescript
describe('Contract Integration', () => {
  it('should interact with mining contract', async () => {
    const { contract, accounts } = await setupTest();
    await contract.buyMiner(1, 0, 0);
    const miner = await contract.getMinerInfo(0, 0);
    expect(miner.owner).toBe(accounts[0]);
  });
});
```

## Deployment

### Smart Contract Deployment
```bash
# Deploy contracts to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Frontend Deployment
```bash
# Build frontend
npm run build

# Deploy to hosting
npm run deploy

# Run tests
npm run test
```

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Memoization
- Web3 optimization
- Image optimization
- Bundle size reduction

### Smart Contracts
- Gas optimization
- Batch operations
- Efficient data structures
- Storage optimization
- Function optimization

## Monitoring and Analytics

### Contract Events
- Mining events
- Reward distribution
- Staking events
- Upgrade events
- Error events
- Security events

### Frontend Analytics
- User interactions
- Performance metrics
- Error tracking
- Usage statistics
- Network status
- Gas usage

## Troubleshooting

### Common Issues
1. Wallet Connection
   - Check network configuration
   - Verify wallet compatibility
   - Clear cache and cookies
   - Check RPC endpoint

2. Transaction Failures
   - Check gas limits
   - Verify contract state
   - Check user balance
   - Verify network status

3. UI Issues
   - Clear browser cache
   - Check console errors
   - Verify component props
   - Check network requests

## Contributing Guidelines

### Code Style
- Follow TypeScript best practices
- Use ESLint configuration
- Follow Solidity style guide
- Write comprehensive tests
- Document all functions
- Use meaningful names

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request
6. Wait for review
7. Address feedback
8. Merge when approved

## Version Control

### Branch Strategy
- main: Production code
- develop: Development branch
- feature/*: Feature branches
- hotfix/*: Emergency fixes
- release/*: Release branches

### Release Process
1. Version bump
2. Changelog update
3. Tag creation
4. Deployment
5. Documentation update
6. Announcement

## Tokenomics

### Token Parameters
- **Total Supply**: 420,000,000 PXL
- **Initial Supply**: 4,200,000 PXL (1% of total supply)
- **Maximum Supply**: 420,000,000 PXL (defined in contract as `MAX_SUPPLY`)

### Token Generation Mechanics
- Each miner generates 120 H/s (defined in contract)
- Block reward: 50 PXL per block
- Block time: ~12 seconds (Base network)
- Blocks per day: ~7,200
- Daily network emission: ~360,000 PXL
- Monthly network emission: ~10,800,000 PXL
- Yearly network emission: ~131,400,000 PXL

### Deflationary Mechanisms
- Miner upgrades: 75% of upgrade value burned
- New miner purchases: 75% of purchase value burned
- Transfers: 0.1% of transfer value burned
- Special operations: 1-5% of operation value burned

### Limits and Mechanisms
- Maximum miners per user: 10
- Maximum total miners in network: 10,000
- Halving every 1,296,000 blocks (approximately 180 days on Base)
- Initial block reward: 50 PXL
- After each halving: reward / 2

### Token Distribution
- 40% - Mining Rewards
- 20% - Team & Development
- 15% - Marketing & Partnerships
- 15% - Liquidity Pool
- 10% - Community & Ecosystem

### Costs and Fees
- Initial miner cost: 0.001 ETH
- Miner upgrade cost: 5% of upgrade value
- New miner purchase cost: 2% of purchase value
- Transfer cost: 0.1% of transfer value

### Important Notes
- Token economics balanced by deflationary mechanisms
- 180-day halving ensures controlled emission
- Maximum supply capped at 420,000,000 PXL
- Token burning reduces supply during operations
- Network emission controlled by block rewards and halving
- Deflationary mechanisms help maintain token value

## Referral System Architecture

### Smart Contract Integration
```solidity
// MiningRig.sol referral functionality
function buyFacility(address referrer) external payable {
    require(msg.value >= 0.001 ether, "Insufficient ETH for facility");
    require(referrer != address(0) && referrer != msg.sender, "Invalid referrer");
    
    // Process facility purchase
    _placeStarterMiner(msg.sender);
    
    // Record referral
    referrals[msg.sender] = referrer;
}

function calculateReferralReward(uint256 miningReward) internal view returns (uint256) {
    return (miningReward * REFERRAL_PERCENTAGE) / 100;
}
```

### Frontend Implementation

#### Referral Link Generation
```typescript
const generateReferralLink = (address: string) => {
    return `${window.location.origin}?ref=${address}`;
};
```

#### Referral Tracking
- URL parameter handling in App.tsx
- LocalStorage persistence
- Automatic input population
- Validation and error handling

### Component Structure
```
src/
├── components/
│   ├── ReferralSystem.tsx    # Main referral component
│   └── ...
├── pages/
│   ├── Referral.tsx         # Referral page
│   └── ...
```

### Key Features
1. **Referral Link Generation**
   - Unique links per user
   - Easy sharing functionality
   - QR code generation

2. **Reward Distribution**
   - 5% of referred user's mining rewards
   - Automatic distribution
   - Real-time tracking

3. **Validation System**
   - Address format validation
   - Self-referral prevention
   - Duplicate referral prevention

4. **UI Components**
   - Referral link display
   - Reward statistics
   - Referral history
   - Copy to clipboard functionality

### State Management
```typescript
interface ReferralState {
    referrerAddress: string;
    referralCount: number;
    totalEarnings: number;
    referralHistory: ReferralEntry[];
}

interface ReferralEntry {
    address: string;
    timestamp: number;
    earnings: number;
}
```

### Security Considerations
1. **Input Validation**
   - Address format checking
   - Duplicate prevention
   - Self-referral prevention

2. **Transaction Security**
   - Gas optimization
   - Error handling
   - Transaction confirmation

3. **Data Persistence**
   - LocalStorage encryption
   - Secure state management
   - Cache invalidation

---

*This technical documentation is maintained by the PIXELMINER development team. Last updated: [Current Date]* 