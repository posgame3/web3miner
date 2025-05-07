const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const lpAddress = "0x570a3D83D2658ed3c240C682aE919074b0317CAa";
  
  const Ethermax = await ethers.getContractFactory("Ethermax");
  const ethermax = await Ethermax.deploy(lpAddress);
  await ethermax.waitForDeployment();

  const address = await ethermax.getAddress();
  console.log("Ethermax deployed to:", address);
  console.log("LP Address:", lpAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 