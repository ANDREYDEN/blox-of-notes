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
            App.contracts.Box.setProvider(
                App.web3Provider
            )

            $.getJSON("Storage.json", function(storage) {
                // Instantiate a new truffle contract from the artifact
                App.contracts.Storage = TruffleContract(storage)

                // Connect provider to interact with contract
                App.contracts.Storage.setProvider(App.web3Provider)

                return App.render()
            })
        })
    },

    render: function() {
        console.log("rendering...")
        $("#voter-expired-closed").hide()
        $("#creator-expired-closed").hide()
        $("#any-running-closed").hide()
        $("#loader").show()

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account
                $("#account-address").html(
                    "Your Account: " + account
                )
            }
        })

        var storageInstance, boxInstance, boxOpeningTime
        // render different views for different scenarios
        App.contracts.Storage.deployed()
            .then(function(instance) {
                storageInstance = instance
                $("#loader").hide()
                $("#results").empty();
                $("#results").append(
                    '<tr><th class="tg-baqh">Note submited</th><th class="tg-baqh">Box Title</th><th class="tg-baqh">Box Address</th><th class="tg-baqh">Info</th></tr>'
                )
                return storageInstance.voterBoxCount(App.account)
            })
            .then(function(boxCount) {
                console.log("Box Count:", boxCount)
                for (let b = 1; b <= boxCount.c[0]; b++) {
                    var boxAddr, boxCountdown, theNote
                    console.log(storageInstance)
                    storageInstance.getMyBox(b, { from: App.account})
                        .then(function(boxAddress) {
                            console.log(boxAddress)
                            boxAddr = boxAddress
                            return storageInstance.getBoxOpeningTime(b, {
                                from: App.account
                            })
                        })
                        .then(function (openingTime) {
                            // update countdown
                            boxOpeningTime = openingTime.c[0]
                            boxCountdown = getTimeDelta(boxOpeningTime)
                            var x = setInterval(() => {
                                let countdown = $(`#countdown${b}`)
                                countdown.empty()
                                let timeString = getTimeDelta(boxOpeningTime)
                                if (timeString === "") {
                                    clearInterval(x)
                                    //if ((Date.now() / 1000) - boxOpeningTime < 1) App.render()
                                } else {
                                    countdown.append(timeString)
                                }
                            }, 1000)

                            return storageInstance.getBoxIndividualNote(b, {
                                from: App.account
                            })
                        })
                        .then(function(note) {
                            theNote = note
                            return storageInstance.getBoxTitle(b, { from: App.account })
                        })
                        .then(function(title) {
                            $("#results").append(`<tr><td>${theNote}</td><td>${title}</td><td>${boxAddr}</td><td id="countdown${b}">${boxCountdown}</td></tr>`)
                        })
                        .catch(function(error) {
                            console.error(error)
                        })
                }
            })
            .catch(function(error) {
                console.error(error)
            })
    },

    createBox: function() {
        var title = $("#title").val()
        var lifetime = $("#lifetime").val()
        App.contracts.Storage.deployed()
            .then(function(storageInstance) {
                return storageInstance.deployBox(title, Date.now() / 1000 + lifetime*1, {
                    from: App.account
                })
            })
            .then(function() {
                App.render()
            })
            .catch(function(err) {
                console.error(err)
            })
        return false
    },

    submitNote: function() {
        App.contracts.Storage.deployed()
            .then(function(storageInstance) {
                return storageInstance.submitNote($("#note").val(), $("#box-address").val(), {
                    from: App.account
                })
            })
            .then(function() {
                App.render()
            })
            .catch(function(err) {
                console.error(err)
            })
    },

    showNotes: function() {
        // TODO: render notes to pop-up
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

    return (distance < 0) ? "" : `${days}d ${hours}hrs ${minutes}min ${seconds}s`;
}

$(function() {
    $(window).load(function() {
        App.init()
    })
})
