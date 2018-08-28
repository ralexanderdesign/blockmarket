var BlockMarket = artifacts.require("./BlockMarket.sol");

module.exports = function(deployer) {
  deployer.deploy(BlockMarket);
};
