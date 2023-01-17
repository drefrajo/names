import { ethers } from "hardhat";

async function main() {
  const Names = await ethers.getContractFactory("Names");
  const names = await Names.deploy();

  await names.deployed();

  console.log(`Names deployed to ${names.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
