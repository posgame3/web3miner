const { run } = require("hardhat");

async function main() {
  const pixelMinerAddress = "0x903D72Ee67BFBA9305819e0881414e5ADd3270D0";
  const miningAddress = "0xb3ca0813C6D07e9c60f74f9B4662911aC3bcccfb";
  const lpAddress = "0x8c6FD82E496CED7432D0829E362f06A051Cbd755";

  console.log("Verifying contracts on Base network...");

  // Verify PixelMiner Token
  console.log("Verifying PixelMiner Token...");
  try {
    await run("verify:verify", {
      address: pixelMinerAddress,
      constructorArguments: [lpAddress],
      network: "base"
    });
    console.log("PixelMiner Token verified successfully!");
  } catch (error) {
    console.log("PixelMiner Token verification failed:", error.message);
  }

  // Verify PixelMinerMining
  console.log("Verifying PixelMinerMining contract...");
  try {
    await run("verify:verify", {
      address: miningAddress,
      constructorArguments: [],
      network: "base"
    });
    console.log("PixelMinerMining verified successfully!");
  } catch (error) {
    console.log("PixelMinerMining verification failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 