import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Names", function () {  
  describe("Functionality", function () {
    it("Should correctly handle names", async function () {
      const [owner, other] = await ethers.getSigners();

      const Names = await ethers.getContractFactory("Names");
      const names = await Names.deploy();

      // test basic name claiming
      expect(await names.claim("FirstTest")).to.emit(names, "NameClaimed");

      expect(await names.resolveAddress(owner.address)).to.equal("FirstTest/0");
      
      // test name overwriting
      expect(await names.claim("ThirdTest")).to.emit(names, "NameClaimed");
      
      expect(await names.resolveAddress(owner.address)).to.equal("ThirdTest/0");

      // test name overwriting the second time
      expect(await names.claim("FirstTest")).to.emit(names, "NameClaimed");

      expect(await names.resolveAddress(owner.address)).to.equal("FirstTest/1");

      // test name resolving - every once claimed name should remember it's owner
      expect(await names.resolveName("FirstTest/0")).to.equal(owner.address);
      expect(await names.resolveName("ThirdTest/0")).to.equal(owner.address);
      expect(await names.resolveName("FirstTest/1")).to.equal(owner.address);

      // test resolve unclaimed
      expect(await names.resolveName("SecondTest/0")).to.equal(ethers.constants.AddressZero);

      // test other signer on already claimed name
      expect(await names.connect(other).claim("FirstTest")).to.emit(names, "NameClaimed").withArgs(other.address, "FirstTest/2");
    });

    it("Should correctly handle meta transactions", async function () {
      const [owner, other] = await ethers.getSigners();

      const Names = await ethers.getContractFactory("Names");
      const names = await Names.deploy();

      const sig = owner.signMessage(
        ethers.utils.arrayify(
          ethers.utils.solidityKeccak256(
            ["string", "address", "uint"],
            ["MetaTest", await owner.getAddress(), 0]
          )
        )
      );
      
      // test meta transaction mechanism
      await expect(names.metaClaim("MetaTestdd", await owner.getAddress(), 0, sig)).to.be.revertedWith("Invalid signature...");
      await expect(names.metaClaim("MetaTest", await owner.getAddress(), 5, sig)).to.be.revertedWith("Invalid signature...");
      await expect(names.metaClaim("MetaTest", await other.getAddress(), 0, sig)).to.be.revertedWith("Invalid signature...");

      expect(await names.connect(other).metaClaim("MetaTest", await owner.getAddress(), 0, sig)).to.emit(names, "NameClaimed");

      await expect(names.metaClaim("MetaTest", await owner.getAddress(), 0, sig)).to.be.reverted;

      expect(await names.resolveAddress(owner.address)).to.equal("MetaTest/0");
    });
  });
});