// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

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

contract ElectoralCommission {
    address public owner;
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
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    // electionId => candidateId[]
    mapping(uint256 => uint256[]) public candidateIds;

    // events
    event ElectionCreatedEvent(uint256 electionId);
    event CandidateAddedEvent(uint256 electionId, Candidate candidate);

    constructor() {
        owner = msg.sender;
    }

    function createElection(
        string memory _name,
        string memory _postName,
        uint _startDate,
        uint _endDate
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
    }

    function addCandidate(uint256 _electionId, string memory _name) public {
        candidateCounter++;

        mapping(uint256 => Candidate) storage candidateMap = candidates[
            _electionId
        ];
        Candidate memory newCandidate = Candidate({
            id: candidateCounter,
            name: _name,
            voteCount: 0
        });
        candidateMap[candidateCounter] = newCandidate;
        candidateIds[_electionId].push(candidateCounter);
        emit CandidateAddedEvent(_electionId, newCandidate);
    }

    function getElections() public view returns (Election[] memory) {
        Election[] memory _elections = new Election[](electionCounter);
        for (uint i = 0; i < electionIds.length; i++) {
            _elections[i] = elections[electionIds[i]];
        }
        return _elections;
    }
}
