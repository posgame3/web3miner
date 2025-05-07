# Ethermax Mining dApp Documentation

Welcome to the documentation for the Ethermax Mining dApp – a decentralized, play-to-earn mining game built on Ethereum. This version runs on a local Ganache blockchain for testing and development purposes.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Local Development Setup](#local-development-setup)
   - [Installing Ganache](#installing-ganache)
   - [Configuring Your Environment](#configuring-your-environment)
3. [Getting Started](#getting-started)
   - [Connecting Your Wallet](#connecting-your-wallet)
   - [Buying Your Starter Facility](#buying-your-starter-facility)
   - [Claiming Your Free Miner](#claiming-your-free-miner)
4. [Expanding Your Mining Operation](#expanding-your-mining-operation)
   - [Buying Additional Miners](#buying-additional-miners)
   - [Upgrading Your Facility](#upgrading-your-facility)
5. [Mining & Rewards](#mining--rewards)
6. [The $MAXX Token](#the-maxx-token)
7. [Smart Contracts](#smart-contracts)
8. [User Flow](#user-flow)
9. [FAQ](#faq)
10. [Links](#links)
11. [Contact & Support](#contact--support)

---

## Introduction

Ethermax Mining is a decentralized play-to-earn game where players build virtual mining rooms, purchase facilities and miners, and earn $MAXX tokens through Proof-of-Work mining. The game is currently running on a local Ganache blockchain for testing purposes.

---

## Local Development Setup

### Installing Ganache

1. Install Ganache CLI:
```bash
npm install -g ganache
```

2. Start a local blockchain:
```bash
ganache --chain.chainId 1337 --database.dbPath ./chaindata
```

### Configuring Your Environment

1. Update your `.env` file with local network settings:
```env
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=1337
```

2. Deploy contracts to local network:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

3. Update contract addresses in your configuration files.

---

## Getting Started

### Connecting Your Wallet

- Click **Connect Wallet** on the dApp homepage.
- Add the local Ganache network to your MetaMask:
  - Network Name: `Localhost 8545`
  - RPC URL: `http://127.0.0.1:8545`
  - Chain ID: `1337`
  - Currency Symbol: `ETH`
- Import one of the Ganache test accounts using its private key.

### Buying Your Starter Facility

- Every new player must purchase a starter facility using a small ETH deposit (e.g., `0.001 ETH`).
- The starter facility provides a 2x2 grid and a power generator.
- After purchase, you can claim your free starter miner.

### Claiming Your Free Miner

- After buying your facility, select an available tile on the grid.
- Click **Claim Free Miner** to receive your starter miner.
- The miner will be placed on the selected tile and will start mining $MAXX immediately.

---

## Expanding Your Mining Operation

### Buying Additional Miners

- Additional miners are purchased using the $MAXX token.
- Select a tile on your grid and click **Buy Miner**.
- Each miner has unique stats: hashrate, power consumption, and price.

### Upgrading Your Facility

- Once your grid is full, you can upgrade your facility to unlock more space and power.
- Upgrades require $MAXX and are subject to a cooldown period.

---

## Mining & Rewards

- Mining is automatic once a miner is placed on the grid.
- $MAXX rewards accrue in real time and can be claimed at any time by clicking **Claim Rewards**.
- Your mining power and rewards are displayed in the dashboard.

---

## The $MAXX Token

- $MAXX is an ERC20 token used for buying miners, upgrading facilities, and claiming rewards.
- You can earn $MAXX through mining or purchase it on Uniswap.
- Add $MAXX to your wallet using the **Add MAXX to Wallet** button in the Resource Management section.

---

## Smart Contracts

- **EthermaxMining** – Main game contract (facilities, miners, rewards)
- **Ethermax** – $MAXX token contract

> All contract addresses and ABIs are available in the [Links](#links) section.

---

## User Flow

1. Connect your wallet to local Ganache network.
2. Buy a facility (pay ETH).
3. Claim your free starter miner (choose a tile).
4. Buy additional miners ($MAXX).
5. Upgrade your facility as needed.
6. Claim your mining rewards.

---

## FAQ

**Q: I can't connect to the local network!**  
A: Make sure Ganache is running and you've added the local network to MetaMask with the correct settings.

**Q: I can't buy a facility or claim a miner!**  
A: Make sure you have enough ETH in your Ganache test account and have selected a free tile.

**Q: How do I add $MAXX to my wallet?**  
A: Click **Add MAXX to Wallet** in the Resource Management section.

**Q: Why can't I buy more miners?**  
A: You may need to upgrade your facility to unlock more space.

---

## Links

- [dApp Homepage](http://localhost:3000)
- [Ganache Documentation](https://trufflesuite.com/docs/ganache/)
- [Hardhat Documentation](https://hardhat.org/getting-started/)

---

## Contact & Support

- Discord: [Your Discord Link]
- Twitter: [Your Twitter Link]
- Email: [your@email.com]

---

*Powered by Ethermax Mining dApp – Play, Earn, Upgrade!* 