const Voting = artifacts.require('Voting');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract('Voting', accounts => {
    let votingInstance;
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const nonRegisteredVoter = accounts[8];
    const proposalDescription1 = "Proposal 1";
    const proposalDescription2 = "Proposal 2";
    const ProposalId1 =  new BN(1); // BN(1) as BN(0) is already allocated to proposal.description = "GENESIS"
    const ProposalId2 =  new BN(2);

    
    beforeEach(async () => {
      votingInstance = await Voting.new({ from: owner });
      await votingInstance.addVoter(voter1, { from: owner });
      await votingInstance.addVoter(voter2, { from: owner });
    });


    it('should add a proposal correctly', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        await votingInstance.addProposal(proposalDescription1, { from: voter1 });

        let firstProposal = await votingInstance.getOneProposal(ProposalId1, { from: voter1 });

        expect(firstProposal.description).equal(proposalDescription1);
        expect(firstProposal.voteCount).to.be.bignumber.equal(new BN(0));     
    });

    
    it('should increase properly the proposalsArray count', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        await votingInstance.addProposal(proposalDescription1, { from: voter1 });

        let firstProposal = await votingInstance.getOneProposal(ProposalId1, { from: voter1 }); 

        expect(firstProposal.description).equal(proposalDescription1);
        expect(firstProposal.voteCount).to.be.bignumber.equal(new BN(0));

        await votingInstance.addProposal(proposalDescription2, { from: voter2 });

        let secondProposal = await votingInstance.getOneProposal(ProposalId2, { from: voter2 });

        expect(secondProposal.description).equal(proposalDescription2);
        expect(secondProposal.voteCount).to.be.bignumber.equal(new BN(0));
    });


    it('should emit ProposalAdded event', async () => {
        await votingInstance.startProposalsRegistering({ from: owner });
        const evt  = await votingInstance.addProposal(proposalDescription1, { from: voter1 });
        
        expectEvent(evt, 'ProposalRegistered', {proposalId: new BN(1)});
    });


    it('should revert when adding a proposal from a non-registered voter account', async () => {   
        await votingInstance.startProposalsRegistering({ from: owner });

        expectRevert(votingInstance.addProposal(proposalDescription1, { from: nonRegisteredVoter }),"You are not a resgistered voter");
    });
    

    it('should revert when adding a proposal before the voter registration phase', async () => {      
        // no need to specify any change state function, as an enum default value is the first value (in this case workflowStatus.RegisteringVoters)

        expectRevert(votingInstance.addProposal(proposalDescription1, { from: voter1 }),"Proposals are not allowed yet");
    });


    it('should revert when adding a proposal after the registration period', async () => {  
        await votingInstance.startProposalsRegistering({ from: owner });
        await votingInstance.endProposalsRegistering({ from: owner });
        
        expectRevert(votingInstance.addProposal(proposalDescription1, { from: voter1 }),"Proposals are not allowed yet");
    });


    it('Should revert when adding an empty proposal', async () => {    
        await votingInstance.startProposalsRegistering({ from: owner });
  
        expectRevert(votingInstance.addProposal('', { from: voter1 }), 'Empty proposal are not allowed');
    }); 


})



/* Tests  à rajouter 
- Should revert when adding a duplicate proposal (no presence of this type of require in the Smart Contract)
*/
