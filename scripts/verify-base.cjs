const { run } = require("hardhat");

async function main() {
  const pixelMinerAddress = "0xE0e3ce85cd2C74421a51232FF0b6f494cee02D51";
const miningAddress = "0x82A792BEcd7031C610b75720D2Db476BBf4f72D0";
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