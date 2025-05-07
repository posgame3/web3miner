const { ethers } = require("hardhat");
const { networks } = require("../src/config/networks");

// Get network from environment or default to sepolia
const network = process.env.NETWORK || 'sepolia';
const { MINING_ADDRESS, ETHERMAX_ADDRESS } = networks[network];

async function main() {
  console.log("Initializing mining contract...");
  const mining = await ethers.getContractAt("EthermaxMining", MINING_ADDRESS);
  const ethermax = await ethers.getContractAt("Ethermax", ETHERMAX_ADDRESS);

  // Set token address in mining contract
  const setTokenTx = await mining.setEthermax(ETHERMAX_ADDRESS);
  await setTokenTx.wait();
  console.log("Token address set in mining contract");

  // Add mining contract as authorized minter
  const addMinterTx = await ethermax.addMinter(MINING_ADDRESS);
  await addMinterTx.wait();
  console.log("Mining contract added as authorized minter");

  // Add initial miners
  const addMinerTx = await mining.addMiner(
    ethers.utils.parseEther("100"), // hashrate
    ethers.utils.parseEther("10"),  // power consumption
    ethers.utils.parseEther("1000"), // cost
    true // inProduction
  );
  await addMinerTx.wait();
  console.log("Initial miner added");

  // Add initial facility
  const addFacilityTx = await mining.addFacility(
    4, // maxMiners
    ethers.utils.parseEther("1000"), // totalPowerOutput
    ethers.utils.parseEther("5000"), // cost
    true, // inProduction
    2, // x
    2  // y
  );
  await addFacilityTx.wait();
  console.log("Initial facility added");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 