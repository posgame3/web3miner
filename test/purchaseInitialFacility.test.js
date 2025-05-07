import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("EthermaxMining: purchaseInitialFacility", function () {
  let mining, owner, user, referrer;
  const initialPrice = ethers.parseEther("0.001");
  const DEFAULT_REFERRER = "0x6550DdCF312ff30198686433B452407eeF59055A";

  beforeEach(async function () {
    [owner, user, referrer] = await ethers.getSigners();
    const addrs = "0x6550DdCF312ff30198686433B452407eeF59055A";
    const Mining = await ethers.getContractFactory("EthermaxMining");
    mining = await Mining.deploy();
    await mining.waitForDeployment();
    // Ustaw starter facility w produkcji i cenę
    await mining.toggleFacilityProduction(1, true);
    await mining.setInitialFacilityPrice(initialPrice);
  });

  it("pozwala kupić starter facility bez referrera (używa domyślnego)", async function () {
    await expect(
      mining.connect(user).purchaseInitialFacility(
        ethers.ZeroAddress,
        { value: initialPrice }
      )
    ).to.emit(mining, "InitialFacilityPurchased")
     .withArgs(user.address);
  });

  it("revertuje przy złym referrerze (własny adres)", async function () {
    await expect(
      mining.connect(user).purchaseInitialFacility(
        user.address,
        { value: initialPrice }
      )
    ).to.be.revertedWithCustomError(mining, "InvalidReferrer");
  });

  it("revertuje przy złej wartości ETH", async function () {
    await expect(
      mining.connect(user).purchaseInitialFacility(
        ethers.ZeroAddress,
        { value: ethers.parseEther("0.002") }
      )
    ).to.be.revertedWithCustomError(mining, "IncorrectValue");
  });

  it("revertuje przy podwójnym zakupie", async function () {
    await mining.connect(user).purchaseInitialFacility(
      ethers.ZeroAddress,
      { value: initialPrice }
    );
    await expect(
      mining.connect(user).purchaseInitialFacility(
        ethers.ZeroAddress,
        { value: initialPrice }
      )
    ).to.be.revertedWithCustomError(mining, "AlreadyPurchasedInitialFactory");
  });

  it("pozwala kupić starter facility z referrerem", async function () {
    await expect(
      mining.connect(user).purchaseInitialFacility(
        referrer.address,
        { value: initialPrice }
      )
    ).to.emit(mining, "InitialFacilityPurchased")
     .withArgs(user.address);
  });
});

// Jak uruchomić testy:
// 1. Upewnij się, że masz zainstalowany hardhat i chai: npm install --save-dev hardhat chai
// 2. Umieść ten plik w katalogu test/
// 3. Uruchom: npx hardhat test test/purchaseInitialFacility.test.js 