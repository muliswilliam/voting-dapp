import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { ElectoralCommission } from '../typechain-types'

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

  async function createElectionFromFixture(
    electoralCommission: ElectoralCommission
  ) {
    const latest = await time.latest()
    const tx = await electoralCommission.createElection(
      'Name',
      'Post',
      latest + ONE_DAY_IN_SECS,
      latest + TWO_DAYS_IN_SECS
    )

    await tx.wait()
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
        ).to.emit(electoralCommission, 'ElectionCreatedEvent')
      })

      it('should add electionId to electionIds', async function () {
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        await createElectionFromFixture(electoralCommission)
        expect((await electoralCommission.electionIds(0)).eq(1)).to.be.true
      })

      it('should create election with right details', async function () {
        const latest = await time.latest()
        const { electoralCommission, owner } = await loadFixture(
          deployElectoralCommissionFixture
        )
        const name = 'Test Name'
        const post = 'Test Post'
        const startDate = latest + ONE_DAY_IN_SECS
        const endDate = latest + TWO_DAYS_IN_SECS
        const tx = await electoralCommission.createElection(
          name,
          post,
          startDate,
          endDate
        )
        await tx.wait()
        const election = await electoralCommission.elections(1)
        expect(election.name).to.equal(name)
        expect(election.postName).to.equal(post)
        expect(election.owner).to.equal(owner.address)
        expect(election.startDate.eq(startDate)).to.be.true
        expect(election.endDate.eq(endDate)).to.be.true
      })
    })
  })

  describe('AddCandidate', function () {
    it('should increment candidateCounter', async function () {
      const { electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      await createElectionFromFixture(electoralCommission)
      const electionId = await electoralCommission.electionIds(0)
      electoralCommission.addCandidate(electionId, 'Candidate 1')
      expect((await electoralCommission.candidateCounter()).gt(0)).to.be.true
    })
  })

  describe('getElections', function () {
    it('should return all elections', async function () {
      const { electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      await createElectionFromFixture(electoralCommission)
      await createElectionFromFixture(electoralCommission)
      const elections = await electoralCommission.getElections()
      expect(elections.length).to.equal(2)
    })
  })
})
