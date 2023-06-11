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
    
    
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: owner });
      // Add voter 1, 2 and 3
      await votingInstance.addVoter(voter1, { from: owner }); 
      await votingInstance.addVoter(voter2, { from: owner }); 
      await votingInstance.addVoter(voter3, { from: owner }); 

      await votingInstance.startProposalsRegistering({ from: owner }); // start proposalResgistering

      // Add proposal 1 and 2
      await votingInstance.addProposal(proposalDescription1, { from: voter1 }); 
      await votingInstance.addProposal(proposalDescription2, { from: voter2 });

      await votingInstance.endProposalsRegistering({ from: owner });
    });

    it('should endVotingSession correctly', async () => {
        await votingInstance.startVotingSession({ from: owner });
        await votingInstance.endVotingSession({ from: owner });
        const actualStatus = await votingInstance.workflowStatus();  
        const VotingSessionEnded = new BN(4);
        
        expect(actualStatus).to.be.bignumber.equal(VotingSessionEnded);
    });


    it('should emit WorkflowStatusChange event correctly', async () => {
        await votingInstance.startVotingSession({ from: owner });
        const initialStatus = await votingInstance.workflowStatus();

        const evt = await votingInstance.endVotingSession({ from: owner });
        const updatedStatus = await votingInstance.workflowStatus();

        expectEvent(evt, 'WorkflowStatusChange', { previousStatus: initialStatus, newStatus: updatedStatus });
    });


    it('should revert if not called by the contract owner', async () => {
        await votingInstance.startVotingSession({ from: owner });

        expectRevert(votingInstance.endVotingSession({ from: voter1 }),'Ownable: caller is not the owner');
    });


    it('should revert if WorkflowStatus is before VotingSessionStarted', async () => {
        // WorkflowStatus = workflowStatus.ProposalsRegistrationEnded, check beforeEach

        expectRevert(votingInstance.endVotingSession({ from: owner }), 'Voting session havent started yet');
    }); 


    it('should revert if WorkflowStatus is after VotingSessionStarted', async () => {
        await votingInstance.startVotingSession({ from: owner });
        await votingInstance.endVotingSession({ from: owner });
        expectRevert(votingInstance.endVotingSession({ from: owner }), 'Voting session havent started yet');

        await votingInstance.tallyVotes({ from: owner });
        expectRevert(votingInstance.endVotingSession({ from: owner }), 'Voting session havent started yet');
    }); 




});