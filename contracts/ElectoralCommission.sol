// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

struct Candidate {
    uint256 id;
    string name;
    uint256 voteCount;
}

struct Election {
    // unique identifier of the election
    uint256 id;
    // address of the account that creates the election
    address owner;
    // e.g Chairperson Election 2023
    string name;
    // e.g Chairperson
    string postName;
    // timestamp when voting will be allowed
    uint256 startDate;
    // timestamp when voting will end
    uint256 endDate;
    // total votes cast
    uint256 votesCast;
}

struct ElectionView {
    Election election;
    Candidate[] candidates;
}

contract ElectoralCommission is Initializable {
    uint256 private _value;
    address private _admin;
    // used in creating election id
    uint public electionCounter;
    // candidate current counter
    // used in creating candidate id
    uint public candidateCounter;
    // mapping of electionId => Election
    mapping(uint256 => Election) public elections;
    // array of electionIds
    uint256[] public electionIds;
    // map between a electionId and a mapping of candidateId => Candidate struct
    mapping(uint256 => Candidate[]) public candidates;
    // electionId => candidateId[]
    mapping(uint256 => uint256[]) public candidateIds;
    mapping(uint256 => mapping(address => bool)) hasVoted;

    // events
    event ElectionCreatedEvent(uint256 electionId);
    event CandidateAddedEvent(uint256 electionId, Candidate candidate);
    event VotedEvent(uint256 electionId, Candidate candidate);

    function initialize(address admin) public initializer {
        _admin = admin;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function createElection(
        string memory _name,
        string memory _postName,
        uint _startDate,
        uint _endDate,
        Candidate[] memory _candidates
    ) public {
        require(
            _startDate > block.timestamp,
            "Election starting date must be in the future"
        );
        require(
            _endDate > block.timestamp,
            "Election ending date must be in the future"
        );
        require(
            _endDate > _startDate,
            "Election ending date must be later than starting date"
        );

        require(
            _candidates.length > 1,
            "Election must have at least 2 candidates"
        );

        electionCounter++;

        Election storage newElection = elections[electionCounter];
        newElection.id = electionCounter;
        newElection.name = _name;
        newElection.postName = _postName;
        newElection.startDate = _startDate;
        newElection.endDate = _endDate;
        newElection.owner = msg.sender;
        electionIds.push(electionCounter);
        emit ElectionCreatedEvent(electionCounter);

        for (uint256 i = 0; i < _candidates.length; i++) {
            addCandidate(electionCounter, _candidates[i].name);
        }
    }

    function addCandidate(uint256 _electionId, string memory _name) internal {
        Election memory election = elections[_electionId];
        require(
            block.timestamp < election.startDate,
            "Can't add candidate after election starting date"
        );
        require(
            block.timestamp < election.endDate,
            "Can't add candidate to an election after it is concluded"
        );

        candidateCounter++;
        Candidate[] storage candidateList = candidates[_electionId];
        Candidate memory newCandidate = Candidate({
            id: candidateCounter,
            name: _name,
            voteCount: 0
        });
        candidateList.push(newCandidate);
        candidateIds[_electionId].push(candidateCounter);
        emit CandidateAddedEvent(_electionId, newCandidate);
    }

    function getElections() public view returns (ElectionView[] memory) {
        ElectionView[] memory _electionViews = new ElectionView[](
            electionCounter
        );
        for (uint i = 0; i < electionIds.length; i++) {
            Election memory election = elections[electionIds[i]];
            Candidate[] memory _candidates = candidates[election.id];

            ElectionView memory electionView = ElectionView({
                election: election,
                candidates: _candidates
            });
            _electionViews[i] = electionView;
        }
        return _electionViews;
    }

    function getElectionCandidates(
        uint256 electionId
    ) public view returns (Candidate[] memory) {
        return candidates[electionId];
    }

    function vote(uint256 _electionId, uint256 _candidateId) public {
        Election memory election = elections[_electionId];
        Candidate[] storage candidateList = candidates[_electionId];
        require(
            block.timestamp > election.startDate &&
                block.timestamp < election.endDate,
            "Voting is only allowed within voting hours"
        );
        require(
            hasVoted[_electionId][msg.sender] == false,
            "Account has already voted in this election."
        );

        for (uint i = 0; i < candidateList.length; i++) {
            if (candidateList[i].id == _candidateId) {
                candidateList[i].voteCount++;
                hasVoted[_electionId][msg.sender] = true;
                emit VotedEvent(_electionId, candidateList[i]);
            }
        }
    }
}
