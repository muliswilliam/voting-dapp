import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers } from 'hardhat'

const ONE_DAY_IN_SECS = 24 * 60 * 60
const TWO_DAYS_IN_SECS = 2 * ONE_DAY_IN_SECS

describe('ElectoralCommission', function () {
  async function deployElectoralCommissionFixture() {
    const [owner, otherAccount] = await ethers.getSigners()
    const ElectoralCommission = await ethers.getContractFactory(
      'ElectoralCommission'
    )
    const electoralCommission = await ElectoralCommission.deploy()

    return { owner, electoralCommission, otherAccount }
  }

  describe('Deployment', function () {
    it('should set the right owner', async function () {
      const { owner, electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      expect(await electoralCommission.owner()).to.equal(owner.address)
    })

    it('should set the right owner', async function () {
      const { owner, electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      expect(await electoralCommission.owner()).to.equal(owner.address)
    })
  })

  describe('CreateElection', function () {
    describe('Valiations', () => {
      it('should fail if startTime is in the past', async function () {
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        const latest = await time.latest()
        await expect(
          electoralCommission.createElection(
            'Name',
            'Post',
            latest - ONE_DAY_IN_SECS,
            latest
          )
        ).to.be.revertedWith('Election starting date must be in the future')
      })

      it('should fail endTime is in the past', async function () {
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        const latest = await time.latest()
        await expect(
          electoralCommission.createElection(
            'Name',
            'Post',
            latest + ONE_DAY_IN_SECS,
            latest - TWO_DAYS_IN_SECS
          )
        ).to.be.revertedWith('Election ending date must be in the future')
      })

      it('should fail endTime is in the past', async function () {
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        const latest = await time.latest()
        await expect(
          electoralCommission.createElection(
            'Name',
            'Post',
            latest + TWO_DAYS_IN_SECS,
            latest + ONE_DAY_IN_SECS
          )
        ).to.be.revertedWith(
          'Election ending date must be later than starting date'
        )
      })
    })

    describe('Events', function () {
      it('should emit ElectionCreated event', async function () {
        const latest = await time.latest()
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        await expect(
          electoralCommission.createElection(
            'Name',
            'Post',
            latest + ONE_DAY_IN_SECS,
            latest + TWO_DAYS_IN_SECS
          )
        ).to.emit(electoralCommission, 'ElectionCreated')
      })
    })
  })
})
