require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["cc29642986e51b7d81b09cc01cf53cf3b7d05a4e1b6150d10ad29b5cca6f06fd"],
      chainId: 8453,
      gasPrice: 1000000000, // 1 gwei
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : ["cc29642986e51b7d81b09cc01cf53cf3b7d05a4e1b6150d10ad29b5cca6f06fd"],
      chainId: 84532,
      gasPrice: 1000000000, // 1 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8546",
      chainId: 1337,
    }
  },
  etherscan: {
    apiKey: {
      base: process.env.ETHERSCAN_API_KEY || process.env.BASE_SCAN_API_KEY || "M576NNRBFMQ6Y2N8R11SXWRT8MNPIJKSVI",
      baseSepolia: process.env.ETHERSCAN_API_KEY || process.env.BASE_SCAN_API_KEY || "M576NNRBFMQ6Y2N8R11SXWRT8MNPIJKSVI"
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.etherscan.io/api?chainid=8453",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api.etherscan.io/api?chainid=84532",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  },
  paths: {
    sources: "./src/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}; 