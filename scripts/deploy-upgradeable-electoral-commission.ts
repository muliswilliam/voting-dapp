import { ethers, upgrades } from 'hardhat'

async function main() {
  const ElectoralCommission = await ethers.getContractFactory('ElectoralCommission')
  console.log('Deploying Electoral Commission')
  const electoralCommission = await upgrades.deployProxy(ElectoralCommission, ['0xfABf58aAB0f4ae32d4FBBE8669835b3915977e97'])
  await electoralCommission.deployed()
  console.log('Electoral Commsission deployed to: ', electoralCommission.address)
}

main()
  .catch(error => console.error(error))