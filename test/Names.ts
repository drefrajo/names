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

      const sig = owner.signMessage(
        ethers.utils.arrayify(
          ethers.utils.solidityKeccak256(
            ["string"],
            ["I am worthy."]
          )
        )
      );

      // when testing deactivate the EOA-check
      
      // test basic name claiming
      expect(await names.claim("FirstTest", [])).to.emit(names, "NameClaimed");

      expect(await names.resolveAddress(owner.address)).to.equal("FirstTest/0");
      
      // test name overwriting
      await expect(names.claim("SecondTest", [])).to.be.reverted;
      expect(await names.claim("ThirdTest", [], {value: ethers.utils.parseEther("5")})).to.emit(names, "NameClaimed");
      
      expect(await names.resolveAddress(owner.address)).to.equal("ThirdTest/0");

      // test name overwriting the second time
      expect(await names.claim("FirstTest", sig, {value: ethers.utils.parseEther("5")})).to.emit(names, "NameClaimed");

      expect(await names.resolveAddress(owner.address)).to.equal("FirstTest/1");

      // test name resolving - every once claimed name should remember it's owner
      expect(await names.resolveName("FirstTest/0")).to.equal(owner.address);
      expect(await names.resolveName("ThirdTest/0")).to.equal(owner.address);
      expect(await names.resolveName("FirstTest/1")).to.equal(owner.address);

      // test resolve unclaimed
      expect(await names.resolveName("SecondTest/0")).to.equal(ethers.constants.AddressZero);

      // test other signer on already claimed name
      expect(await names.connect(other).claim("FirstTest", [])).to.emit(names, "NameClaimed").withArgs(other.address, "FirstTest/2");
    });

    it("Should allow fee change and withdrawal", async function () {
      const [owner] = await ethers.getSigners();

      const Names = await ethers.getContractFactory("Names");
      const names = await Names.deploy();
      
      // overwrite names a few times
      expect(await names.claim("FirstTest", [])).to.emit(names, "NameClaimed");
      expect(await names.claim("ThirdTest", [], {value: ethers.utils.parseEther("5")})).to.emit(names, "NameClaimed");
      expect(await names.claim("ThirdTest", [], {value: ethers.utils.parseEther("5")})).to.emit(names, "NameClaimed");

      // test claimFee change
      expect(await names.setFee(ethers.utils.parseEther("10")));
      await expect(names.claim("ThirdTest", [], {value: ethers.utils.parseEther("5")})).to.be.reverted;
      expect(await names.claim("SecondTest", [], {value: ethers.utils.parseEther("10")})).to.emit(names, "NameClaimed");
      
      expect(await names.resolveAddress(owner.address)).to.equal("SecondTest/0");

      // test withdrawFee
      const oldBalance = parseInt(ethers.utils.formatEther(await owner.getBalance()));
      expect(await names.withdrawFee());
      const newBalance = parseInt(ethers.utils.formatEther(await owner.getBalance()));

      expect(newBalance).to.equal(oldBalance + 20);
    });
  });
});