"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMock = createMock;

var _utils = require("./utils");

var _fs = require("fs");

var _path = require("path");

var _jscodeshift = require("jscodeshift");

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createMock(payload) {
  var filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  var template = (0, _utils.getTemplate)('mock.create');
  var source = template(payload);
  var root = (0, _jscodeshift2.default)(source);
  (0, _utils.writeFile)(filePath, root.toSource());
}