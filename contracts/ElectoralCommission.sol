// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

struct Election {
    // unique identifier of the election
    uint id;
    // address of the account that creates the election
    address owner;
    // e.g Chairperson Election 2023
    string name;
    // e.g Chairperson
    string postName;
    // timestamp when voting will be allowed
    uint startDate;
    // timestamp when voting will end
    uint endDate;
    // total votes cast
    uint votesCast;
    // map between a candidate's address and an election id
    address[] candidates;
    // map between a candidate and total votes received
    mapping(address => uint) votes;
    // map between a voter's address and candidate they voted for
    // voter => candidate
    mapping(address => address) voterCandidate;
}

contract ElectoralCommission {
    address public owner;
    // used in creating election id
    uint public electionCounter;
    // electionId => Election
    mapping(uint => Election) elections;
    // array of electionIds since we can't iterate on elections mapping keys
    uint[] electionIds;

    // events
    event ElectionCreated(uint electionId);

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
        require(_endDate > block.timestamp, "Election ending date must be in the future");
        require(
            _endDate > _startDate,
            "Election ending date must be later than starting date"
        );

        uint electionId = electionCounter++;

        Election storage newElection = elections[electionId];
        newElection.id = electionId;
        newElection.name = _name;
        newElection.postName = _postName;
        newElection.startDate = _startDate;
        newElection.owner = msg.sender;

        emit ElectionCreated(electionId);
    }
}
