'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.number.constructor");

require("regenerator-runtime/runtime");

var _eosjsEcc = _interopRequireDefault(require("eosjs-ecc"));

var _config = require("./util/config");

var _eosUtil = require("./util/eosUtil");

var _server = _interopRequireDefault(require("./util/server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PcsSignature =
/*#__PURE__*/
function () {
  function PcsSignature(_ref, symbol) {
    var protocol = _ref.protocol,
        host = _ref.host,
        port = _ref.port,
        chainId = _ref.chainId;

    _classCallCheck(this, PcsSignature);

    this.network = {
      blockchain: "eos",
      protocol: protocol,
      host: host,
      port: port,
      chainId: chainId
    };
    this.symbol = symbol;
  }
  /**
   * Generate Subsig key pair from nftId & password
   * @param {number} nftId nft id
   * @param {string} passWord password
   */


  _createClass(PcsSignature, [{
    key: "genKeyPair",
    value: function () {
      var _genKeyPair = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(nftId, passWord) {
        var symbol, salt, privateKey, publicKey, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                symbol = this.symbol;
                _context.next = 3;
                return _server.default.genSalt(passWord, symbol, nftId);

              case 3:
                salt = _context.sent;
                // generate secure salt using our server
                privateKey = _eosjsEcc.default.seedPrivate(passWord + salt); // e.g. 5K2YUVmWfxbmvsNxCsfvArXdGXm7d5DC9pn4yD75k2UaSYgkXTh

                publicKey = _eosjsEcc.default.privateToPublic(privateKey); // e.g. EOS5cYvx6NBYNdcJUym9WydRRs6329UTzJgzKii8dESmw2ZaA4fEH

                response = {
                  "privateKey": privateKey,
                  "publicKey": publicKey
                };
                return _context.abrupt("return", response);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function genKeyPair(_x, _x2) {
        return _genKeyPair.apply(this, arguments);
      }

      return genKeyPair;
    }()
    /**
     * Load ID and Subsig Private Key in Local Storage
     */

  }, {
    key: "getLocalAuth",
    value: function getLocalAuth() {
      var subSig = JSON.parse(localStorage.getItem(this.symbol));

      try {
        var id = subSig.id;
        var privateKey = subSig.privateKey;
        return {
          id: id,
          privateKey: privateKey
        };
      } catch (error) {
        console.error(error);
        throw new ReferenceError("Failed to read local Subsig key.");
      }
    }
    /**
     * store ID and Subsig Private Key in Local Storage
     * @param {number} id 
     * @param {string} privateKey 
     */

  }, {
    key: "setLocalAuth",
    value: function setLocalAuth(id, privateKey) {
      var authority = {
        id: Number(id),
        privateKey: privateKey
      };
      localStorage.setItem(this.symbol, JSON.stringify(authority));
    }
    /**
     * fetch token's subsig public key and owner account name from EOS contract table
     * @param {number} nftId nft id
     */

  }, {
    key: "getEOSAuth",
    value: function () {
      var _getEOSAuth = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(nftId) {
        var query, response, rows, owner, subkey, result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                query = {
                  "code": _config.CONTRACT_ACCOUNT,
                  "scope": this.symbol,
                  "table": "token",
                  "lower_bound": nftId,
                  "limit": 1
                };
                _context2.next = 3;
                return (0, _eosUtil.getTable)(this.network, query);

              case 3:
                response = _context2.sent;
                rows = response.rows;

                if (rows.length) {
                  _context2.next = 7;
                  break;
                }

                throw new ReferenceError("token with id not found");

              case 7:
                owner = rows[0].owner;
                subkey = rows[0].subkey;
                result = {
                  "account": owner,
                  "subkey": subkey
                };
                return _context2.abrupt("return", result);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getEOSAuth(_x3) {
        return _getEOSAuth.apply(this, arguments);
      }

      return getEOSAuth;
    }()
    /**
     * get subsig public key and signature made by subsig private key and message from getSubSigMessage
     */

  }, {
    key: "getSigAndSubkey",
    value: function () {
      var _getSigAndSubkey = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var _this$getLocalAuth, id, privateKey, signature, _ref2, subkey;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _this$getLocalAuth = this.getLocalAuth(), id = _this$getLocalAuth.id, privateKey = _this$getLocalAuth.privateKey;
                signature = PcsSignature.genSig(privateKey);
                _context3.next = 5;
                return this.getEOSAuth(id);

              case 5:
                _ref2 = _context3.sent;
                subkey = _ref2.subkey;
                return _context3.abrupt("return", {
                  signature: signature,
                  subkey: subkey
                });

              case 10:
                _context3.prev = 10;
                _context3.t0 = _context3["catch"](0);
                console.error(_context3.t0);
                return _context3.abrupt("return", {
                  signature: "",
                  subkey: ""
                });

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 10]]);
      }));

      function getSigAndSubkey() {
        return _getSigAndSubkey.apply(this, arguments);
      }

      return getSigAndSubkey;
    }()
    /**
     * check privatekey is valid by our server
     * @param {number} tokenId nft id
     * @param {string} privateKey  subsig private key
     */

  }, {
    key: "verifyAuth",
    value: function () {
      var _verifyAuth = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(tokenId, privateKey) {
        var message, signature, verified;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                message = PcsSignature.getSubSigMessage();
                signature = _eosjsEcc.default.sign(message, privateKey); // verify signature by our server

                _context4.next = 4;
                return _server.default.checkByPCSSecurity(this.symbol, tokenId, signature, message);

              case 4:
                verified = _context4.sent;
                return _context4.abrupt("return", verified["verify"]);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function verifyAuth(_x4, _x5) {
        return _verifyAuth.apply(this, arguments);
      }

      return verifyAuth;
    }()
    /**
     * generate signature with private key and message from getSubSigMessage()
     * @param {string} privateKey private key e.g. 5JVCJaKMoarMBYWXZFamajznjfkDSARGAx1fSWbPmBDGTM82z6A
     */

  }], [{
    key: "genSig",
    value: function genSig(privateKey) {
      var message = PcsSignature.getSubSigMessage();

      var signature = _eosjsEcc.default.sign(message, privateKey);

      return signature;
    }
    /**
     * generate plain text to sign by subsig private key
     */

  }, {
    key: "getSubSigMessage",
    value: function getSubSigMessage() {
      var a_day = 24 * 60 * 60 * 1000;
      var message = String(Math.floor(Number(new Date()) / a_day) * a_day);
      return message;
    }
  }]);

  return PcsSignature;
}();

exports.default = PcsSignature;