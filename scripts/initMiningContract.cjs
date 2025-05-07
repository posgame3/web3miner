const { ethers } = require("ethers");
const MINING_ABI = require("../src/abi/EthermaxMining.json").abi;
const ETHERMAX_ABI = require("../src/abi/Ethermax.json").abi;

// --- KONFIGURACJA ---
const MINING_ADDRESS = "0x1CBc0CAF09F216D2eF09B575c6D0b9D597d9D08B";
const ETHERMAX_ADDRESS = "0xE55896F42a17814DF017A1eaD7b5A4d6090F0f5d";

const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/d1ed215e253e40f5b485ac8f5fc8cf87");
const signer = new ethers.Wallet("b8fb39da0a2d8ce2a1745fbf56a8d3c28bd6fffca273199bd59a506058506125", provider);

// --- PARAMETRY ---
const FEE_RECIPIENT = "0x570a3D83D2658ed3c240C682aE919074b0317CAa";
const STARTER_FACILITY_INDEX = 1;
const STARTER_FACILITY_PRICE = ethers.utils.parseEther("0.01");
const BURN_PCT = "750000000000000000";
const REFERRAL_FEE = "25000000000000000";
const COOLDOWN = 86400;
const FACILITY_FEE = "100000000000000000";

async function main() {
  const mining = new ethers.Contract(MINING_ADDRESS, MINING_ABI, signer);
  const maxx = new ethers.Contract(ETHERMAX_ADDRESS, ETHERMAX_ABI, signer);

  await (await mining.setEthermax(ETHERMAX_ADDRESS)).wait();
  console.log("setEthermax OK");

  await (await mining.setDekalitRektoshi(FEE_RECIPIENT)).wait();
  console.log("setDekalitRektoshi OK");

  await (await maxx.addMinter(MINING_ADDRESS)).wait();
  console.log("addMinter OK");

  await (await mining.setInitialFacilityPrice(STARTER_FACILITY_PRICE)).wait();
  console.log("setInitialFacilityPrice OK");

  await (await mining.setBurnPct(BURN_PCT)).wait();
  console.log("setBurnPct OK");
  await (await mining.setReferralFee(REFERRAL_FEE)).wait();
  console.log("setReferralFee OK");
  await (await mining.setCooldown(COOLDOWN)).wait();
  console.log("setCooldown OK");

  await (await mining.toggleFacilityProduction(STARTER_FACILITY_INDEX, true)).wait();
  console.log("toggleFacilityProduction OK");

  await (await mining.setFacilityFee(STARTER_FACILITY_INDEX, FACILITY_FEE)).wait();
  console.log("setFacilityFee OK");

  await (await mining.setFacilityFeeRecipient(FEE_RECIPIENT)).wait();
  console.log("setFacilityFeeRecipient OK");

  console.log("Inicjalizacja zakończona!");
}

main().catch(console.error); 