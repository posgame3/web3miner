const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy PixelMiner Token
  console.log("Deploying PixelMiner Token...");
  const PixelMiner = await ethers.getContractFactory("PixelMiner");
  const lpAddress = "0x1D54fDE8ed9C6856960c6AB2376948F962d071A6";
  const pixelMiner = await PixelMiner.deploy(lpAddress);
  await pixelMiner.waitForDeployment();
  const pixelMinerAddress = await pixelMiner.getAddress();
  console.log("PixelMiner Token deployed to:", pixelMinerAddress);

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
  const addMinterTx = await pixelMiner.addMinter(miningAddress);
  await addMinterTx.wait();
  console.log("Mining contract added as authorized minter");

  // Add initial miners
  console.log("Adding initial miners...");
  const addMinerTx = await mining.addMiner(
    ethers.parseEther("100"), // hashrate
    ethers.parseEther("10"),  // power consumption
    ethers.parseEther("1000"), // cost
    true // inProduction
  );
  await addMinerTx.wait();
  console.log("Initial miner added");

  // Add initial facility
  console.log("Adding initial facility...");
  const addFacilityTx = await mining.addFacility(
    4, // maxMiners
    ethers.parseEther("1000"), // totalPowerOutput
    ethers.parseEther("5000"), // cost
    true, // inProduction
    2, // x
    2  // y
  );
  await addFacilityTx.wait();
  console.log("Initial facility added");

  console.log("Deployment completed successfully!");
  console.log("PixelMiner Token:", pixelMinerAddress);
  console.log("PixelMinerMining:", miningAddress);
  console.log("LP Address:", lpAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 