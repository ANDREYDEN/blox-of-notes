var Box = artifacts.require("Box")
var Storage = artifacts.require("Storage")

module.exports = function(deployer) {
    deployer.deploy(Box, 0, "", 0)
    deployer.deploy(Storage)
}
