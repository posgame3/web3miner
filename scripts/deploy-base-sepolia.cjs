const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment to Base Sepolia testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy PixelMiner Token
  console.log("Deploying PixelMiner Token...");
  const PixelMiner = await ethers.getContractFactory("PixelMiner");
  const lpAddress = "0x8c6FD82E496CED7432D0829E362f06A051Cbd755";
  const pixelMiner = await PixelMiner.deploy(lpAddress);
  await pixelMiner.waitForDeployment();
  console.log("PixelMiner Token deployed to:", await pixelMiner.getAddress());

  // Deploy PixelMinerMining
  console.log("Deploying PixelMinerMining contract...");
  const PixelMinerMining = await ethers.getContractFactory("PixelMinerMining");
  const mining = await PixelMinerMining.deploy();
  await mining.waitForDeployment();
  console.log("PixelMinerMining deployed to:", await mining.getAddress());

  // Set the token address in the mining contract
  console.log("Setting token address in mining contract...");
  const tx = await mining.setEthermax(pixelMiner.address);
  await tx.wait();
  console.log("Token address set in mining contract");

  // Add mining contract as authorized minter
  console.log("Adding mining contract as authorized minter...");
  const addMinterTx = await pixelMiner.addMinter(mining.address);
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
  console.log("Network: Base Sepolia Testnet");
  console.log("PixelMiner Token:", pixelMiner.address);
  console.log("PixelMinerMining:", mining.address);
  console.log("LP Address:", lpAddress);
  console.log("Deployer:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 