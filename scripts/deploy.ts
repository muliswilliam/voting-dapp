import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.utils.parseEther("0.001");

  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.deployed();

  console.log(
    `Lock with ${ethers.utils.formatEther(lockedAmount)}ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  );
}

async function deployElectoralCommissionContract() {
  const ElectoralCommission = await ethers.getContractFactory("ElectoralCommission");
  const electoralCommission = await ElectoralCommission.deploy();

  await electoralCommission.deployed();

  console.log(`Electoral commission deployed to ${electoralCommission.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error('Lock deployment error: ', error);
  process.exitCode = 1;
});

deployElectoralCommissionContract().catch((error) => {
  console.error('Electoral Commission deployment Error:', error);
  process.exitCode = 1;
});

