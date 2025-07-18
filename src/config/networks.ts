type NetworkConfig = {
  MINING_ADDRESS: string;
  PIXELMINER_ADDRESS: string;
};

type Networks = {
  sepolia: NetworkConfig;
  mainnet: NetworkConfig;
  base: NetworkConfig;
};

export const networks: Networks = {
  sepolia: {
    MINING_ADDRESS: '0x1CBc0CAF09F216D2eF09B575c6D0b9D597d9D08B',
    PIXELMINER_ADDRESS: '0xE55896F42a17814DF017A1eaD7b5A4d6090F0f5d'
  },
  mainnet: {
    MINING_ADDRESS: '', // TODO: Add mainnet addresses after deployment
    PIXELMINER_ADDRESS: ''
  },
  base: {
    MINING_ADDRESS: '0x82A792BEcd7031C610b75720D2Db476BBf4f72D0',
    PIXELMINER_ADDRESS: '0xE0e3ce85cd2C74421a51232FF0b6f494cee02D51'
  }
};

// Get current network from environment variable or default to base
const network = (process.env.NEXT_PUBLIC_NETWORK || 'base') as keyof Networks;

// Export current network configuration
export const { MINING_ADDRESS, PIXELMINER_ADDRESS } = networks[network]; 