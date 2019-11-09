var Box = artifacts.require("./Box.sol")

module.exports = function(deployer) {
    deployer.deploy(Box, 2, "What is the best EthWaterloo hack?")
}
