const Voting = artifacts.require('Voting');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('Voting', accounts => {
    let votingInstance;
    const owner = accounts[0];
    const voter = accounts[1];
  
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: owner });
      await votingInstance.addVoter(voter, { from: owner }); 
    });
  
    
    it('should update the proposalsArray correctly', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        const proposal = await votingInstance.getOneProposal(0, { from : voter });
        
        expect(proposal.description).equal("GENESIS");
    });

    it('should startProposalsRegistering correctly', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        const actualStatus = await votingInstance.workflowStatus();  
        const ProposalsRegistrationStarted = new BN(1);
        
        expect(actualStatus).to.be.bignumber.equal(ProposalsRegistrationStarted);
    });


    it('should emit WorkflowStatusChange event correctly', async () => {
        const initialStatus = await votingInstance.workflowStatus();
        const evt = await votingInstance.startProposalsRegistering({ from: owner });
        const updatedStatus = await votingInstance.workflowStatus();

        expectEvent(evt, 'WorkflowStatusChange', { previousStatus: initialStatus, newStatus: updatedStatus });
    });


    it('should revert if not called by the contract owner', async () => {
        expectRevert(votingInstance.startProposalsRegistering({ from: voter }),'Ownable: caller is not the owner');
    });


    it('should revert if WorkflowStatus is different from RegisteringVoters', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        expectRevert(votingInstance.startProposalsRegistering({ from: owner }), 'Registering proposals cant be started now');

        await votingInstance.endProposalsRegistering({ from: owner });
        expectRevert(votingInstance.startProposalsRegistering({ from: owner }), 'Registering proposals cant be started now');
    }); 

});