'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.define-property");

require("regenerator-runtime/runtime");

var _eosjsEcc = _interopRequireDefault(require("eosjs-ecc"));

var _config = require("./config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PCSServer =
/*#__PURE__*/
function () {
  function PCSServer() {
    _classCallCheck(this, PCSServer);
  }

  _createClass(PCSServer, null, [{
    key: "checkByPCSSecurity",
    value: function () {
      var _checkByPCSSecurity = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(symbol, tokenId, sig, message) {
        var apiUrl, payload, req, res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                apiUrl = _config.AWS_SECURITY_API_URL + "/pcssecurity";
                payload = {
                  "name": "checkSig",
                  "symbol": symbol,
                  "tokenId": tokenId,
                  "contract": _config.CONTRACT_ACCOUNT,
                  "sig": sig,
                  "message": message
                };
                req = {
                  method: "POST",
                  mode: "cors",
                  cache: "no-cache",
                  headers: {
                    "Content-Type": "application/json; charset=utf-8"
                  },
                  body: JSON.stringify(payload)
                };
                _context.next = 5;
                return fetch(apiUrl, req);

              case 5:
                _context.next = 7;
                return _context.sent.json();

              case 7:
                res = _context.sent;
                return _context.abrupt("return", res);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function checkByPCSSecurity(_x, _x2, _x3, _x4) {
        return _checkByPCSSecurity.apply(this, arguments);
      }

      return checkByPCSSecurity;
    }()
  }, {
    key: "requestSignTx",
    value: function () {
      var _requestSignTx = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(query) {
        var apiUrl, options, response, data, signedTx;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                apiUrl = _config.AWS_SECURITY_API_URL + "/eosagent";
                options = {
                  method: "POST",
                  body: JSON.stringify(query)
                };
                _context2.next = 4;
                return fetch(apiUrl, options);

              case 4:
                response = _context2.sent;
                _context2.next = 7;
                return response.json();

              case 7:
                data = _context2.sent;

                if (!data.errorMessage) {
                  _context2.next = 11;
                  break;
                }

                console.error(JSON.parse(data.errorMessage));
                throw new Error("the request to ".concat(url, " is failed"));

              case 11:
                _context2.prev = 11;
                signedTx = data.signedTransaction.transaction;
                return _context2.abrupt("return", signedTx);

              case 16:
                _context2.prev = 16;
                _context2.t0 = _context2["catch"](11);
                console.error(_context2.t0);

              case 19:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[11, 16]]);
      }));

      function requestSignTx(_x5) {
        return _requestSignTx.apply(this, arguments);
      }

      return requestSignTx;
    }()
  }, {
    key: "genSalt",
    value: function () {
      var _genSalt = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(password, symbol, nftId) {
        var seedHash, apiUrl, response, salt;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                seedHash = _eosjsEcc.default.sha256(password);
                apiUrl = _config.NEW_AWS_API_URL + "?tokenId=".concat(nftId, "&hash=").concat(seedHash, "&symbol=").concat(symbol);
                _context3.next = 4;
                return fetch(apiUrl, {
                  method: "GET",
                  mode: "cors"
                });

              case 4:
                _context3.next = 6;
                return _context3.sent.json();

              case 6:
                response = _context3.sent;
                salt = response.body;
                return _context3.abrupt("return", salt);

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function genSalt(_x6, _x7, _x8) {
        return _genSalt.apply(this, arguments);
      }

      return genSalt;
    }()
  }]);

  return PCSServer;
}();

exports.default = PCSServer;