const { ethers } = require("ethers");
const MINING_ABI = require("../src/abi/EthermaxMining.json").abi;

// Adres kontraktu i użytkownika
const MINING_ADDRESS = "0x1CBc0CAF09F216D2eF09B575c6D0b9D597d9D08B";
const USER_ADDRESS = "0x570a3D83D2658ed3c240C682aE919074b0317CAa";

// Provider do Sepolia (Infura)
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/d1ed215e253e40f5b485ac8f5fc8cf87");

async function main() {
  const mining = new ethers.Contract(MINING_ADDRESS, MINING_ABI, provider);
  // Pobierz facility
  const facility = await mining.ownerToFacility(USER_ADDRESS);
  const xMax = Number(facility.x);
  const yMax = Number(facility.y);
  console.log(`Facility size: ${xMax} x ${yMax}`);
  console.log("Sprawdzam wolne pola:");
  for (let x = 0; x < xMax; x++) {
    for (let y = 0; y < yMax; y++) {
      const occupied = await mining.playerOccupiedCoords(USER_ADDRESS, x, y);
      console.log(`Pole (${x},${y}): ${occupied ? 'Zajęte' : 'Wolne'}`);
    }
  }
}

main().catch(console.error); 