'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;

var _utils = require('./utils');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function create(payload) {
  (0, _assert2.default)(payload.componentName, 'api/components/create: payload should have componentName');
  var template = (0, _utils.getTemplate)('components.create');
  var source = template(payload);
  var filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  (0, _assert2.default)(!(0, _fs.existsSync)(filePath), 'api/components/create: file exists');
  (0, _utils.writeFile)(filePath, source);

  if (payload.css) {
    var cssFilePath = filePath;
    var en = (0, _path.extname)(filePath);
    if (en) {
      cssFilePath = filePath.slice(0, filePath.lastIndexOf(en));
    }
    cssFilePath = cssFilePath + '.css';
    (0, _utils.writeFile)(cssFilePath, '\r\n.normal {\r\n}\r\n');
  }
}