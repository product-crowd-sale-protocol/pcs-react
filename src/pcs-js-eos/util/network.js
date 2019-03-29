'use strict';

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ETH_NETWORK = exports.EOS_NETWORK = exports.ETH_CHAIN_ID = exports.EOS_CHAIN_ID = void 0;
var EOS_CHAIN_ID = {
  main: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  kylin: "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
  jungle: "038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca"
};
exports.EOS_CHAIN_ID = EOS_CHAIN_ID;
var ETH_CHAIN_ID = {
  mainnet: "1",
  ropsten: "3",
  rinkeby: "4",
  kovan: "42",
  geth: "1337",
  ganache: "5777"
};
exports.ETH_CHAIN_ID = ETH_CHAIN_ID;
var EOS_NETWORK = {
  main: {
    sweden: {
      "protocol": "https",
      "host": "api.eossweden.se",
      "port": "443",
      "chainId": EOS_CHAIN_ID.main
    },
    greymass: {
      "protocol": "https",
      "host": "eos.greymass.com",
      "port": "443",
      "chainId": EOS_CHAIN_ID.main
    },
    lions: {
      "protocol": "https",
      "host": "bp.cryptolions.io",
      "port": "443",
      "chainId": EOS_CHAIN_ID.main
    },
    laomao: {
      "protocol": "https",
      "host": "api.eoslaomao.com",
      "port": "443",
      "chainId": EOS_CHAIN_ID.main
    },
    scatter: {
      "protocol": "https",
      "host": "nodes.get-scatter.com",
      "port": "443",
      "chainId": EOS_CHAIN_ID.main
    }
  },
  kylin: {
    asia: {
      "protocol": "https",
      "host": "api-kylin.eosasia.one",
      "port": "443",
      "chainId": EOS_CHAIN_ID.kylin
    },
    laomao: {
      "protocol": "https",
      "host": "api-kylin.eoslaomao.com",
      "port": "443",
      "chainId": EOS_CHAIN_ID.kylin
    }
  }
};
exports.EOS_NETWORK = EOS_NETWORK;
var ETH_NETWORK = {
  ganache: {
    "protocol": "http",
    "host": "127.0.0.1",
    "port": "7545",
    "chainId": ETH_CHAIN_ID.ganache
  },
  scatter: {
    // 502 error
    "protocol": "https",
    "host": "ethnodes.get-scatter.com",
    "port": "443",
    "chainId": ETH_CHAIN_ID.mainnet
  }
};
exports.ETH_NETWORK = ETH_NETWORK;