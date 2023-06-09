const Voting = artifacts.require('Voting');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('Voting', accounts => {
    let votingInstance;
    const owner = accounts[0];
    const voter = accounts[1];
  
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: owner });
    });
  

    it('should revert when adding an already registered voter', async () => {
        await votingInstance.addVoter(voter, { from: owner });
        expectRevert(votingInstance.addVoter(voter, { from: owner }),'Already registered');
    });


    it('should revert if not called by the contract owner', async () => {
        expectRevert(votingInstance.addVoter(voter, { from: voter }),'Ownable: caller is not the owner');
    });


    it('should revert when adding a voter in a different workflow status', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        expectRevert(votingInstance.addVoter(voter, { from: owner }),'Voters registration is not open yet');
    });


    it('should register a voter with correct info', async () => {
        await votingInstance.addVoter(voter, { from: owner });

        let registeredVoter = await votingInstance.getVoter(voter, { from: voter });
        
        expect(registeredVoter.isRegistered).to.equal(true);
        expect(registeredVoter.hasVoted).to.equal(false);
        expect(registeredVoter.votedProposalId).to.be.bignumber.equal(new BN(0));
    });
   
  
    it('should emit VoterRegistered event', async () => {
        let evt = await votingInstance.addVoter(voter, { from: owner });
        expectEvent(evt, 'VoterRegistered', {voterAddress: voter,});
    });
  

})
