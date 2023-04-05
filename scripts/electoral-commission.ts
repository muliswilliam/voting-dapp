const { ethers } = require("hardhat")

async function main() {
  const contractAddress = '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE';
  const ElectoralCommission = await ethers.getContractFactory('ElectoralCommission')
  const electoralCommission = await ElectoralCommission.attach(contractAddress)
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const endTime = Date.now() + ONE_YEAR_IN_SECS;
  const tx = await electoralCommission.createElection("Chairperson Election 2023", "Chairperson", Date.now(), endTime)
  const receipt = await tx.wait()
  
  electoralCommission.on('ElectionCreated', (electionId) => {
    console.log({ electionId: electionId })
  })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});