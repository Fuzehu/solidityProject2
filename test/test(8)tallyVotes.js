const Voting = artifacts.require('Voting');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    let votingInstance;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];
    const proposalDescription1 = "Proposal 1";
    const proposalDescription2 = "Proposal 2";
    const ProposalId0 = new BN(0);
    const ProposalId1 = new BN(1);
    const ProposalId2 = new BN(2);

    
    beforeEach(async () => {
        votingInstance = await Voting.new({ from: owner });

        await votingInstance.addVoter(voter1, { from: owner });
        await votingInstance.addVoter(voter2, { from: owner });
        await votingInstance.addVoter(voter3, { from: owner });

        await votingInstance.startProposalsRegistering({ from: owner });
        await votingInstance.addProposal(proposalDescription1, { from: voter1 });
        await votingInstance.addProposal(proposalDescription2, { from: voter2 });
        await votingInstance.endProposalsRegistering({ from: owner });

        await votingInstance.startVotingSession({ from: owner });
        await votingInstance.setVote(new BN(1), { from: voter1 });
        await votingInstance.setVote(new BN(2), { from: voter2 });
        await votingInstance.setVote(new BN(1), { from: voter3 });
    });


    it('should return correct winning proposal ID', async () => {
        await votingInstance.endVotingSession({ from: owner });
        const voteResults = await votingInstance.tallyVotes({ from: owner }); 

        const voteCountProposal0 = await votingInstance.getOneProposal(ProposalId0, { from: voter1 });
        const voteCountProposal1 = await votingInstance.getOneProposal(ProposalId1, { from: voter1 });
        const voteCountProposal2 = await votingInstance.getOneProposal(ProposalId2, { from: voter1 });
        expect(voteCountProposal0.voteCount).to.be.bignumber.equal(new BN(0));
        expect(voteCountProposal1.voteCount).to.be.bignumber.equal(new BN(2));
        expect(voteCountProposal2.voteCount).to.be.bignumber.equal(new BN(1));
        expect((voteCountProposal1.voteCount)>(voteCountProposal2.voteCount)>(voteCountProposal0.voteCount));

        const finalResult = await votingInstance.winningProposalID({ from: voter1 });
        expect(finalResult).to.be.bignumber.equal(ProposalId1);;
    });


    it('should emit WorkflowStatusChange event correctly', async () => {
        await votingInstance.endVotingSession({ from: owner });
        const initialStatus = await votingInstance.workflowStatus();   // a la base const statu intial = new bn(4)
        const evt = await votingInstance.tallyVotes({ from: owner });
        const updatedStatus = await votingInstance.workflowStatus();

        expectEvent(evt, 'WorkflowStatusChange', { previousStatus: initialStatus, newStatus: updatedStatus });
    });
      


    it('should revert if not called by the contract owner', async () => {
        await votingInstance.endVotingSession({ from: owner });

        expectRevert(votingInstance.tallyVotes({ from: voter1 }),'Ownable: caller is not the owner');
    });


    it("should revert if called before the VotingSessionEnded WorkflowStatus", async () => {
        // WorkflowStatus = workflowStatus.startVotingSession, check beforeEach

        expectRevert(votingInstance.tallyVotes({ from: owner }),'Current status is not voting session ended');
    });


    it("should revert if called when votes are already tallied", async () => {
        await votingInstance.endVotingSession({ from: owner });
        await votingInstance.tallyVotes({ from: owner });

        expectRevert(votingInstance.tallyVotes({ from: owner }),'Current status is not voting session ended');
    });

});



// test l'égalité - win normal
