const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment to Base network...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Use existing PixelMiner Token
  console.log("Using existing PixelMiner Token...");
  const pixelMinerAddress = "0xE0e3ce85cd2C74421a51232FF0b6f494cee02D51";
  const pixelMiner = await ethers.getContractAt("PixelMiner", pixelMinerAddress);
  console.log("PixelMiner Token address:", pixelMinerAddress);

  // Deploy PixelMinerMining
  console.log("Deploying PixelMinerMining contract...");
  const PixelMinerMining = await ethers.getContractFactory("PixelMinerMining");
  const mining = await PixelMinerMining.deploy();
  await mining.waitForDeployment();
  console.log("PixelMinerMining deployed to:", await mining.getAddress());

  // Set the token address in the mining contract
  console.log("Setting token address in mining contract...");
  const tx = await mining.setEthermax(pixelMinerAddress);
  await tx.wait();
  console.log("Token address set in mining contract");

  // Add mining contract as authorized minter
  console.log("Adding mining contract as authorized minter...");
  const miningAddress = await mining.getAddress();
  const addMinterTx = await pixelMiner.addMinter(miningAddress);
  await addMinterTx.wait();
  console.log("Mining contract added as authorized minter");

  // Add initial miners
  console.log("Adding initial miners...");
  const addMinerTx = await mining.addMiner(
    ethers.utils.parseEther("100"), // hashrate
    ethers.utils.parseEther("10"),  // power consumption
    ethers.utils.parseEther("1000"), // cost
    true // inProduction
  );
  await addMinerTx.wait();
  console.log("Initial miner added");

  // Add initial facility
  console.log("Adding initial facility...");
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

  console.log("Deployment completed successfully!");
  console.log("Network: Base Mainnet");
  console.log("PixelMiner Token:", pixelMiner.address);
  console.log("PixelMinerMining:", mining.address);
  console.log("LP Address:", lpAddress);
  console.log("Deployer:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 