type NetworkConfig = {
  MINING_ADDRESS: string;
  ETHERMAX_ADDRESS: string;
};

type Networks = {
  sepolia: NetworkConfig;
  mainnet: NetworkConfig;
};

export const networks: Networks = {
  sepolia: {
    MINING_ADDRESS: '0x1CBc0CAF09F216D2eF09B575c6D0b9D597d9D08B',
    ETHERMAX_ADDRESS: '0xE55896F42a17814DF017A1eaD7b5A4d6090F0f5d'
  },
  mainnet: {
    MINING_ADDRESS: '', // TODO: Add mainnet addresses after deployment
    ETHERMAX_ADDRESS: ''
  }
};

// Get current network from environment variable or default to sepolia
const network = (process.env.NEXT_PUBLIC_NETWORK || 'sepolia') as keyof Networks;

// Export current network configuration
export const { MINING_ADDRESS, ETHERMAX_ADDRESS } = networks[network]; 