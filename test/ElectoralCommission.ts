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
    describe('Validations', () => {
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
    describe('Validations', function () {
      it('should fail if called after election start time', async function () {
        const latest = await time.latest()
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        const startDate = latest + ONE_DAY_IN_SECS
        const endDate = latest + TWO_DAYS_IN_SECS
        console.log({ startDate, endDate })
        electoralCommission.createElection(
          'Name',
          'Post',
          startDate,
          endDate
        )

        // We can increase the time in Hardhat Network
        await time.increaseTo(latest + ONE_DAY_IN_SECS)
        await expect(
          electoralCommission.addCandidate(1, 'Test Candidate')
        ).to.be.revertedWith("Can't add candidate after election starting date")
      })
    })

    it('should increment candidateCounter', async function () {
      const { electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      await createElectionFromFixture(electoralCommission)
      const electionId = await electoralCommission.electionIds(0)
      electoralCommission.addCandidate(electionId, 'Candidate 1')
      expect((await electoralCommission.candidateCounter()).gt(0)).to.be.true
    })

    it('should add candidate to right election', async function () {
      const { electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      await createElectionFromFixture(electoralCommission)
      const electionId = await electoralCommission.electionIds(0)
      const candidate1 = 'Candidate 1'
      const candidate2 = 'Candidate 2'
      electoralCommission.addCandidate(electionId, candidate1)
      electoralCommission.addCandidate(electionId, candidate2)
      const candidates = await electoralCommission.getElectionCandidates(
        electionId
      )
      expect(candidates[0].name).to.equal(candidate1)
      expect(candidates[1].name).to.equal(candidate2)
    })

    it('should add candidate with 0 votes', async function () {
      const { electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      await createElectionFromFixture(electoralCommission)
      const electionId = await electoralCommission.electionIds(0)
      const candidate1 = 'Candidate 1'
      electoralCommission.addCandidate(electionId, candidate1)
      const candidates = await electoralCommission.getElectionCandidates(
        electionId
      )
      expect(candidates[0].voteCount.eq(0)).to.be.true
    })

    it('should emit CandidateAddedEvent', async function () {
      const { electoralCommission } = await loadFixture(
        deployElectoralCommissionFixture
      )
      await createElectionFromFixture(electoralCommission)
      const electionId = await electoralCommission.electionIds(0)
      await expect(
        electoralCommission.addCandidate(electionId, 'Candidate 1')
      ).to.emit(electoralCommission, 'CandidateAddedEvent')
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

  describe('vote', function () {
    describe('Validations', async function () {
      it('should fail if election has not started', async function () {
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        await createElectionFromFixture(electoralCommission)
        await electoralCommission.addCandidate(1, 'Candidate 1')
        await expect(electoralCommission.vote(1, 1)).to.be.rejectedWith(
          'Voting is only allowed within voting hours'
        )
      })

      it('should fail if account has already voted', async function () {
        const { electoralCommission } = await loadFixture(
          deployElectoralCommissionFixture
        )
        await createElectionFromFixture(electoralCommission)
        await electoralCommission.addCandidate(1, 'Candidate 1')
        await time.increaseTo(await time.latest() + (ONE_DAY_IN_SECS + TWO_DAYS_IN_SECS) / 2)
        // vote for a candidate
        await electoralCommission.vote(1, 1)
        // attempt to vote again
        await expect(electoralCommission.vote(1, 1)).to.be.rejectedWith(
          'Account has already voted in this election.'
        )
      })
    })

    it('should increase a candidate voteCount', async function () {
      const { electoralCommission, otherAccount } = await loadFixture(
        deployElectoralCommissionFixture
      )
      await createElectionFromFixture(electoralCommission)
      const electionId = 1
      await electoralCommission.addCandidate(electionId, 'Candidate 1')
      await electoralCommission.addCandidate(electionId, 'Candidate 2')
      await time.increaseTo(await time.latest() + (ONE_DAY_IN_SECS + TWO_DAYS_IN_SECS) / 2)
      // vote for candidate 2 with first account
      await electoralCommission.vote(electionId, 2)
      // vote for candidate 2 with other account
      await electoralCommission.connect(otherAccount).vote(electionId, 2)
      // get candidate 1 i.e at index 0
      const candidate1 = await electoralCommission.candidates(electionId, 0)
      // get candidate 2 i.e at index 1
      const candidate2 = await electoralCommission.candidates(electionId, 1)
      // candidate 1 should have 0 votes
      expect(candidate1.voteCount.eq(0)).to.be.true
      // candidate 2 should have to 2 votes
      expect(candidate2.voteCount.eq(2)).to.be.true
    })
  })
})
