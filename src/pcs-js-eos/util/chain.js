'use strict';

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ETHChainID = exports.EOSChainID = void 0;
var EOSChainID = {
  mainnet: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  kylin: "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
  jungle: "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca"
};
exports.EOSChainID = EOSChainID;
var ETHChainID = {
  Mainnet: "1",
  mainnet: "1",
  Ropsten: "3",
  ropsten: "3",
  Rinkeby: "4",
  rinkeby: "4",
  Kovan: "42",
  kovan: "42",
  Geth: "1337",
  geth: "1337",
  Ganache: "5777",
  ganache: "5777"
};
exports.ETHChainID = ETHChainID;