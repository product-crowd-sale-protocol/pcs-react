'use strict';

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ACCOUNT_NAME = exports.AGENT_ACCOUNT = exports.CONTRACT_ACCOUNT = exports.NEW_AWS_API_URL = exports.AWS_SECURITY_API_URL = void 0;
var AWS_SECURITY_API_URL = "https://78qy7hxmjd.execute-api.ap-northeast-1.amazonaws.com/pcsSecurity";
exports.AWS_SECURITY_API_URL = AWS_SECURITY_API_URL;
var NEW_AWS_API_URL = "https://85z0ywf1ol.execute-api.ap-northeast-1.amazonaws.com/secretHashing0";
exports.NEW_AWS_API_URL = NEW_AWS_API_URL;
var CONTRACT_ACCOUNT = "pcscoreprtcl";
exports.CONTRACT_ACCOUNT = CONTRACT_ACCOUNT;
var AGENT_ACCOUNT = "leohioleohio";
exports.AGENT_ACCOUNT = AGENT_ACCOUNT;
var ACCOUNT_NAME = {
  ISSUER: {
    PCS: "leohioleohio"
  }
};
exports.ACCOUNT_NAME = ACCOUNT_NAME;