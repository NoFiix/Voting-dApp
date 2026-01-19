// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "../contracts/Voting.sol";
import "hardhat/console.sol";

contract VotingTest {

    Voting voting ;

    function setUp() public {
        voting = new Voting();
    }


    // :::::::::: WorkflowStatus Status :::::::::: //

    // :::::::::: WorkflowStatus initialisation :::::::::: //

    function test_InitialWorkflowStatus() public view {
        uint actual = uint(voting.workflowStatus());
        uint expected = uint(Voting.WorkflowStatus.RegisteringVoters);
        //console.log (actual, expected);
        require(actual == expected, "Initial status must be RegisteringVoters");    }

    // :::::::::: On test toutes les fonctions de workflowStatus les uns après les autres 

    function test_WorkflowStatus_ProposalsRegistrationStarted() public {
        voting.startProposalsRegistering();

        uint actual = uint(voting.workflowStatus());
        uint expected = uint(Voting.WorkflowStatus.ProposalsRegistrationStarted);
        //console.log (actual, expected);
        require(actual == expected, "Current status must be RegistrationStarted");    }

    function test_WorkflowStatus_ProposalsRegistrationEnded() public {
        voting.startProposalsRegistering();
        voting.endProposalsRegistering();

        uint actual = uint(voting.workflowStatus());
        uint expected = uint(Voting.WorkflowStatus.ProposalsRegistrationEnded);
        //console.log (actual, expected);
        require(actual == expected, "Current status must be RegistrationEnded");    }

    function test_WorkflowStatus_VotingSessionStarted() public {
        voting.startProposalsRegistering();
        voting.endProposalsRegistering();
        voting.startVotingSession();

        uint actual = uint(voting.workflowStatus());
        uint expected = uint(Voting.WorkflowStatus.VotingSessionStarted);
        //console.log (actual, expected);
        require(actual == expected, "Current status must be VotingStarted");    }

    function test_WorkflowStatus_VotingSessionEnded() public {
        voting.startProposalsRegistering();
        voting.endProposalsRegistering();
        voting.startVotingSession();
        voting.endVotingSession();

        uint actual = uint(voting.workflowStatus());
        uint expected = uint(Voting.WorkflowStatus.VotingSessionEnded);
        //console.log (actual, expected);
        require(actual == expected, "Current status must be VotingEnded");    }
    
    function test_WorkflowStatus_VotesTallied() public {
        voting.startProposalsRegistering();
        voting.endProposalsRegistering();
        voting.startVotingSession();
        voting.endVotingSession();
        voting.tallyVotes();

        uint actual = uint(voting.workflowStatus());
        uint expected = uint(Voting.WorkflowStatus.VotesTallied);
        //console.log (actual, expected);
        require(actual == expected, "Current status must be VotesTallied");    }
    
    
    // :::::::::: test_proposalsArray() :::::::::: //

    function test_ProposalGenesisAdded() public {
        voting.addVoter(address(this)); // Add a voter so test is allowed to call getters later
        voting.startProposalsRegistering(); // Start proposals registration phase
        require(keccak256(abi.encode(voting.getOneProposal(0).description)) == keccak256(abi.encode("GENESIS")), 
                "GENESIS proposal must be created automatically"); // Now "GENESIS" proposal should exist
        require(voting.getOneProposal(0).voteCount == 0, "GENESIS proposaldmust exist at index 0"); // and the number of votes should be 0
    }


    // :::::::::: addVoter :::::::::: //

    // Lorsque l'Owner utilise addVoter, le workflowStatus doit être à RegisteringVoters, dans tous les autres état ça doit revert
    function test_addVoter_WorkflowStatus() public {
    // Cas 1 : état initial => devrait réussir
    (bool success1,) = address(voting).call(abi.encodeWithSignature("addVoter(address)", address(1)));
    require(success1, "addVoter should succeed in RegisteringVoters state");
    // Cas 2 : proposer registration started => revert attendu
    voting.startProposalsRegistering();
    (bool success2,) = address(voting).call(abi.encodeWithSignature("addVoter(address)", address(2)));
    require(!success2, "addVoter should revert in ProposalsRegistrationStarted");
    // Cas 3 : proposer registration ended => revert attendu
    voting.endProposalsRegistering();
    (bool success3,) = address(voting).call(abi.encodeWithSignature("addVoter(address)", address(3)));
    require(!success3, "addVoter should revert in ProposalsRegistrationEnded");
    // Cas 4 : voting session started => revert attendu
    voting.startVotingSession();
    (bool success4,) = address(voting).call(abi.encodeWithSignature("addVoter(address)", address(4)));
    require(!success4, "addVoter should revert in VotingSessionStarted");
    // Cas 5 : voting session ended => revert attendu
    voting.endVotingSession();
    (bool success5,) = address(voting).call(abi.encodeWithSignature("addVoter(address)", address(5)));
    require(!success5, "addVoter should revert in VotingSessionEnded");
    // Cas 6 : votes tallied => revert attendu
    voting.tallyVotes();
    (bool success6,) = address(voting).call(abi.encodeWithSignature("addVoter(address)", address(6)));
    require(!success6, "addVoter should revert in VotesTallied state");
}

    // L'Owner ne peut pas ajouter deux fois la même address en tant que voter
    function test_addVoterCantAddTwoSameAddresses () public {
        voting.addVoter(address(1));
        (bool success, ) = address(voting).call(abi.encodeWithSignature("addVoter(address)", address(1)));
        require(!success, "addVoter shouldn't add two times a same address");
    }

}