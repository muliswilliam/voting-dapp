import { ethers, upgrades} from 'hardhat'

async function main() {
  const ElectoralCommissionV2 = await ethers.getContractFactory('ElectoralCommission')
  const electoralCommission = await upgrades.upgradeProxy(process.env.ELECTORAL_COMMISSION_ADDRESS || '', ElectoralCommissionV2)
  console.log("Box upgraded: ", electoralCommission.address)
}

main()
  .catch(error => console.error(error))