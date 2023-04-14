const { ethers } = require("hardhat")

async function main() {
  const contractAddress = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';
  const ElectoralCommission = await ethers.getContractFactory('ElectoralCommission')
  const electoralCommission = await ElectoralCommission.attach(contractAddress)
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const endTime = Date.now() + ONE_YEAR_IN_SECS;
  const tx = await electoralCommission.createElection("Chairperson Election 2023", "Chairperson", Date.now(), endTime)
  const receipt = await tx.wait()

  const elections = await electoralCommission.getElections()
  console.log(elections)
  
  // electoralCommission.on('ElectionCreatedEvent', (electionId) => {
  //   console.log({ electionId: electionId })
  // })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});