const { ethers } = require("hardhat");
const { networks } = require("../src/config/networks");

// Get network from environment or default to sepolia
const network = process.env.NETWORK || 'sepolia';
const { MINING_ADDRESS } = networks[network];

async function main() {
  console.log("Setting starter facility price and production...");
  const mining = await ethers.getContractAt("EthermaxMining", MINING_ADDRESS);

  // Set starter facility price
  const setPriceTx = await mining.setInitialFacilityPrice(ethers.utils.parseEther("0.01"));
  await setPriceTx.wait();
  console.log("Starter facility price set");

  // Toggle starter facility production
  const toggleTx = await mining.toggleFacilityProduction(1, true);
  await toggleTx.wait();
  console.log("Starter facility production toggled");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 