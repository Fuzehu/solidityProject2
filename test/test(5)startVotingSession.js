const Voting = artifacts.require('Voting');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('Voting', accounts => {
    let votingInstance;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    
    
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: owner });
      await votingInstance.addVoter(voter1, { from: owner });
      await votingInstance.addVoter(voter2, { from: owner });
      await votingInstance.startProposalsRegistering({ from: owner });
    });

    it('should startVotingSession correctly', async () => {
        await votingInstance.endProposalsRegistering({ from: owner });
        await votingInstance.startVotingSession({ from: owner });
        const actualStatus = await votingInstance.workflowStatus();  
        const VotingSessionStarted = new BN(3);
        
        expect(actualStatus).to.be.bignumber.equal(VotingSessionStarted);
    });


    it('should emit WorkflowStatusChange event correctly', async () => {
        await votingInstance.endProposalsRegistering({ from: owner });
        const initialStatus = await votingInstance.workflowStatus();

        const evt = await votingInstance.startVotingSession({ from: owner });
        const updatedStatus = await votingInstance.workflowStatus();

        expectEvent(evt, 'WorkflowStatusChange', { previousStatus: initialStatus, newStatus: updatedStatus });
    });


    it('should revert if not called by the contract owner', async () => {
        await votingInstance.endProposalsRegistering({ from: owner });

        expectRevert(votingInstance.startVotingSession({ from: voter1 }),'Ownable: caller is not the owner');
    });


    it('should revert if WorkflowStatus is before ProposalsRegistrationEnded', async () => {
        // WorkflowStatus = workflowStatus.ProposalsRegistrationStarted, check beforeEach

        expectRevert(votingInstance.startVotingSession({ from: owner }), 'Registering proposals phase is not finished');
    }); 


    it('should revert if WorkflowStatus is after ProposalsRegistrationEnded', async () => {
        await votingInstance.endProposalsRegistering({ from: owner });
        await votingInstance.startVotingSession({ from: owner });
        expectRevert(votingInstance.startVotingSession({ from: owner }), 'Registering proposals phase is not finished');

        await votingInstance.endVotingSession({ from: owner });
        expectRevert(votingInstance.startVotingSession({ from: owner }), 'Registering proposals phase is not finished');

        await votingInstance.tallyVotes({ from: owner });
        expectRevert(votingInstance.startVotingSession({ from: owner }), 'Registering proposals phase is not finished');
    }); 


});