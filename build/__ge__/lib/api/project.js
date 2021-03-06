'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadAll = loadAll;
exports.loadOne = loadOne;

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _path = require('path');

var _glob = require('glob');

var _fs = require('fs');

var _transform = require('../transform');

var _transform2 = _interopRequireDefault(_transform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadAll(_ref) {
  var sourcePath = _ref.sourcePath;

  var files = (0, _glob.sync)('**/*.js?(x)', {
    cwd: sourcePath,
    dot: false,
    ignore: ['node_modules/**']
  });

  return files.reduce(function (memo, path) {
    var source = (0, _fs.readFileSync)((0, _path.join)(sourcePath, path), 'utf-8');
    var info = (0, _transform2.default)({ path: path, source: source }, { jscodeshift: _jscodeshift2.default });
    memo[path] = info;
    return memo;
  }, {});
}

function loadOne(_ref2) {
  // 不需要做任何事

  var sourcePath = _ref2.sourcePath,
      filepath = _ref2.filepath;
}