const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const lpAddress = "0x1D54fDE8ed9C6856960c6AB2376948F962d071A6";
  
  const PixelMiner = await ethers.getContractFactory("PixelMiner");
  const pixelMiner = await PixelMiner.deploy(lpAddress);
  await pixelMiner.waitForDeployment();

  const address = await pixelMiner.getAddress();
  console.log("PixelMiner deployed to:", address);
  console.log("LP Address:", lpAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 