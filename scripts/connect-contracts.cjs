const { ethers } = require("hardhat");

async function main() {
  console.log("Connecting contracts on Base network...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Connecting contracts with account:", deployer.address);

  // Contract addresses
  const pixelMinerAddress = "0xE0e3ce85cd2C74421a51232FF0b6f494cee02D51";
const miningAddress = "0x82A792BEcd7031C610b75720D2Db476BBf4f72D0";

  // Get contract instances
  const pixelMiner = await ethers.getContractAt("PixelMiner", pixelMinerAddress);
  const mining = await ethers.getContractAt("PixelMinerMining", miningAddress);

  console.log("PixelMiner Token:", pixelMinerAddress);
  console.log("PixelMinerMining:", miningAddress);

  try {
    // 1. Set token address in mining contract
    console.log("Setting token address in mining contract...");
    const setTokenTx = await mining.setEthermax(pixelMinerAddress);
    await setTokenTx.wait();
    console.log("✅ Token address set in mining contract");

    // 2. Add mining contract as authorized minter
    console.log("Adding mining contract as authorized minter...");
    const addMinterTx = await pixelMiner.addMinter(miningAddress);
    await addMinterTx.wait();
    console.log("✅ Mining contract added as authorized minter");

    console.log("🎉 Contracts successfully connected!");
    console.log("Network: Base Mainnet");
    console.log("PixelMiner Token:", pixelMinerAddress);
    console.log("PixelMinerMining:", miningAddress);
    console.log("Deployer:", deployer.address);

  } catch (error) {
    console.error("❌ Error connecting contracts:", error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 