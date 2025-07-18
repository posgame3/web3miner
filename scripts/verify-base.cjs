const { run } = require("hardhat");

async function main() {
  const ethermaxAddress = "0x37d2f0921e4bA6a316118159c218e56F35a9dC06";
  const miningAddress = "0x025007A0D4c9c5b8cC85eE5267fa5D24dbEF0323";
  const lpAddress = "0x8c6FD82E496CED7432D0829E362f06A051Cbd755";

  console.log("Verifying contracts on Base network...");

  // Verify Ethermax Token
  console.log("Verifying Ethermax Token...");
  try {
    await run("verify:verify", {
      address: ethermaxAddress,
      constructorArguments: [lpAddress],
      network: "base"
    });
    console.log("Ethermax Token verified successfully!");
  } catch (error) {
    console.log("Ethermax Token verification failed:", error.message);
  }

  // Verify EthermaxMining
  console.log("Verifying EthermaxMining contract...");
  try {
    await run("verify:verify", {
      address: miningAddress,
      constructorArguments: [],
      network: "base"
    });
    console.log("EthermaxMining verified successfully!");
  } catch (error) {
    console.log("EthermaxMining verification failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 