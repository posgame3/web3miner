import { ethers } from "hardhat";

async function main() {
  // Deploy PXL token
  const Ethermax = await ethers.getContractFactory("Ethermax");
  console.log("Deploying PXL token...");
  const maxx = await Ethermax.deploy();
  await maxx.waitForDeployment();
  console.log("PXL Token deployed to:", await maxx.getAddress());

  // Deploy mining contract
  const EthermaxMining = await ethers.getContractFactory("EthermaxMining");
  console.log("Deploying mining contract...");
  const mining = await EthermaxMining.deploy(await maxx.getAddress());
  await mining.waitForDeployment();
  console.log("Mining contract deployed to:", await mining.getAddress());

  // Save addresses to .env
  const fs = require('fs');
  const envContent = `
NEXT_PUBLIC_MINING_ADDRESS=${await mining.getAddress()}
NEXT_PUBLIC_PXL_ADDRESS=${await maxx.getAddress()}
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=1337
  `.trim();

  fs.writeFileSync('.env.local', envContent);
  console.log("Addresses saved to .env.local");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 