'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.number.constructor");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.is-array");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.create");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.function.name");

require("regenerator-runtime/runtime");

var _eosjsEcc = _interopRequireDefault(require("eosjs-ecc"));

var _bs = _interopRequireDefault(require("bs58"));

var _bigi = _interopRequireDefault(require("bigi"));

var _scatter = require("./scatter");

var _checkSig = _interopRequireDefault(require("./checkSig"));

var _server = _interopRequireDefault(require("./util/server"));

var _config = require("./util/config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var PcsClient =
/*#__PURE__*/
function (_Scatter) {
  _inherits(PcsClient, _Scatter);

  function PcsClient() {
    _classCallCheck(this, PcsClient);

    return _possibleConstructorReturn(this, _getPrototypeOf(PcsClient).apply(this, arguments));
  }

  _createClass(PcsClient, [{
    key: "create",

    /**
     * Create PCS Token. Only contract-deployer or 'issuer' execute this.
     * @param {string} issuer - token issuer except this contract
     * @param {string} symbol - the symbol name of token
     */
    value: function () {
      var _create = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(issuer, symbol) {
        var actObj;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.login();

              case 2:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "create",
                  "params": [this.account.name, issuer, symbol]
                };
                _context.next = 5;
                return this.action(actObj);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function create(_x, _x2) {
        return _create.apply(this, arguments);
      }

      return create;
    }()
    /**
     * Issue a PCS token. This method fails if the token has not been created.
     * @param {string} to - Account to receive issued token
     * @param {string} quantity - How much and what kind of token symbol.
     *     e.g. if you want to issue two PCS tokens, quantity is "2 PCS"
     * @param {string} memo - Data that can be written as the user likes.
     */

  }, {
    key: "issue",
    value: function () {
      var _issue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(to, quantity, memo) {
        var actObj, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.login();

              case 2:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "issue",
                  "params": [to, quantity, memo]
                };
                _context2.next = 5;
                return this.action(actObj);

              case 5:
                res = _context2.sent;
                return _context2.abrupt("return", res);

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function issue(_x3, _x4, _x5) {
        return _issue.apply(this, arguments);
      }

      return issue;
    }()
    /**
     * transfer PCS Token to recipient.
     * @param {*} recipient token recipient
     * @param {*} symbol token symbol
     * @param {*} nftId nft id
     * @param {*} agent If this argument is true, use Agent to sign and broadcast Transaction.
     */

  }, {
    key: "transferById",
    value: function () {
      var _transferById = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(recipient, symbol, nftId) {
        var agent,
            sig,
            _sig$getLocalAuth,
            privateKey,
            actObj,
            _args3 = arguments;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                agent = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : false;
                _context3.prev = 1;

                if (!agent) {
                  _context3.next = 9;
                  break;
                }

                // use Agent to sign action data
                sig = new _checkSig.default(this.network, symbol);
                _sig$getLocalAuth = sig.getLocalAuth(), privateKey = _sig$getLocalAuth.privateKey;
                _context3.next = 7;
                return this.transferByIdToAgent(privateKey, recipient, symbol, nftId);

              case 7:
                _context3.next = 14;
                break;

              case 9:
                _context3.next = 11;
                return this.login();

              case 11:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "transferbyid",
                  "params": [this.account.name, recipient, symbol, nftId, "return token"]
                };
                _context3.next = 14;
                return this.action(actObj);

              case 14:
                _context3.next = 20;
                break;

              case 16:
                _context3.prev = 16;
                _context3.t0 = _context3["catch"](1);
                console.error(_context3.t0);
                return _context3.abrupt("return", false);

              case 20:
                return _context3.abrupt("return", true);

              case 21:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[1, 16]]);
      }));

      function transferById(_x6, _x7, _x8) {
        return _transferById.apply(this, arguments);
      }

      return transferById;
    }()
    /**
     * This function is only triggerd internally when transferById's agent argument is true.
     * @param {*} wif subsig private key
     * @param {*} to recipient
     * @param {*} sym token symbol
     * @param {*} token_id nft id
     */

  }, {
    key: "transferByIdToAgent",
    value: function () {
      var _transferByIdToAgent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(wif, to, sym, token_id) {
        var act_bin, to_bin, sym_bin, id_bin, ts_bin, message_bin, message, sig, query, signedTx, response;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (_eosjsEcc.default.isValidPrivate(wif)) {
                  _context4.next = 2;
                  break;
                }

                throw new RangeError("invalid private_key format");

              case 2:
                // generate message for signature
                act_bin = bin(this.encodeName("transferid2"));
                to_bin = bin(this.encodeName(to));
                sym_bin = bin(getSymbolCodeRaw(sym));
                id_bin = bin(new _bigi.default(String(token_id)));
                ts_bin = bin(getTimestamp());
                message_bin = [].concat(_toConsumableArray(act_bin), _toConsumableArray(to_bin), _toConsumableArray(sym_bin), _toConsumableArray(id_bin), _toConsumableArray(ts_bin));
                message = Buffer(message_bin); // generate signature for action data

                sig = _eosjsEcc.default.sign(message, wif); // generate query for PCS server

                query = {
                  AgentEvent: "TRANSFER",
                  newAddress: to,
                  symbolCode: sym,
                  tokenId: String(token_id),
                  signature: sig
                }; // request that the agent signs Transaction.

                _context4.next = 13;
                return _server.default.requestSignTx(query);

              case 13:
                signedTx = _context4.sent;
                _context4.prev = 14;
                _context4.next = 17;
                return this.eosJS.pushTransaction(signedTx);

              case 17:
                response = _context4.sent;
                return _context4.abrupt("return", true);

              case 21:
                _context4.prev = 21;
                _context4.t0 = _context4["catch"](14);
                throw new Error(_context4.t0);

              case 24:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[14, 21]]);
      }));

      function transferByIdToAgent(_x9, _x10, _x11, _x12) {
        return _transferByIdToAgent.apply(this, arguments);
      }

      return transferByIdToAgent;
    }()
    /**
     * Refresh token subsig public key in EOS table and set new subsig private key into local storage.
     * @param {string} password new password to generate subsig key pair
     * @param {string} symbol community symbol
     * @param {string} nftId nft id
     * @param {bool} agent If this argument is true, use Agent to sign and broadcast Transaction. 
     */

  }, {
    key: "refreshKey",
    value: function () {
      var _refreshKey = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(password, symbol, nftId) {
        var agent,
            subsig,
            oldLocalAuth,
            _ref,
            subkey,
            _ref2,
            privateKey,
            publicKey,
            actObj,
            _args5 = arguments;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                agent = _args5.length > 3 && _args5[3] !== undefined ? _args5[3] : false;
                _context5.prev = 1;
                subsig = new _checkSig.default(this.network, symbol);
                _context5.next = 5;
                return subsig.getLocalAuth();

              case 5:
                oldLocalAuth = _context5.sent;
                _context5.next = 8;
                return subsig.getEOSAuth(nftId);

              case 8:
                _ref = _context5.sent;
                subkey = _ref.subkey;
                _context5.next = 12;
                return subsig.genKeyPair(nftId, password);

              case 12:
                _ref2 = _context5.sent;
                privateKey = _ref2.privateKey;
                publicKey = _ref2.publicKey;

                if (!(publicKey === subkey)) {
                  _context5.next = 18;
                  break;
                }

                subsig.setLocalAuth(nftId, privateKey);
                return _context5.abrupt("return", true);

              case 18:
                if (!agent) {
                  _context5.next = 23;
                  break;
                }

                _context5.next = 21;
                return this.refreshKeyToAgent(oldLocalAuth.privateKey, symbol, nftId, publicKey);

              case 21:
                _context5.next = 28;
                break;

              case 23:
                _context5.next = 25;
                return this.login();

              case 25:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "refreshkey",
                  "params": [symbol, nftId, publicKey]
                };
                _context5.next = 28;
                return this.action(actObj);

              case 28:
                subsig.setLocalAuth(nftId, privateKey);
                return _context5.abrupt("return", true);

              case 32:
                _context5.prev = 32;
                _context5.t0 = _context5["catch"](1);
                console.error(_context5.t0);
                return _context5.abrupt("return", false);

              case 36:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[1, 32]]);
      }));

      function refreshKey(_x13, _x14, _x15) {
        return _refreshKey.apply(this, arguments);
      }

      return refreshKey;
    }()
    /**
     * This function is only triggerd internally when transferById's agent argument is true.
     * @param {*} wif subsig private key
     * @param {*} sym token symbol
     * @param {*} token_id nft id
     * @param {*} new_subkey new subkey made by password
     */

  }, {
    key: "refreshKeyToAgent",
    value: function () {
      var _refreshKeyToAgent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(wif, sym, token_id, new_subkey) {
        var act_bin, sym_bin, id_bin, sk_bin, ts_bin, message_bin, message, sig, query, signedTx;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (_eosjsEcc.default.isValidPrivate(wif)) {
                  _context6.next = 2;
                  break;
                }

                throw new RangeError("invalid private_key format");

              case 2:
                // generate message for signature
                act_bin = bin(this.encodeName("refreshkey2"));
                sym_bin = bin(getSymbolCodeRaw(sym));
                id_bin = bin(new _bigi.default(String(token_id)));
                sk_bin = publicKeyToBuffer(new_subkey);
                ts_bin = bin(getTimestamp());
                message_bin = [].concat(_toConsumableArray(act_bin), _toConsumableArray(sym_bin), _toConsumableArray(id_bin), _toConsumableArray(sk_bin), _toConsumableArray(ts_bin));
                message = Buffer(message_bin); // generate signature for query data

                sig = _eosjsEcc.default.sign(message, wif); // generate query for PCS server

                query = {
                  AgentEvent: "REFRESH",
                  symbolCode: sym,
                  tokenId: token_id,
                  signature: sig,
                  newSubKey: new_subkey
                }; // request that the agent signs Transaction.

                _context6.next = 13;
                return _server.default.requestSignTx(query);

              case 13:
                signedTx = _context6.sent;
                _context6.prev = 14;
                _context6.next = 17;
                return this.eosJS.pushTransaction(signedTx);

              case 17:
                _context6.next = 22;
                break;

              case 19:
                _context6.prev = 19;
                _context6.t0 = _context6["catch"](14);
                throw new Error(_context6.t0);

              case 22:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[14, 19]]);
      }));

      function refreshKeyToAgent(_x16, _x17, _x18, _x19) {
        return _refreshKeyToAgent.apply(this, arguments);
      }

      return refreshKeyToAgent;
    }()
    /**
     *  Check the token ownership of the specified Symbol using the PCS server.
     *     Return ture, if the possession of the token is confirmed.
     * @param {string} symbol community symbol
     */

  }, {
    key: "checkSecurity",
    value: function () {
      var _checkSecurity = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(symbol) {
        var subsig, _subsig$getLocalAuth, id, privateKey, verified;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                subsig = new _checkSig.default(this.network, symbol);
                _subsig$getLocalAuth = subsig.getLocalAuth(), id = _subsig$getLocalAuth.id, privateKey = _subsig$getLocalAuth.privateKey;
                _context7.prev = 2;
                _context7.next = 5;
                return subsig.verifyAuth(id, privateKey);

              case 5:
                verified = _context7.sent;
                return _context7.abrupt("return", verified);

              case 9:
                _context7.prev = 9;
                _context7.t0 = _context7["catch"](2);
                console.error(_context7.t0);
                return _context7.abrupt("return", false);

              case 13:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[2, 9]]);
      }));

      function checkSecurity(_x20) {
        return _checkSecurity.apply(this, arguments);
      }

      return checkSecurity;
    }() // encode name type into raw by big endian

  }, {
    key: "encodeName",
    value: function encodeName(name) {
      return this.eosJS.modules.format.encodeName(name, false);
    }
  }]);

  return PcsClient;
}(_scatter.Scatter);

exports.default = PcsClient;
; // get timestamp for action data

function getTimestamp() {
  var duration = 15 * 1000;
  var now = Number(new Date());
  var timestamp = Math.floor(now / duration) * duration;
  var timestamp_bn = new _bigi.default(timestamp.toString());
  var timstamp_micro = timestamp_bn.multiply(new _bigi.default("1000"));
  console.log("timestamp:", timstamp_micro.toString());
  return timstamp_micro;
} // convert publicKey to a format suitable for use as an action argument


function publicKeyToBuffer(public_key) {
  var pk_prefix = "EOS";
  var pk_body = public_key.slice(pk_prefix.length);

  var raw_pk = _bs.default.decode(pk_body);

  return Buffer([0].concat(_toConsumableArray(Array.from(raw_pk).slice(0, -4).map(function (v) {
    return +v;
  }))));
} // convert uint64 value to a format suitable for use as an action argument


function uint64ToBuffer(num) {
  var bn = _bigi.default.isBigInteger(num) ? num : new _bigi.default(num);
  var two = new _bigi.default("2");
  var a_byte = two.pow(8);
  var bytearray = Array.from({
    length: 8
  }, function (v, i) {
    return Number(bn.divide(two.pow(8 * i)).remainder(a_byte));
  });
  console.log("bytearray:", bytearray);
  return Buffer(bytearray);
} // convert symbol_code value to a format suitable for use as an action argument


function getSymbolCodeRaw(symbol_code) {
  if (typeof symbol_code !== "string") {
    throw new Error("the first argument should be string type");
  }

  if (symbol_code.length > 7) {
    throw new Error("string is too long to be a valid symbol_code");
  }

  var raw = new _bigi.default("0");
  var a_byte = new _bigi.default("256");

  for (var i = symbol_code.length - 1; i >= 0; i--) {
    var c = symbol_code[i];

    if (c < 'A' || 'Z' < c) {
      throw new Error("only uppercase letters allowed in symbol_code string");
    }

    raw = raw.multiply(a_byte);
    raw = raw.add(new _bigi.default(c.charCodeAt().toString()));
  }

  return raw;
} /// uint64 -> bytearray


var bin = function bin(num) {
  return Array.from(uint64ToBuffer(num));
};