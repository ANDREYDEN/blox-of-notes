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

            //App.listenForEvents()
        })
    },

    render: function() {
        $("#loader").show()
        $("#create-note").hide()
        $("#create-box").hide()
        $("#any-expired-open").hide()
        $("#voter-expired-closed").hide()
        $("#creator-expired-closed").hide()
        $("#any-running-closed").hide()

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account
                $("#account-address").html("Your Account: " + account)
            }
        })

        var boxInstance, boxOpeningTime
        // render different views for different scenarios
        App.contracts.Box.deployed()
            .then(function(instance) {
                boxInstance = instance
                $("#loader").hide()
                
                return boxInstance.openingTime()
            })
            .then(function (openingTime) {
                boxOpeningTime = openingTime.c[0]
                var x = setInterval(() => {
                    let countdown = $("#countdown")
                    countdown.empty()
                    let timeString = getTimeDelta(boxOpeningTime)
                    if (timeString === "") {
                        clearInterval(x)
                        if ((Date.now() / 1000) - boxOpeningTime < 1) App.render()
                    } else {
                        countdown.append(timeString)
                    }
                }, 1000)
                return boxInstance.voters(App.account)
            })
            .then(function(voted) {
                if (boxOpeningTime <= (Date.now() / 1000)) {
                    $("#any-expired-open").show()
                } else {
                    if (voted) {
                        $("#any-running-closed").show()
                    } else {
                        $("#create-note").show()
                    }
                }
            })
            .catch(function(error) {
                console.error(error)
            })
    },

    createBox: function() {
        var title = $("#title").val()
        var lifetime = $("#lifetime").val()
        console.log(title, lifetime)
        App.contracts.Box.deployed()
            .then(function(instance) {
                return instance.deployBox(title, lifetime)
            })
            .then(function(result) {
                App.render()
            })
            .catch(function(err) {
                console.error(err)
            })
        return false
    },

    submitNote: function() {
        var boxInstance
        App.contracts.Box.deployed()
            .then(function(instance) {
                boxInstance = instance
                return instance.submitNote($("#note").val(), {
                    from: App.account
                })
            })
            .then(function(result) {
                return boxInstance.openingTime()
            })
            .then(function (openingTime) {
                $("#create-note").hide()
                if (openingTime.c[0] <= Date.now() / 1000) {
                    $("any-expired-open").show()
                } else {
                    $("any-running-closed").show()
                }
            })
            .catch(function(err) {
                console.error(err)
            })
    },

    openBox: function() {
        App.contracts.Box.deployed()
            .then(function(instance) {
                return instance.open()
            })
            .then(function(result) {
                $("any-expired-open").show()
                // TODO: render notes
            })
    }
}

function getTimeDelta (countDownDate) {
    var now = new Date().getTime() / 1000

    var distance = countDownDate - now

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (3600 * 24))
    var hours = Math.floor(
        (distance % (3600 * 24)) / 3600
    )
    var minutes = Math.floor((distance % 3600) / 60)
    var seconds = Math.floor((distance % 60))
    
    console.log(now, countDownDate, distance)

    return (distance < 0) ? "" : `${days}d ${hours}hrs ${minutes}min ${seconds}s`;
}

$(function() {
    $(window).load(function() {
        App.init()
        $("#loader").hide()
        $("#create-note").hide()
        $("#create-box").show()
        $("#any-expired-open").hide()
        $("#voter-expired-closed").hide()
        $("#creator-expired-closed").hide()
        $("#any-running-closed").hide()
    })
})
