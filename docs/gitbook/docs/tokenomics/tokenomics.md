# Tokenomics

## Token Distribution

Total Supply: 420,000,000 PXL
Initial Supply: 4,200,000 PXL (1% of total supply)

Initial Distribution:
- 40% - Mining Rewards
- 20% - Team & Development
- 15% - Marketing & Partnerships
- 15% - Liquidity Pool
- 10% - Community & Ecosystem

## Mining System

### Mining Mechanics
Miners increase your hashrate on the PixelMiner network, enabling PXL rewards. Each miner is defined by three key attributes:

1. **Hashrate**: The computational power that the miner contributes to your operation
2. **Energy Usage**: The electrical power needed to operate each miner efficiently
3. **Cost**: The PXL cost to acquire a miner for your facility

Players can buy miners anytime with PXL, as long as they have enough power output in their facility.

### Mining Rewards
- Initial block reward: 50 PXL per block
- Block time: ~12 seconds (Base network)
- Blocks per day: ~7,200
- Daily network emission: ~360,000 PXL
- Monthly network emission: ~10,800,000 PXL
- Yearly network emission: ~131,400,000 PXL

### Halving Schedule
Mining rewards are halved every 1,296,000 blocks (approximately 30 days) to ensure long-term sustainability and controlled token emission:

1. Initial Phase (0-30 days):
   - Base mining rate: 50 PXL per block
   - Target: Reach 10% of max supply

2. First Halving (30-60 days):
   - Base mining rate: 25 PXL per block
   - Target: Reach 20% of max supply

3. Second Halving (60-90 days):
   - Base mining rate: 12.5 PXL per block
   - Target: Reach 30% of max supply

And so on until reaching the maximum supply of 420,000,000 PXL

## Deflationary Mechanisms

### Burn Rates
- 75% of miner purchase costs are burned
- 75% of facility upgrade costs are burned
- Referral fee: 2.5% of mining rewards
- Burn tracking through `amtBurned` in smart contract

### Token Burning
The contract implements a burn mechanism that:
- Tracks total burned amount
- Ensures MAX_SUPPLY is never exceeded
- Reduces circulating supply over time
- Increases token scarcity

## Miner Tiers

### Tier 1 - Starter Miner
- Hashrate: 100 H/s
- Power Consumption: 1 GW
- Cost: Free (one-time claim)
- Ideal for: Beginners and small operations

### Tier 2 - Gaming PC
- Hashrate: 600 H/s
- Power Consumption: 18 GW
- Cost: 120 PXL
- Ideal for: Growing mining operations

### Tier 3 - Hacking PC
- Hashrate: 920 H/s
- Power Consumption: 22 GW
- Cost: 220 PXL
- Ideal for: Serious miners

### Tier 4 - Master Race
- Hashrate: 1500 H/s
- Power Consumption: 30 GW
- Cost: 402 PXL
- Ideal for: Professional mining facilities

## Mining Efficiency

### Power Management
- Each facility has a maximum power output
- Miners require power to operate
- Exceeding power capacity reduces mining efficiency
- Upgrade facilities to increase power capacity
- **Important**: There is a 24-hour cooldown period between facility upgrades

### Hashrate Optimization
- Higher hashrate = more mining rewards
- Balance between hashrate and power consumption
- Strategic placement of miners in facilities
- Upgrade paths for existing miners

### Facility Upgrade System
- Each facility level increases power capacity and efficiency
- 24-hour cooldown period between upgrades
- Plan your upgrades strategically
- Consider power requirements of future miners
- Upgrade timing affects overall mining efficiency

## Token Utility

PXL tokens serve multiple purposes within the PixelMiner ecosystem:

1. **Mining Equipment Purchase**
   - Used to purchase different types of mining equipment
   - Higher-tier equipment requires more PXL tokens

2. **Facility Upgrades**
   - Upgrade mining facilities to increase efficiency
   - Unlock additional features and capabilities

3. **Governance**
   - Token holders can participate in protocol governance
   - Vote on important protocol decisions and updates

4. **Staking**
   - Stake PXL tokens to earn additional rewards
   - Participate in network security

## Economic Model

The PixelMiner economic model is designed to ensure:

1. **Long-term Sustainability**
   - Regular halving events control token emission
   - Balanced distribution between mining and other uses
   - Maximum supply cap of 420,000,000 PXL

2. **Fair Distribution**
   - Majority of tokens allocated to mining rewards
   - Equal opportunity for all participants
   - Controlled initial supply of 4,200,000 PXL

3. **Value Accrual**
   - Multiple utility cases for PXL tokens
   - Growing ecosystem increases token demand
   - Mining rewards based on hashrate contribution

4. **Anti-inflationary Measures**
   - Controlled token emission through halving
   - Burning mechanisms for excess tokens
   - Maximum supply limit

## Future Developments

1. **Additional Token Utilities**
   - NFT marketplace integration
   - Cross-chain bridge implementation
   - DeFi features and yield farming

2. **Ecosystem Expansion**
   - New miner types and facilities
   - Enhanced mining mechanics
   - Community-driven features

3. **Governance Evolution**
   - DAO implementation
   - Enhanced voting mechanisms
   - Community treasury management 