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
    });


    it('should endProposalsRegistering correctly', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        await votingInstance.endProposalsRegistering({ from: owner });
        const actualStatus = await votingInstance.workflowStatus();  
        const ProposalsRegistrationEnded = new BN(2);
        
        expect(actualStatus).to.be.bignumber.equal(ProposalsRegistrationEnded);
    });


    it('should emit WorkflowStatusChange event correctly', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        const initialStatus = await votingInstance.workflowStatus();

        const evt = await votingInstance.endProposalsRegistering({ from: owner });
        const updatedStatus = await votingInstance.workflowStatus();

        expectEvent(evt, 'WorkflowStatusChange', { previousStatus: initialStatus, newStatus: updatedStatus });
    });


    it('should revert if not called by the contract owner', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });

        expectRevert(votingInstance.endProposalsRegistering({ from: voter1 }),'Ownable: caller is not the owner');
    });


    it('should revert if WorkflowStatus is before ProposalsRegistrationStarted', async () => {
        // WorkflowStatus = workflowStatus.RegisteringVoters, as default value

        expectRevert(votingInstance.endProposalsRegistering({ from: owner }), 'Registering proposals havent started yet');
    }); 


    it('should revert if WorkflowStatus is after ProposalsRegistrationStarted', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        await votingInstance.endProposalsRegistering({ from: owner });
        expectRevert(votingInstance.endProposalsRegistering({ from: owner }), 'Registering proposals havent started yet');

        await votingInstance.startVotingSession({ from: owner });
        expectRevert(votingInstance.endProposalsRegistering({ from: owner }), 'Registering proposals havent started yet');

        await votingInstance.endVotingSession({ from: owner });
        expectRevert(votingInstance.endProposalsRegistering({ from: owner }), 'Registering proposals havent started yet');

        await votingInstance.tallyVotes({ from: owner });
        expectRevert(votingInstance.endProposalsRegistering({ from: owner }), 'Registering proposals havent started yet');
    }); 

});