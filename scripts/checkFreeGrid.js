const { ethers } = require("hardhat");
const { networks } = require("../src/config/networks");

// Get network from environment or default to sepolia
const network = process.env.NETWORK || 'sepolia';
const { MINING_ADDRESS } = networks[network];

async function main() {
  console.log("Checking free grid spaces...");
  const mining = await ethers.getContractAt("EthermaxMining", MINING_ADDRESS);
  
  // Get facility dimensions
  const facility = await mining.ownerToFacility(await ethers.provider.getSigner().getAddress());
  const x = Number(facility[4]);
  const y = Number(facility[5]);
  
  console.log(`Facility dimensions: ${x}x${y}`);
  
  // Check each coordinate
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      const isOccupied = await mining.playerOccupiedCoords(
        await ethers.provider.getSigner().getAddress(),
        i,
        j
      );
      console.log(`Position (${i},${j}): ${isOccupied ? 'Occupied' : 'Free'}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 