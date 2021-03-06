'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (type, payload) {
  // sourcePath 由 server 端额外提供
  (0, _assert2.default)(type, 'api: type should be defined');
  (0, _assert2.default)(payload.sourcePath, 'api: payload should have sourcePath');

  // project.loadAll 逻辑特殊
  if (type === 'project.loadAll') {
    return project.loadAll(payload);
  }

  (0, _assert2.default)(payload.filePath, 'api: payload should have filePath');

  var _type$split = type.split(TYPE_SEP),
      _type$split2 = _slicedToArray(_type$split, 2),
      cat = _type$split2[0],
      method = _type$split2[1];

  (0, _assert2.default)(cat && method, 'api: type should be cat.method, e.g. models.create');
  (0, _assert2.default)(apiMap[cat], 'api: cat ' + cat + ' not found');
  (0, _assert2.default)(apiMap[cat][method], 'api: method ' + method + ' of cat ' + cat + ' not found');

  // 更新物理文件
  var fn = apiMap[cat][method];
  fn(payload);

  // 返回新的 transform 结果
  var filePath = payload.filePath,
      sourcePath = payload.sourcePath;

  var absFilePath = (0, _path.join)(sourcePath, filePath);
  if ((0, _fs.existsSync)(absFilePath)) {
    var file = {
      source: (0, _fs.readFileSync)(absFilePath, 'utf-8'),
      path: filePath
    };
    return (0, _transform2.default)(file, { jscodeshift: _jscodeshift2.default });
  }
};

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fs = require('fs');

var _path = require('path');

var _transform = require('../transform');

var _transform2 = _interopRequireDefault(_transform);

var _models = require('./models');

var models = _interopRequireWildcard(_models);

var _router = require('./router');

var router = _interopRequireWildcard(_router);

var _menu = require('./menu');

var menu = _interopRequireWildcard(_menu);

var _mock = require('./mock');

var mock = _interopRequireWildcard(_mock);

var _locale = require('./locale');

var locale = _interopRequireWildcard(_locale);

var _project = require('./project');

var project = _interopRequireWildcard(_project);

var _entry = require('./entry');

var entry = _interopRequireWildcard(_entry);

var _components = require('./components');

var components = _interopRequireWildcard(_components);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TYPE_SEP = '.';
var apiMap = {
  models: models,
  router: router,
  menu: menu,
  mock: mock,
  locale: locale,
  project: project,
  entry: entry,
  components: components
};

module.exports = exports['default'];