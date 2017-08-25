"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLocale = createLocale;

var _utils = require("./utils");

var _fs = require("fs");

var _path = require("path");

var _jscodeshift = require("jscodeshift");

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createLocale(payload) {
  var filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  (0, _assert2.default)(filePath, 'api/locale/create: locale/zh.js is out exists');
  var source = (0, _utils.readFile)(filePath);
  var root = (0, _jscodeshift2.default)(source);
  var all = root.find(_jscodeshift2.default.ExportDefaultDeclaration);
  var last = all.find(_jscodeshift2.default.Property).at(0);
  last.insertBefore(_jscodeshift2.default.property('init', _jscodeshift2.default.literal('index.menu.item.' + payload.pathDot), _jscodeshift2.default.literal(payload.namespace)));
  last.insertBefore(_jscodeshift2.default.property('init', _jscodeshift2.default.literal('index.' + payload.pathDot + '.entity'), _jscodeshift2.default.literal(payload.namespace)));
  (0, _utils.writeFile)(filePath, root.toSource());
}