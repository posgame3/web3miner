const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Deploy Ethermax Token
  console.log("Deploying Ethermax Token...");
  const Ethermax = await ethers.getContractFactory("Ethermax");
  const lpAddress = "0x570a3D83D2658ed3c240C682aE919074b0317CAa";
  const ethermax = await Ethermax.deploy(lpAddress);
  await ethermax.deployed();
  console.log("Ethermax Token deployed to:", ethermax.address);

  // Deploy EthermaxMining
  console.log("Deploying EthermaxMining contract...");
  const EthermaxMining = await ethers.getContractFactory("EthermaxMining");
  const mining = await EthermaxMining.deploy();
  await mining.deployed();
  console.log("EthermaxMining deployed to:", mining.address);

  // Set the token address in the mining contract
  console.log("Setting token address in mining contract...");
  const tx = await mining.setEthermax(ethermax.address);
  await tx.wait();
  console.log("Token address set in mining contract");

  // Add mining contract as authorized minter
  console.log("Adding mining contract as authorized minter...");
  const addMinterTx = await ethermax.addMinter(mining.address);
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
  console.log("Ethermax Token:", ethermax.address);
  console.log("EthermaxMining:", mining.address);
  console.log("LP Address:", lpAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 