import { expect } from "chai";
import { network } from "hardhat";
//import { ethers } from "hardhat";
const { ethers } = await network.connect();

describe("Voting", function () {

  let voting;
  let owner, voter1, voter2, voter3, voter4;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
    await voting.waitForDeployment();
  });

  async function setupProposalsRegistration() {
    // On ajoute un voter et on ouvre la période d'enregistrement des propositions 
    await voting.connect(owner).addVoter(voter1.address);
    await voting.connect(owner).startProposalsRegistering();
  }

  async function setupEightProposalsAdded() {
    // On ajoute 8 propositions différentes
    await setupProposalsRegistration();
    for (let i = 1; i <= 8; i++) {
      await voting.connect(voter1).addProposal(`Proposition ${i}`);
    }
  }

  async function VotingSessionStarted_afterEightProposalsAdded() {
    // Après avoir ajouté 8 propositions, on ouvre la session de vote
    await setupEightProposalsAdded();
    await voting.connect(owner).endProposalsRegistering();
    await voting.connect(owner).startVotingSession();
  }

  async function setupFourVoters_EightProposals_tallyVotesStatus() {
    await voting.connect(owner).addVoter(voter4.address);
    await voting.connect(owner).addVoter(voter3.address);
    await voting.connect(owner).addVoter(voter2.address);
    await VotingSessionStarted_afterEightProposalsAdded();
    // Votes
    await voting.connect(voter1).setVote(3);
    await voting.connect(voter2).setVote(3);
    await voting.connect(voter3).setVote(7);
    await voting.connect(voter4).setVote(3);
    // On passe à la phase de décompte
    await voting.connect(owner).endVotingSession();
  }

  describe ("GETTERS", function () {
// ::::::::::::: GETTERS ::::::::::::: //

    it("1. Should deploey with winningProposalID = 0", async function () {
      expect (await voting.winningProposalID()).to.equal(0n);
    });

    it("2. getVoter function should return a voters information for registered voter", async function () {
      // 1. Enregistrer le votant
      await voting.connect(owner).addVoter(voter1.address);
      // 2. Récupérer les infos (voter1 doit appeler car onlyVoters)
      const voterInfo = await voting.connect(voter1).getVoter(voter1.address);
      // 3. Vérifier
      expect(voterInfo.isRegistered).to.be.true;
      expect(voterInfo.hasVoted).to.be.false;
      expect(voterInfo.votedProposalId).to.equal(0);
    });

    it("3. getOneProposal returns proposals informations for an id", async function () {
      await setupProposalsRegistration();
      await voting.connect(voter1).addProposal("Hello");

      const proposalInfo = await voting.connect(voter1).getOneProposal(1);
      expect(proposalInfo.description).to.equal("Hello");
      expect(proposalInfo.voteCount).to.equal(0);
    });

    it("4. Should revert if non-voter use the getVoter function", async function () {
      await voting.connect(owner).addVoter(voter1.address);
      await expect (voting.connect(owner).getVoter(voter1.address)
      ).to.be.revertedWith("You're not a voter");
    })

    it("5. Should revert if non-voter use the getOneProposal function", async function () {
      await setupProposalsRegistration();
      
      // 3. voter1 ajoute une proposition
      await voting.connect(voter1).addProposal("Proposition1");
      
      // 4. Vérifier que voter1 PEUT récupérer la proposition
      const proposal = await voting.connect(voter1).getOneProposal(1); // ID 1 car 0 = GENESIS
      expect(proposal.description).to.equal("Proposition1");
      expect(proposal.voteCount).to.equal(0);
      
      // 5. Vérifier qu'un autre user (non-voter) NE PEUT PAS récupérer la proposition
      await expect(voting.connect(owner).getOneProposal(1)
      ).to.be.revertedWith("You're not a voter");
    });
  });

  describe ("REGISTRATION", function () {
// ::::::::::::: REGISTRATION ::::::::::::: // 

    it("6. Should revert if non-owner uses addVoter function", async function () {
      await expect(voting.connect(voter1).addVoter(voter1.address)
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(voter1.address);
    });

    it("7. Should emit the VoterRegistered event when calling the addVoter function", async function () {
      await expect(voting.addVoter(voter1)).to.emit(voting, "VoterRegistered").withArgs(voter1);
    });

    it("8. voters length should be 6 after 6 uses of addVoter function", async function () {
      const [v1, v2, v3, v4, v5, v6] = await ethers.getSigners();
      const votersToAdd = [v1, v2, v3, v4, v5, v6];
      // On ajoute 6 Voters différents
      for (let i = 0; i < votersToAdd.length; i++) { 
        await voting.connect(owner).addVoter(votersToAdd[i].address);
      }
      // On récupère les données du dernier voter ajouté
      const v6_keeped = await voting.connect(v2).getVoter(v6.address); 
      // On verifie qu'elles existes
      expect(v6_keeped.isRegistered).to.be.true; 
      expect(v6_keeped.hasVoted).to.be.false;
      expect(v6_keeped.votedProposalId).to.equal(0n); 
    });
  });
  
  describe ("PROPOSAL", function () {

// ::::::::::::: PROPOSAL ::::::::::::: // 

    it("9. Should revert if non-voter use addProposal function", async function () {
      await setupProposalsRegistration();
      // Vérifier que voter1 PEUT ajouter une proposition
      await voting.connect(voter1).addProposal("Hello");
      const proposal = await voting.connect(voter1).getOneProposal(1); // ID 1 car 0 = GENESIS
      expect(proposal.description).to.equal("Hello");
      expect(proposal.voteCount).to.equal(0n);
      // Vérifier que owner (non-voter) NE PEUT PAS ajouter
      await expect(voting.connect(owner).addProposal("Hello2")
      ).to.be.revertedWith("You're not a voter");
    });

    it("10. Should revert if addProposal is used in other workflowStatus than ProposalsRegistrationsStarted", async function () {
      // Vérifier qu'à l'état initial ça revert
      await voting.connect(owner).addVoter(voter1.address);
      await expect(voting.connect(voter1).addProposal("Hello")
      ).to.be.revertedWith("Proposals are not allowed yet");

      // À l'état ProposalsRegistrationsStarted ça passe
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(voter1).addProposal("Hello1");
      const proposal1 = await voting.connect(voter1).getOneProposal(1);
      expect(proposal1.description).to.equal("Hello1");

      // À l'état ProposalsRegistrationEnded ça revert
      await voting.connect(owner).endProposalsRegistering();
      await expect(voting.connect(voter1).addProposal("Hello2")
      ).to.be.revertedWith("Proposals are not allowed yet");

      // À l'état VotingSessionsStarted ça revert
      await voting.connect(owner).startVotingSession();
      await expect(voting.connect(voter1).addProposal("Hello2")
      ).to.be.revertedWith("Proposals are not allowed yet");

      // À l'état VotingSessionsEnded ça revert
      await voting.connect(owner).endVotingSession();
      await expect(voting.connect(voter1).addProposal("Hello2")
      ).to.be.revertedWith("Proposals are not allowed yet");

      // À l'état VotesTallied ça revert
      await voting.connect(owner).tallyVotes();
      await expect(voting.connect(voter1).addProposal("Hello2")
      ).to.be.revertedWith("Proposals are not allowed yet");
    });

    it("11. Should revert if addProposal is used with empty description", async function () {
      await setupProposalsRegistration();
      await expect(voting.connect(voter1).addProposal("")
      ).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    });

    it("12. addProposal should emit ProposalRegistered event when used", async function () {
      await setupProposalsRegistration();
      await expect(voting.connect(voter1).addProposal("Hello")
      ).to.emit(voting, "ProposalRegistered").withArgs(1);
    });

    it("13. proposals length should be 9 after 9 uses of addProposal function", async function () {
      await setupEightProposalsAdded();
      await expect(voting.connect(voter1).addProposal("ninth proposition")
      ).to.emit(voting, "ProposalRegistered").withArgs(9);
    });
  });


  describe ("VOTE", function () {

// ::::::::::::: VOTE ::::::::::::: //

    it("14. setVote should revert if non-voter uses it", async function () {
      await VotingSessionStarted_afterEightProposalsAdded()
      await expect(voting.connect(owner).setVote(2n)).to.be.revertedWith("You're not a voter");
      await expect(voting.connect(voter3).setVote(2n)).to.be.revertedWith("You're not a voter");
    });

    it("15. setVote should revert if voter have already voted", async function () {
      await VotingSessionStarted_afterEightProposalsAdded();
      await voting.connect(voter1).setVote(2n);
      await expect(voting.connect(voter1).setVote(4n)).to.be.revertedWith("You have already voted");
    });

    it("16. setVote should revert if _id > proposalsArray.length", async function () {
      await voting.connect(owner).addVoter(voter2.address);
      await VotingSessionStarted_afterEightProposalsAdded()
      await voting.connect(voter1).setVote(8); // avec 8 ça ne doit pas revert
      await expect(voting.connect(voter2).setVote(9)).to.be.revertedWith("Proposal not found");
    });

    it("17. setVote should increment ++ proposals.voteCount for each vote", async function () {
      await voting.connect(owner).addVoter(voter4.address);
      await voting.connect(owner).addVoter(voter3.address);
      await voting.connect(owner).addVoter(voter2.address);
      await VotingSessionStarted_afterEightProposalsAdded();
      // Votes
      await voting.connect(voter1).setVote(3);
      await voting.connect(voter2).setVote(3);
      await voting.connect(voter3).setVote(7);
      await voting.connect(voter4).setVote(3);
      // Attribution
      const proposal3 = await voting.connect(voter1).getOneProposal(3);
      const proposal7 = await voting.connect(voter1).getOneProposal(7);
      // Vérifications
      expect(proposal3.voteCount).to.equal(3n);
      expect(proposal7.voteCount).to.equal(1n);
    });

    it("18. setVote should emit Voted event", async function () {
      await VotingSessionStarted_afterEightProposalsAdded();
      await expect(voting.connect(voter1).setVote(3)).to.emit(voting, "Voted").withArgs(voter1.address, 3n);
    });
  });


  describe ("STATE", function () {

// ::::::::::::: STATE ::::::::::::: //

    it("19. Should revert if non-owner uses startProposalsRegistering function", async function () {
      await expect(voting.connect(voter1).startProposalsRegistering()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(voter1.address);
    });

    it("20. startProposalsRegistering should emit WorkflowStatusChange event", async function () {
      await expect(voting.startProposalsRegistering()).to.emit(voting,"WorkflowStatusChange");
    });

    it("21. endProposalsRegistering should emit WorkflowStatusChange event", async function () {
      await voting.startProposalsRegistering();
      await expect(voting.endProposalsRegistering()).to.emit(voting,"WorkflowStatusChange");
    });

    it("22. startVotingSession should emit WorkflowStatusChange event", async function () {
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await expect(voting.startVotingSession()).to.emit(voting,"WorkflowStatusChange");
    });

    it("23. endVotingSession should emit WorkflowStatusChange event", async function () {
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await expect(voting.endVotingSession()).to.emit(voting,"WorkflowStatusChange");
    });
  });

  describe ("THE WINNER IS", function () {

// ::::::::::::: THE WINNER IS ::::::::::::: //
  
    it("24. tallyVotes should revert if used by non-owner", async function () {
      await setupFourVoters_EightProposals_tallyVotesStatus();
      
      await expect(voting.connect(voter1).tallyVotes()
      ).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
      .withArgs(voter1.address);
    });

    it("25. winningProposalID should be 3 in tallyVotes uses function", async function () {
      await setupFourVoters_EightProposals_tallyVotesStatus();
      await voting.connect(owner).tallyVotes();
      expect(await voting.winningProposalID()).to.equal(3n);
    });

    it("26. tallyVotes should emit WorkflowStatusChange event", async function () {
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.endVotingSession();
      await expect(voting.tallyVotes()).to.emit(voting,"WorkflowStatusChange");
    });
  });
});



