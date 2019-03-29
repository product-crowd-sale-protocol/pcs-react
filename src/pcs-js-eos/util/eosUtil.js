'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTable = getTable;
exports.getTokenInfo = getTokenInfo;

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.array.filter");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.define-property");

require("regenerator-runtime/runtime");

require("core-js/modules/es6.promise");

var _config = require("./config");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * fetch information from EOS contract table
 * @param {Object} query - Request to fetch information from EOS table
 * @param {string} query.code - Target contract name
 * @param {string} query.scope - Target scope name
 * @param {string} query.table - Target table name
 * @param {string} query.lower_bound - Sort key min limit --optional
 * @param {string} query.upper_bound - Sort key max limit --optional
 * @param {string} query.limit - Query limit [0, 100] --optional
 * There are many other parameters. Read the official EOS documentation.
 */
function getTable(_x, _x2) {
  return _getTable.apply(this, arguments);
}
/**
 * fetch token information from EOS table
 * @param {string} symbol community symbol
 * @param {number} nftId nft id
 */


function _getTable() {
  _getTable = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(_ref, query) {
    var protocol, host, apiUrl, url, req, response, result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            protocol = _ref.protocol, host = _ref.host;
            apiUrl = protocol + "://" + host;
            url = apiUrl + "/v1/chain/get_table_rows";
            req = {
              method: "POST",
              mode: "cors",
              body: JSON.stringify(_objectSpread({
                "json": true
              }, query))
            };
            _context.next = 6;
            return fetch(url, req);

          case 6:
            response = _context.sent;
            _context.next = 9;
            return response.json();

          case 9:
            result = _context.sent;
            return _context.abrupt("return", result);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getTable.apply(this, arguments);
}

function getTokenInfo(_x3, _x4) {
  return _getTokenInfo.apply(this, arguments);
}

function _getTokenInfo() {
  _getTokenInfo = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(symbol, nftId) {
    var code, query, response;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            code = _config.CONTRACT_ACCOUNT;
            query = {
              "code": code,
              "scope": symbol,
              "table": "token",
              "lower_bound": nftId,
              "upper_bound": nftId,
              "limit": 1
            };
            _context2.next = 4;
            return getTable(this.network, query);

          case 4:
            response = _context2.sent;

            if (!(response.rows.length === 1)) {
              _context2.next = 9;
              break;
            }

            return _context2.abrupt("return", response.rows[0]);

          case 9:
            console.error("Token with Symbol and Id is not found.");
            return _context2.abrupt("return", null);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _getTokenInfo.apply(this, arguments);
}