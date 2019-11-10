App = {
    web3Provider: null,
    contracts: {},
    account: "0x0",

    init: function() {
        return App.initWeb3()
    },

    initWeb3: function() {
        if (typeof web3 !== "undefined") {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider(
                "http://localhost:7545"
            )
            web3 = new Web3(App.web3Provider)
        }
        return App.initContract()
    },

    initContract: function() {
        $.getJSON("Box.json", function(box) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.Box = TruffleContract(box)

            // Connect provider to interact with contract
            App.contracts.Box.setProvider(App.web3Provider)

            App.listenForEvents()

            return App.render()
        })
    },

    render: function() {
        var loader = $("#loader")
        var createNote = $("#create-note")
        var openBox = $("#box-opened")
        var closedBox = $("#box-closed")
        
        //loader.show()
        //createNote.hide()
        //openBox.hide()
        //closedBox.hide()

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account
                $("#account-address").html("Your Account: " + account)
            }
        })
        
        var boxInstance
        // Load contract data
        App.contracts.Box.deployed()
            .then(function(instance) {
                boxInstance = instance
                loader.hide()
                return boxInstance.voters(App.account)
            })
            .then(function(voted) {
                if (boxInstance.opened) {
                    openBox.show()
                } else {
                    if (voted) {
                        closedBox.show()
                    } else {
                        createNote.show()
                    }
                }
            })
            .catch(function(error) {
                console.error(error)
            })
    },

    submitNote: function() {
        var candidateId = $("#candidatesSelect").val()
        App.contracts.Box.deployed()
            .then(function(instance) {
                return instance.vote(candidateId, { from: App.account })
            })
            .then(function(result) {
                // Wait for votes to update
                $("#content").hide()
                $("#loader").show()
            })
            .catch(function(err) {
                console.error(err)
            })
    },

    listenForEvents: function() {
        App.contracts.Box.deployed().then(function(instance) {
            instance
                .BoxOpened({
                        fromBlock: 0,
                        toBlock: "latest"
                    })
                .watch(function(error, event) {
                    // react to event
                })
        })
    },
}

function getTimeDelta (countDownDate) {
    var now = new Date().getTime()

    var distance = countDownDate - now

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24))
    var hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    var seconds = Math.floor((distance % (1000 * 60)) / 1000)
    
    // If the count down is over, write some text
    if (distance < 0) {
        clearInterval(x)
        return "The Box is Ready to Open!"
    }

    return `${days}d ${hours}hrs ${minutes}min ${seconds}s`;
}

$(function() {
    $(window).load(function() {
        App.init()
        setInterval(() => {
            let countdown = $("#countdown")
            countdown.empty()
            countdown.append(
                getTimeDelta(new Date("Dec 8, 2019 15:37:25").getTime())
            )
        }, 1000)
    })
})
