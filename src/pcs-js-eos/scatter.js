'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scatter = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.is-array");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.array.find");

require("regenerator-runtime/runtime");

var _scatterjsCore = _interopRequireDefault(require("scatterjs-core"));

var _scatterjsPluginEosjs = _interopRequireDefault(require("scatterjs-plugin-eosjs"));

var _eosjs = _interopRequireDefault(require("eosjs"));

var _network = require("./util/network");

var _error = require("./util/error");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Scatter =
/*#__PURE__*/
function () {
  /**
   * constructor
   * @param {string} protocol transmission protocol e.g. https, http
   * @param {string} host EOS-node host  e.g. eos.greymass.com
   * @param {string} port EOS-node port number e.g. 443, 80
   * @param {string} chain EOS-chain ID. e.g. aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906
   */
  function Scatter(_ref) {
    var protocol = _ref.protocol,
        host = _ref.host,
        port = _ref.port,
        chainId = _ref.chainId;
    var appName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "default";

    _classCallCheck(this, Scatter);

    try {
      this.network = {
        blockchain: "eos",
        protocol: protocol,
        host: host,
        port: port,
        chainId: chainId
      };
      this.requiredFields = {
        accounts: [this.network]
      };
      this.appName = appName; // ScatterJS setup

      _scatterjsCore.default.plugins(new _scatterjsPluginEosjs.default());

      var eosJSOptions = {
        expireInSeconds: 60
      };
      this.eosJS = _scatterjsCore.default.eos(this.network, _eosjs.default, eosJSOptions); // eosjs@16.0.9 instance

      this.connected = false; // Scatter exists and is unlocked.
    } catch (error) {
      throw new _error.ScatterError(_error.ErrorCodes.INVALID_VALUE, "invalid_network", "invalid network. Please check the entered value.");
    }
  }
  /**
   * connect with Scatter client server using websocket.
   * this method is scatter unique and needs to be executed.
   * @param {string} appName the name of the application. It can be set freely.
   */


  _createClass(Scatter, [{
    key: "connect",
    value: function () {
      var _connect = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(appName) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _scatterjsCore.default.connect(appName);

              case 2:
                this.connected = _context.sent;

                if (this.connected) {
                  _context.next = 5;
                  break;
                }

                throw new _error.ScatterError(_error.ErrorCodes.LOCKED, "connection_fail", "Scatter Client is not found. Make sure that the Scatter is unlocked.");

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function connect(_x) {
        return _connect.apply(this, arguments);
      }

      return connect;
    }()
    /**
     * connection with scatter and set user account into that
     * To make a action, user needs to run this method at least once.
     * @param {string} appName the name of the application. It can be set freely.
     */

  }, {
    key: "login",
    value: function () {
      var _login = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.connected) {
                  _context2.next = 3;
                  break;
                }

                _context2.next = 3;
                return this.connect(this.appName);

              case 3:
                if (_scatterjsCore.default.identity) {
                  _context2.next = 15;
                  break;
                }

                _context2.prev = 4;
                _context2.next = 7;
                return _scatterjsCore.default.login(this.requiredFields);

              case 7:
                _context2.next = 9;
                return _scatterjsCore.default.identity.accounts.find(function (x) {
                  return x.blockchain === 'eos';
                });

              case 9:
                this.account = _context2.sent;
                _context2.next = 15;
                break;

              case 12:
                _context2.prev = 12;
                _context2.t0 = _context2["catch"](4);
                throw new _error.ScatterError(_error.ErrorCodes.OTHERS, "identity_not_found", "User Identity is not found.");

              case 15:
                if (this.account) {
                  _context2.next = 25;
                  break;
                }

                _context2.prev = 16;
                _context2.next = 19;
                return _scatterjsCore.default.identity.accounts.find(function (x) {
                  return x.blockchain === 'eos';
                });

              case 19:
                this.account = _context2.sent;
                _context2.next = 25;
                break;

              case 22:
                _context2.prev = 22;
                _context2.t1 = _context2["catch"](16);
                throw new _error.ScatterError(_error.ErrorCodes.OTHERS, "account_not_found", "Account is not found. Please try again.");

              case 25:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 12], [16, 22]]);
      }));

      function login() {
        return _login.apply(this, arguments);
      }

      return login;
    }()
    /**
     * logout from app 
     */

  }, {
    key: "logout",
    value: function () {
      var _logout = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.connected) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 3;
                return this.connect(this.appName);

              case 3:
                if (this.connected) {
                  _context3.next = 5;
                  break;
                }

                throw new _error.ScatterError(_error.ErrorCodes.LOCKED, "connection_fail", "Scatter Client is not found.");

              case 5:
                _context3.next = 7;
                return _scatterjsCore.default.logout();

              case 7:
                res = _context3.sent;
                return _context3.abrupt("return", res);

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function logout() {
        return _logout.apply(this, arguments);
      }

      return logout;
    }()
    /**
     * set requireFields
     * this method is scatter unique
     * @param {string} key requireFields key name
     * @param {any} content requireFields value
     */

  }, {
    key: "setRequiredFields",
    value: function setRequiredFields(key, content) {
      this.requiredFields = Object.assign({}, this.requiredFields, _defineProperty({}, key, content));
    }
    /**
     * send a action
     * @param  {Object} action
     *     action = {
     *         contractName : "CONTRACT_NAME",
     *         actionName: "ACTION_NAME",
     *         params: [params]
     *     }
     */

  }, {
    key: "action",
    value: function () {
      var _action = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(_ref2) {
        var contractName, actionName, params, txOptions, contract, res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                contractName = _ref2.contractName, actionName = _ref2.actionName, params = _ref2.params;
                _context4.prev = 1;
                txOptions = {
                  authorization: ["".concat(this.account.name, "@").concat(this.account.authority)]
                };
                _context4.next = 5;
                return this.eosJS.contract(contractName, {
                  "requiredFields": this.requiredFields
                });

              case 5:
                contract = _context4.sent;
                _context4.next = 8;
                return contract[actionName].apply(contract, _toConsumableArray(params).concat([txOptions]));

              case 8:
                res = _context4.sent;
                return _context4.abrupt("return", res);

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](1);

                if (!(_typeof(_context4.t0) == "object")) {
                  _context4.next = 18;
                  break;
                }

                this._scatterError(_context4.t0);

                _context4.next = 19;
                break;

              case 18:
                throw new Error(_context4.t0);

              case 19:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[1, 12]]);
      }));

      function action(_x2) {
        return _action.apply(this, arguments);
      }

      return action;
    }()
    /**
     * send a transaction
     * @param  {Object} action
     *     action = {
     *         contractName : "CONTRACT_NAME",
     *         actionName: "ACTION_NAME",
     *         params: [params]
     *     }
     */

  }, {
    key: "transaction",
    value: function () {
      var _transaction = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5() {
        var _len,
            actionList,
            _key,
            txOptions,
            contractList,
            res,
            _args5 = arguments;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                for (_len = _args5.length, actionList = new Array(_len), _key = 0; _key < _len; _key++) {
                  actionList[_key] = _args5[_key];
                }

                _context5.prev = 1;
                txOptions = {
                  authorization: ["".concat(this.account.name, "@").concat(this.account.authority)]
                };
                contractList = actionList.map(function (act) {
                  return act.contractName;
                });
                _context5.next = 6;
                return this.eosJS.transaction(contractList, function (tx) {
                  actionList.forEach(function (act) {
                    var _tx$contractName;

                    var contractName = act.contractName.replace(".", "_"); // dots cannot be used in method name

                    (_tx$contractName = tx[contractName])[act.actionName].apply(_tx$contractName, _toConsumableArray(act.params).concat([txOptions]));
                  });
                });

              case 6:
                res = _context5.sent;
                return _context5.abrupt("return", res);

              case 10:
                _context5.prev = 10;
                _context5.t0 = _context5["catch"](1);

                if (!(_typeof(_context5.t0) == "object")) {
                  _context5.next = 16;
                  break;
                }

                this._scatterError(_context5.t0);

                _context5.next = 17;
                break;

              case 16:
                throw new Error(_context5.t0);

              case 17:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[1, 10]]);
      }));

      function transaction() {
        return _transaction.apply(this, arguments);
      }

      return transaction;
    }()
    /**
     * send EOS to recipient
     * @param {string} recipient recipient account name
     * @param {number} amount eos amount
     * @param {string} memo text message
     */

  }, {
    key: "send",
    value: function () {
      var _send = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(recipient, amount, memo) {
        var eosAmount, actObj, res;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.prev = 0;
                eosAmount = Scatter.numToAsset(amount);
                actObj = {
                  contractName: "eosio.token",
                  actionName: "transfer",
                  params: [this.account.name, recipient, eosAmount, memo]
                };
                _context6.next = 5;
                return this.action(actObj);

              case 5:
                res = _context6.sent;
                return _context6.abrupt("return", res);

              case 9:
                _context6.prev = 9;
                _context6.t0 = _context6["catch"](0);

                if (!(_typeof(_context6.t0) == "object")) {
                  _context6.next = 15;
                  break;
                }

                this._scatterError(_context6.t0);

                _context6.next = 16;
                break;

              case 15:
                throw new Error(_context6.t0);

              case 16:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[0, 9]]);
      }));

      function send(_x3, _x4, _x5) {
        return _send.apply(this, arguments);
      }

      return send;
    }()
    /**
     * convert a number data to eos asset data 
     * If you enter 1 for this function, a value of "1.0000 EOS" is output.
     * @param {number} amount token amount
     * @param {number} decimal token decimal
     * @param {string} symbol token symbol
     */

  }, {
    key: "_scatterError",

    /**
     * process scatter error object
     * @param {object} errorObj scatter error object
     */
    value: function _scatterError(errorObj) {
      var errorCode = "code" in errorObj ? errorObj.code : _error.ErrorCodes.OTHERS; // if errorCode is null or undefined

      var errorType = "type" in errorObj ? errorObj.type : "no_type";
      throw new _error.ScatterError(errorCode, errorType, "".concat(errorObj.type, ". ").concat(errorObj.message));
    }
    /**
     * A getter for network information
     */

  }], [{
    key: "numToAsset",
    value: function numToAsset(amount) {
      var decimal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
      var symbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "EOS";
      var re = new RegExp("^([1-9]\\d*|0)(\\.\\d+)?$", "gi"); // check if the type is unsigned float.

      if (String(amount).match(re)) {
        var eos_amount = String(amount.toFixed(decimal)) + " ".concat(symbol);
        return eos_amount;
      } else {
        throw new _error.ScatterError(_error.ErrorCodes.INVALID_VALUE, "invalid_amount", "invalid amount. amount can only be an unsigned decimal.");
      }
    }
  }, {
    key: "networkList",
    get: function get() {
      return _network.EOS_NETWORK;
    }
  }]);

  return Scatter;
}();

exports.Scatter = Scatter;