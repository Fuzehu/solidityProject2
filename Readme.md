# General Info
***
Project 2 is about Unit Testing of the Voting contract
***


## Breaking down the used methodology
*** 
We decided to separate each function testing to a specific file.
Therefore tests regarding the function "addVoter" will be found in the file "test(1)addVoter.js".

Moreover, Data Structure such as mappings, arrays, and various struct won't be tested directly. 
Indeed, interactions with data struct will be tested in each specific functions.
*** 


### Breaking down Voting's contract Unit Testing
    8 files 
    45 differents tests, each passing

1. test(1)addVoter.js = addVoter function testing (6 tests)
    * 'should register a voter with correct info' 
        check that a voter is correctly added via the mappinng and initialized with :
            - isRegistered = true
            - hasVoted = false
            - votedProposalID = 0
    * 'should emit VoterRegistered event'
        check that the "VoterRegistered" event is correctly emited with the voter's address
    * 'should revert if not called by the contract owner'
        check the onlyOwner modifier by expecting a revert if not triggered by the owner's address
    * 'should revert when adding a voter in a different workflow status'
        check that any other workflowStatus than RegisteringVoters cause a revert
    * 'should revert when adding an already registered voter'
        check that if the owner try to register an already registered user it causes a revert
    * 'should be RegisteringVoters as default workflowStatus'
        check that the default workflowStatus is correctly initialised at index 0 which is "RegisteringVoters"

2. test(2)startProposalsRegistering.js = startProposalsRegistering function testing (5 tests)
    * 'should startProposalsRegistering correctly'
        check that the workflowStatus is correctly updated from RegisteringVoters to ProposalsRegistrationStarted
    * 'should emit WorkflowStatusChange event correctly'
        check that the changeWorkflowStatus event emit correct information with RegisteringVoters as previousStatus and ProposalsRegistrationStarted as newStatus
    * 'should update the proposalsArray correctly'
        check that while the function startProposalsRegistering is called the "GENESIS" proposal is correctly added to the proposalsArray with the corresponding informations :
            - description = "GENESIS"
            - voteCount = 0
    * 'should revert if not called by the contract owner'
        check the onlyOwner modifier by expecting a revert if not triggered by the owner's address
    * 'should revert if WorkflowStatus is different from RegisteringVoters'
        check that it is impossible to call the startProposalsRegistering function in any other WorkflowStatus different than RegisteringVoters

3. test(3)addProposal.js = addProposal function testing (7 tests)
    * 'should add a proposal correctly'
        check that a registered voter can add a proposal to the proposalsArray index 1 with the corresponding informations : 
            - description = proposalDescription1
            - voteCount = 0
    * 'should increase properly the proposalsArray count'
        same test as the previous one, but we check that while a new voter add a second proposition : 
            - it is correctly affected to the proposalsArray index 2
            - while correct informations are still affected as expected
    * 'should emit ProposalAdded event'
        check that the ProposalRegistered event is correctly emited with the corresponding ProposalId
    * 'should revert if not called by a registered voter account'
        check that adding a proposal from 
            - a non-registered voter account, causes a revert
            - the admin account, causes a revert
    * 'should revert when adding a proposal before the ProposalsRegistrationStarted session'
        check that adding a proposal before the ProposalsRegistrationStarted WorkflowStatus causes a revert
    * 'should revert when adding a proposal after the ProposalsRegistrationStarted period'
        check that adding a proposal after any other WorkflowStatus differennt than ProposalsRegistrationStarted causes a revert
    * 'should revert when adding an empty proposal'
        check that adding an empty proposal causes a revert

4. test(4)endProposalsRegistering.js = endProposalsRegistering function testing (5 tests)
    * 'should endProposalsRegistering correctly'
        check that the WorkflowStatus is correctly updated from ProposalsRegistrationStarted to ProposalsRegistrationEnded
    * 'should emit WorkflowStatusChange event correctly'
        check that the changeWorkflowStatus event emit correct information with ProposalsRegistrationStarted as previousStatus and ProposalsRegistrationEnded as newStatus
    * 'should revert if not called by the contract owner'
        check the onlyOwner modifier by expecting a revert if not triggered by the owner's address
    * 'should revert if WorkflowStatus is before ProposalsRegistrationStarted'
        check that calling endProposalsRegistering before the ProposalsRegistrationEnded WorkflowStatus causes a revert
    * 'should revert if WorkflowStatus is after ProposalsRegistrationStarted'
        check that calling endProposalsRegistering after the ProposalsRegistrationEnded WorkflowStatus causes a revert

5. test(5)startVotingSession.js = startVotingSession function testing (5 tests)
    * 'should startVotingSession correctly'
        check that the workflowStatus is correctly updated from ProposalsRegistrationEnded to VotingSessionStarted
    * 'should emit WorkflowStatusChange event correctly'
        check that the changeWorkflowStatus event emit correct information with ProposalsRegistrationEnded as previousStatus and VotingSessionStarted as newStatus
    * 'should revert if not called by the contract owner'
        check the onlyOwner modifier by expecting a revert if not triggered by the owner's address
    * 'should revert if WorkflowStatus is before ProposalsRegistrationEnded'
        check that calling startVotingSession before the ProposalsRegistrationEnded WorkflowStatus causes a revert
    * 'should revert if WorkflowStatus is after ProposalsRegistrationEnded'
        check that calling startVotingSession after the ProposalsRegistrationEnded WorkflowStatus causes a revert

6. test(6)setVote.js = setVote function testing (7 tests)
    * "should update the vote count for the selected proposal and the voter's vote status"
        check that proposals : 
            - are correctly initialized with a default voteCount equal to 0
            - are correctly updated after voter's vote with a voteCout equal to the number of voters' vote received in favor
        check that Voter struct :
            - is correctly initialized with : 
                -> isRegistered = true
                -> hasVoted = false
                -> votedProposalId = 0 (as GENESIS stands for blank ballot)
            - is correctly updated with :
                -> isRegistered = true
                -> hasVoted = true
                -> votedProposalId = the voted proposalId
    * 'should emit Voted event'
        check that the Voted event is correctly emited with the :
            - voter's address
            - proposalId of voter's vote
    * 'should revert when voting for an invalid proposal ID'
        check that if a voter try to vote for an invalid proposal ID, it causes a revert
    * 'should revert when voting from a non-registered voter account'
        check that if someone tries to vote for a propoal from : 
            - a non-registered voter account, it causes a revert
            - the admin account, , it causes a revert
    * 'should revert when voting before the voting period'
        check that calling setVote function before the VotingSessionStarted WorkflowStatus causes a revert
    * 'should revert when voting after the voting period'
        check that calling setVote function after the VotingSessionStarted WorkflowStatus causes a revert
    * 'should revert when a voter tries to vote multiple times'
        check that if a voter that as already voted, tries to vote a second time by calling the setVote function again, it causes a revert

7. test(7)endVotingSession.js = endVotingSession function testing (5 tests)
    * 'should endVotingSession correctly'
        check that the workflowStatus is correctly updated from VotingSessionStarted to VotingSessionEnded
    * 'should emit WorkflowStatusChange event correctly'
        check that the changeWorkflowStatus event emit correct information with VotingSessionStarted as previousStatus and VotingSessionEnded as newStatus
    * 'should revert if not called by the contract owner'
        check the onlyOwner modifier by expecting a revert if not triggered by the owner's address
    * 'should revert if WorkflowStatus is before VotingSessionStarted'
        check that calling endVotingSession before the VotingSessionStarted WorkflowStatus causes a revert
    * 'should revert if WorkflowStatus is after VotingSessionStarted'
        check that calling endVotingSession after the VotingSessionStarted WorkflowStatus causes a revert

8. test(8)tallyVotes.js = tallyVotes function testing (5 tests)
    * 'should return correct winning proposal ID'
        check that it returns the correct winningProposalID by comparing each Proposals' voteCount
    * 'should emit WorkflowStatusChange event correctly'
        check that the changeWorkflowStatus event emit correct information with VotingSessionEnded as previousStatus and VotesTallied as newStatus
    * 'should revert if not called by the contract owner'
        check the onlyOwner modifier by expecting a revert if not triggered by the owner's address
    * "should revert if called before the VotingSessionEnded WorkflowStatus"
        check that calling tallyVotes function before the VotingSessionEnded WorkflowStatus causes a revert
    * "should revert if called when votes are already tallied"
        check that calling tallyVotes function when the VotesTallied WorkflowStatus is active causes a revert


#### Personal notes
* I didn't know if tests' reverts descriptions had to be the same as in the Voting contract.
    For example while checking the workflow status in "test(1)addVoter.js" i used the revert specified in the original contract :  
        - require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet')
        - however in the test file, i checked that while the workflowStatus "startProposalsRegistering" is active, it is impossible to add a new voter. 
    Technically, the revert cause's is incorect and should be something as "Registering session has already ended". 


