var Box = artifacts.require("./Box.sol")

contract("Box", function(accounts) {
    var boxInstance

    it("allows a voter to submit a note", function() {
        return Box.deployed()
            .then(function(instance) {
                boxInstance = instance
                boxInstance.submitNote("note", { from: accounts[0] })
                return boxInstance.voters(accounts[0])
            })
            .then(function(voted) {
                assert(voted, "the voter was not marked as voted")
                return boxInstance.numberOfNotes()
            })
            .then(function(numberOfNotes) {
                assert.equal(numberOfNotes, 1, "Number of notes not incremented")
                return boxInstance.notes(numberOfNotes)
            })
            .then(function(note) {
                assert.equal(
                    note,
                    "note",
                    "The vote was not received"
                )
            })
    })

    it("rejects to open before opening time", function () {
        return true
    })

    it("opens after opening time", function () {
        return Box.deployed()
            .then(function(instance) {
                boxInstance = instance
                setTimeout(function() {
                    boxInstance.open()
                        .then(function() {
                            assert(boxInstance.ended, "The ending was not recorded")
                        })
                }, 3)
            })
            
    })

    it("rejects submitions after opening time", function () {
        return true
    })
})