const { ethers } = require("hardhat");

async function main() {
  const signer = await ethers.provider.getSigner();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  
  console.log("Wallet address:", address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 