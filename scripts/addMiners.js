const { ethers } = require("hardhat");
const { networks } = require("../src/config/networks");

// Get network from environment or default to sepolia
const network = process.env.NETWORK || 'sepolia';
const { MINING_ADDRESS } = networks[network];

async function main() {
  console.log("Adding miners...");
  const mining = await ethers.getContractAt("EthermaxMining", MINING_ADDRESS);

  // Add miners
  const addMinerTx = await mining.addMiner(
    ethers.utils.parseEther("100"), // hashrate
    ethers.utils.parseEther("10"),  // power consumption
    ethers.utils.parseEther("1000"), // cost
    true // inProduction
  );
  await addMinerTx.wait();
  console.log("Miner added");

  // Add more miners as needed...
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 