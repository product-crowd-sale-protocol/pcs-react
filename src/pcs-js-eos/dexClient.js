'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.create");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.number.constructor");

require("regenerator-runtime/runtime");

var _scatter = require("./scatter");

var _config = require("./util/config");

var _eosUtil = require("./util/eosUtil");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

var PcsDex =
/*#__PURE__*/
function (_Scatter) {
  _inherits(PcsDex, _Scatter);

  function PcsDex() {
    _classCallCheck(this, PcsDex);

    return _possibleConstructorReturn(this, _getPrototypeOf(PcsDex).apply(this, arguments));
  }

  _createClass(PcsDex, [{
    key: "addSellOrderByid",

    /**
     * create sell order
     * @param {string} symbol - Token symbol 
     * @param {number} tokenId - Token ID
     * @param {number} price - Token Price by EOS
     */
    value: function () {
      var _addSellOrderByid = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(symbol, tokenId, price) {
        var quantity, actObj;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                quantity = PcsDex.numToAsset(Number(price)); // e.g. "1.1000 EOS"

                _context.next = 3;
                return this.login();

              case 3:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "addsellobyid",
                  "params": [symbol, tokenId, quantity, "add sell order"]
                };
                _context.next = 6;
                return this.action(actObj);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function addSellOrderByid(_x, _x2, _x3) {
        return _addSellOrderByid.apply(this, arguments);
      }

      return addSellOrderByid;
    }()
    /**
     * Buy Token from sell order
     * @param {string} symbol - Token symbol
     * @param {number} tokenId - Token ID in sell order table
     */

  }, {
    key: "buyFromOrder",
    value: function () {
      var _buyFromOrder = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(symbol, tokenId) {
        var _ref, seller, price, actObj1, actObj2;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.getSellInfo(symbol, tokenId);

              case 2:
                _ref = _context2.sent;
                seller = _ref.seller;
                price = _ref.price;
                _context2.next = 7;
                return this.login();

              case 7:
                actObj1 = {
                  "contractName": "eosio.token",
                  "actionName": "transfer",
                  "params": [this.account.name, _config.CONTRACT_ACCOUNT, price, "deposit EOS to buy token from order"]
                };
                actObj2 = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "buyfromorder",
                  "params": [this.account.name, symbol, tokenId, "buy token from ".concat(seller)]
                };
                _context2.next = 11;
                return this.transaction(actObj1, actObj2);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function buyFromOrder(_x4, _x5) {
        return _buyFromOrder.apply(this, arguments);
      }

      return buyFromOrder;
    }()
    /**
     * Cancel your sell order
     * @param {string} symbol - Token Symbol
     * @param {number} tokenId - Token ID in sell order table
     */

  }, {
    key: "cancelSellOrderById",
    value: function () {
      var _cancelSellOrderById = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(symbol, tokenId) {
        var actObj;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.login();

              case 2:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "cancelsobyid",
                  "params": [symbol, tokenId]
                };
                _context3.next = 5;
                return this.action(actObj);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function cancelSellOrderById(_x6, _x7) {
        return _cancelSellOrderById.apply(this, arguments);
      }

      return cancelSellOrderById;
    }()
    /**
     * create buy order
     * @param {string} symbol - Token Symbol
     * @param {number} price - Token Order Price by EOS
     */

  }, {
    key: "addBuyOrder",
    value: function () {
      var _addBuyOrder = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(symbol, price) {
        var quantity, actObj1, actObj2;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                quantity = PcsDex.numToAsset(Number(price));
                _context4.next = 3;
                return this.login();

              case 3:
                actObj1 = {
                  "contractName": "eosio.token",
                  "actionName": "transfer",
                  "params": [this.account.name, _config.CONTRACT_ACCOUNT, quantity, "deposit EOS to order token"]
                };
                actObj2 = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "addbuyorder",
                  "params": [this.account.name, symbol, quantity, ""]
                };
                _context4.next = 7;
                return this.transaction(actObj1, actObj2);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function addBuyOrder(_x8, _x9) {
        return _addBuyOrder.apply(this, arguments);
      }

      return addBuyOrder;
    }()
    /**
     * Sell token to other's buy order
     * @param {string} symbol - Token symbol
     * @param {number} tokenId - your Token ID to sell
     * @param {number} orderId - Order ID in buy table
     */

  }, {
    key: "sellToBuyOrder",
    value: function () {
      var _sellToBuyOrder = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(symbol, tokenId, orderId) {
        var actObj;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.login();

              case 2:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "selltoorder",
                  "params": [symbol, tokenId, orderId, "sell token"]
                };
                _context5.next = 5;
                return this.action(actObj);

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function sellToBuyOrder(_x10, _x11, _x12) {
        return _sellToBuyOrder.apply(this, arguments);
      }

      return sellToBuyOrder;
    }()
    /**
     * cancel your buy order
     * @param {string} symbol - Token symbol
     * @param {number} orderId - Order ID in buy table
     */

  }, {
    key: "cancelBuyOrderById",
    value: function () {
      var _cancelBuyOrderById = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(symbol, orderId) {
        var actObj;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.login();

              case 2:
                actObj = {
                  "contractName": _config.CONTRACT_ACCOUNT,
                  "actionName": "cancelbobyid",
                  "params": [symbol, orderId]
                };
                _context6.next = 5;
                return this.action(actObj);

              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function cancelBuyOrderById(_x13, _x14) {
        return _cancelBuyOrderById.apply(this, arguments);
      }

      return cancelBuyOrderById;
    }()
  }, {
    key: "fetchBuyTable",
    value: function () {
      var _fetchBuyTable = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(symbol) {
        var query, response, rows;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                query = {
                  "code": _config.CONTRACT_ACCOUNT,
                  "scope": symbol,
                  "table": "buyorder",
                  "limit": 100
                };
                _context7.next = 3;
                return (0, _eosUtil.getTable)(this.network, query);

              case 3:
                response = _context7.sent;
                rows = response.rows;
                return _context7.abrupt("return", rows);

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function fetchBuyTable(_x15) {
        return _fetchBuyTable.apply(this, arguments);
      }

      return fetchBuyTable;
    }()
  }, {
    key: "fetchSellTable",
    value: function () {
      var _fetchSellTable = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(symbol) {
        var query, response, rows;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                query = {
                  "code": _config.CONTRACT_ACCOUNT,
                  "scope": symbol,
                  "table": "sellorder",
                  "limit": 100
                };
                _context8.next = 3;
                return (0, _eosUtil.getTable)(this.network, query);

              case 3:
                response = _context8.sent;
                rows = response.rows;
                return _context8.abrupt("return", rows);

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function fetchSellTable(_x16) {
        return _fetchSellTable.apply(this, arguments);
      }

      return fetchSellTable;
    }() // get information of a sell order from EOS table.

  }, {
    key: "getSellInfo",
    value: function () {
      var _getSellInfo = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(symbol, nftId) {
        var query, response, rows, seller, price;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                query = {
                  "code": _config.CONTRACT_ACCOUNT,
                  "scope": symbol,
                  "table": "sellorder",
                  "lower_bound": nftId,
                  "upper_bound": nftId,
                  "limit": 1
                };
                _context9.next = 3;
                return (0, _eosUtil.getTable)(this.network, query);

              case 3:
                response = _context9.sent;
                rows = response.rows;

                if (rows.length) {
                  _context9.next = 7;
                  break;
                }

                throw new Error("sell order is not found.");

              case 7:
                seller = rows[0].user;
                price = rows[0].price; // e.g. "1.1000 EOS"

                return _context9.abrupt("return", {
                  seller: seller,
                  price: price
                });

              case 10:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getSellInfo(_x17, _x18) {
        return _getSellInfo.apply(this, arguments);
      }

      return getSellInfo;
    }()
  }]);

  return PcsDex;
}(_scatter.Scatter);

exports.default = PcsDex;