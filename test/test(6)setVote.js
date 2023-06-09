const Voting = artifacts.require('Voting');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    let votingInstance;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];
    const nonRegisteredVoter = accounts[8];
    const proposalDescription1 = "Proposal 1";
    const proposalDescription2 = "Proposal 2";
    const selectedProposalId1 = new BN(1);
    const selectedProposalId2 = new BN(2);
    const invalidProposalId = new BN(3);
    
    
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: owner });
      // Add voter 1, 2 and 3
      await votingInstance.addVoter(voter1, { from: owner }); 
      await votingInstance.addVoter(voter2, { from: owner }); 
      await votingInstance.addVoter(voter3, { from: owner }); 

      await votingInstance.startProposalsRegistering({ from: owner }); 

      // Add proposal 1 and 2
      await votingInstance.addProposal(proposalDescription1, { from: voter1 }); 
      await votingInstance.addProposal(proposalDescription2, { from: voter2 });

      await votingInstance.endProposalsRegistering({ from: owner });
    });

  
    it("should update the vote count for the selected proposal and the voter's vote status", async () => {

        let registeredVoter1 = await votingInstance.getVoter(voter1, { from: voter1 });
        let registeredVoter2 = await votingInstance.getVoter(voter2, { from: voter2 });
        let registeredVoter3 = await votingInstance.getVoter(voter3, { from: voter3 });


        // Get the initial vote count for the selected proposals
        const initialVoteCountProposal1 = await votingInstance.getOneProposal(new BN(1), { from: voter1 });
        expect(initialVoteCountProposal1.voteCount).to.be.bignumber.equal(new BN(0));
        
        const initialVoteCountProposal2 = await votingInstance.getOneProposal(new BN(2), { from: voter2 });
        expect(initialVoteCountProposal2.voteCount).to.be.bignumber.equal(new BN(0));
    
        // Get the initial vote status for the different voters
        const initialVoteStatusVoter1 = registeredVoter1;
        expect(initialVoteStatusVoter1.isRegistered).to.equal(true);
        expect(initialVoteStatusVoter1.hasVoted).to.equal(false);
        expect(initialVoteStatusVoter1.votedProposalId).to.be.bignumber.equal(new BN(0));
        
        const initialVoteStatusVoter2 = registeredVoter2;
        expect(initialVoteStatusVoter2.isRegistered).to.equal(true);
        expect(initialVoteStatusVoter2.hasVoted).to.equal(false);
        expect(initialVoteStatusVoter2.votedProposalId).to.be.bignumber.equal(new BN(0));
        
        const initialVoteStatusVoter3 = registeredVoter3;
        expect(initialVoteStatusVoter3.isRegistered).to.equal(true);
        expect(initialVoteStatusVoter3.hasVoted).to.equal(false);
        expect(initialVoteStatusVoter3.votedProposalId).to.be.bignumber.equal(new BN(0));
    
        // Owner start the voting phase
        await votingInstance.startVotingSession({ from: owner });
    
        // Voters vote for their selected proposal
        await votingInstance.setVote(selectedProposalId1, { from: voter1 });
        await votingInstance.setVote(selectedProposalId2, { from: voter2 });
        await votingInstance.setVote(selectedProposalId1, { from: voter3 });

        // Get and check the updated vote count for the selected proposals
        const updatedVoteCountProposal1 = await votingInstance.getOneProposal(selectedProposalId1, { from: voter1 });
        expect(updatedVoteCountProposal1.voteCount).to.be.bignumber.equal(new BN(2)); // 2 votes registered for proposal 1 (voter 1 & 3)

        const updatedVoteCountProposal2 = await votingInstance.getOneProposal(selectedProposalId2, { from: voter2 });
        expect(updatedVoteCountProposal2.voteCount).to.be.bignumber.equal(new BN(1)); // 1 vote registered for proposal 2 

        // Get and check the updated vote status for the different registered voters
        const updatedVoteStatusVoter1 = await votingInstance.getVoter(voter1, { from: voter1 });
        expect(updatedVoteStatusVoter1.isRegistered).to.equal(true);
        expect(updatedVoteStatusVoter1.hasVoted).to.equal(true);
        expect(updatedVoteStatusVoter1.votedProposalId).to.be.bignumber.equal(selectedProposalId1);

        const updatedVoteStatusVoter2 = await votingInstance.getVoter(voter2, { from: voter2 });
        expect(updatedVoteStatusVoter2.isRegistered).to.equal(true);
        expect(updatedVoteStatusVoter2.hasVoted).to.equal(true);
        expect(updatedVoteStatusVoter2.votedProposalId).to.be.bignumber.equal(selectedProposalId2);

        const updatedVoteStatusVoter3 = await votingInstance.getVoter(voter3, { from: voter3 });
        expect(updatedVoteStatusVoter3.isRegistered).to.equal(true);
        expect(updatedVoteStatusVoter3.hasVoted).to.equal(true);
        expect(updatedVoteStatusVoter3.votedProposalId).to.be.bignumber.equal(selectedProposalId1);
    });


    it('should emit Voted event', async () => {
        await votingInstance.startVotingSession({ from: owner });
        const evt = await votingInstance.setVote(selectedProposalId1, { from: voter1 });
        expectEvent(evt, 'Voted', {voter: voter1, proposalId: selectedProposalId1,});
    });


    it('should revert when voting for an invalid proposal ID', async () => {
        await votingInstance.startVotingSession({ from: owner });

        expectRevert(votingInstance.setVote(invalidProposalId, { from: voter1 }), 'Proposal not found');
    }); 


    it('should revert when voting from a non-registered voter account', async () => {
        await votingInstance.startVotingSession({ from: owner });

        expectRevert(votingInstance.setVote(selectedProposalId1, { from: nonRegisteredVoter }), 'You are not a resgistered voter');
    });


    it('should revert when voting before the voting period', async () => {
        // WorkflowStatus = workflowStatus.endProposalsRegistering, check beforeEach

        expectRevert(votingInstance.setVote(selectedProposalId1, { from: voter1 }), 'Voting session havent started yet');
    });


    it('should revert when voting after the voting period', async () => {
        await votingInstance.startVotingSession({ from: owner });
        await votingInstance.endVotingSession({ from: owner });

        expectRevert(votingInstance.setVote(selectedProposalId1, { from: voter1 }), 'Voting session havent started yet');
    });


    it('should revert when a voter tries to vote multiple times', async () => {
        await votingInstance.startVotingSession({ from: owner });
        await votingInstance.setVote(selectedProposalId1, { from: voter1 });
      
        await expectRevert(votingInstance.setVote(selectedProposalId2, { from: voter1 }), 'You have already voted');
    });


});

