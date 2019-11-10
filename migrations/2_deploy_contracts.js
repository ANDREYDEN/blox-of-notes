var Box = artifacts.require("Box")
var Storage = artifacts.require("Storage")

module.exports = function(deployer) {
    deployer.deploy(Box, 0, "", 0, "0x515D3313a0f89B3e06773f9C5E3369Dcaa5aa343")
    deployer.deploy(Storage)
}
