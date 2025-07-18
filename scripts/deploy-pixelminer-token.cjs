const { ethers } = require("hardhat");

async function main() {
  console.log("Starting PixelMiner Token deployment to Base network...");

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

  console.log("Deployment completed successfully!");
  console.log("Network: Base Mainnet");
  console.log("PixelMiner Token:", await pixelMiner.getAddress());
  console.log("LP Address:", lpAddress);
  console.log("Deployer:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 