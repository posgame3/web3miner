# Base Network Deployment Guide

## Prerequisites

1. **Private Key**: Your private key is already configured in the Hardhat config
2. **Base Network RPC**: Using public RPC endpoint (https://mainnet.base.org)
3. **BaseScan API Key**: Optional for contract verification

## Deployment Steps

### 1. Compile Contracts
```bash
npx hardhat compile
```

### 2. Deploy to Base Mainnet
```bash
npx hardhat run scripts/deploy-base.cjs --network base
```

### 3. Deploy to Base Sepolia (Testnet - Optional)
```bash
npx hardhat run scripts/deploy-base-sepolia.cjs --network baseSepolia
```

### 4. Verify Contracts (Optional)
After deployment, update the addresses in `scripts/verify-base.cjs` and run:
```bash
npx hardhat run scripts/verify-base.cjs --network base
```

## Network Configuration

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org

## Gas Configuration
- **Gas Price**: 1 Gwei (1000000000 wei)
- **Gas Limit**: Auto-estimated by Hardhat

## Important Notes

1. **LP Address**: Currently set to `0x8c6FD82E496CED7432D0829E362f06A051Cbd755`
2. **Initial Setup**: The deployment script automatically:
   - Deploys both Ethermax token and EthermaxMining contracts
   - Links the contracts together
   - Adds initial miner and facility
   - Sets up minting permissions

3. **Security**: The private key is hardcoded in the config for this deployment. Consider using environment variables for production.

## Post-Deployment

After successful deployment, you'll need to:
1. Update the frontend configuration with new contract addresses
2. Update the `src/config/contracts.ts` file
3. Test the contracts on Base network
4. Update documentation with new addresses

## Troubleshooting

- **Insufficient Balance**: Ensure the deployer account has enough ETH for gas fees
- **Gas Issues**: Base network typically has low gas fees, but you can adjust gas price if needed
- **Verification Issues**: Make sure you have a BaseScan API key for contract verification 