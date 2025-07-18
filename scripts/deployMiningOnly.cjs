const { ethers } = require("hardhat");

async function main() {
  console.log("Starting mining contract deployment...");

  // Already deployed token address
  const pixelMinerAddress = "0xE0e3ce85cd2C74421a51232FF0b6f494cee02D51";

  // Deploy PixelMinerMining
  console.log("Deploying PixelMinerMining contract...");
  const PixelMinerMining = await ethers.getContractFactory("PixelMinerMining");
  const mining = await PixelMinerMining.deploy();
  await mining.waitForDeployment();
  const miningAddress = await mining.getAddress();
  console.log("PixelMinerMining deployed to:", miningAddress);

  // Set the token address in the mining contract
  console.log("Setting token address in mining contract...");
  const tx = await mining.setEthermax(pixelMinerAddress);
  await tx.wait();
  console.log("Token address set in mining contract");

  // Add mining contract as authorized minter
  console.log("Adding mining contract as authorized minter...");
  const pixelMiner = await ethers.getContractAt("PixelMiner", pixelMinerAddress);
  const addMinterTx = await pixelMiner.addMinter(miningAddress);
  await addMinterTx.wait();
  console.log("Mining contract added as authorized minter");

  console.log("Deployment completed successfully!");
  console.log("PixelMiner Token:", pixelMinerAddress);
  console.log("PixelMinerMining:", miningAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 