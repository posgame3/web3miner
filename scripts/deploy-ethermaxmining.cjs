const { ethers } = require("hardhat");
const { networks } = require("../src/config/networks");

// Get network from environment or default to sepolia
const network = process.env.NETWORK || 'sepolia';
const { ETHERMAX_ADDRESS } = networks[network];

async function main() {
  console.log("Deploying EthermaxMining contract...");
  
  // Deploy EthermaxMining
  const EthermaxMining = await ethers.getContractFactory("EthermaxMining");
  const mining = await EthermaxMining.deploy();
  await mining.deployed();
  console.log("EthermaxMining deployed to:", mining.address);

  // Set the token address in the mining contract
  console.log("Setting token address in mining contract...");
  const tx = await mining.setEthermax(ETHERMAX_ADDRESS);
  await tx.wait();
  console.log("Token address set in mining contract");

  // Add mining contract as authorized minter
  console.log("Adding mining contract as authorized minter...");
  const ethermax = await ethers.getContractAt("Ethermax", ETHERMAX_ADDRESS);
  const addMinterTx = await ethermax.addMinter(mining.address);
  await addMinterTx.wait();
  console.log("Mining contract added as authorized minter");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 