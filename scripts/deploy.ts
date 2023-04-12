
async function main() {
  const ElectoralCommission = await ethers.getContractFactory("ElectoralCommission");
  const electoralCommission = await ElectoralCommission.deploy();

  await electoralCommission.deployed();

  console.log(`Electoral commission deployed to ${electoralCommission.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error('Electoral Commission deployment Error:', error);
  process.exitCode = 1;
});

