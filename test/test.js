var Box = artifacts.require("./Box.sol")

contract("Box", function(accounts) {
    var boxInstance

    it("allows a voter to submit a note", function() {
        return Box.deployed()
            .then(function(instance) {
                boxInstance = instance
                candidateId = 1
                return boxInstance.vote(candidateId, { from: accounts[0] })
            })
            .then(function(receipt) {
                assert.equal(receipt.logs.length, 1, "an event was triggered")
                assert.equal(
                    receipt.logs[0].event,
                    "votedEvent",
                    "the event type is correct"
                )
                assert.equal(
                    receipt.logs[0].args._candidateId.toNumber(),
                    candidateId,
                    "the candidate id is correct"
                )
                return electionInstance.voters(accounts[0])
            })
            .then(function(voted) {
                assert(voted, "the voter was marked as voted")
                return electionInstance.candidates(candidateId)
            })
            .then(function(candidate) {
                var voteCount = candidate[2]
                assert.equal(
                    voteCount,
                    1,
                    "increments the candidate's vote count"
                )
            })
    })
}