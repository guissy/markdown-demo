'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.remove = remove;
exports.updateNamespace = updateNamespace;
exports.updateState = updateState;
exports.addReducer = addReducer;
exports.addEffect = addEffect;
exports.addSubscription = addSubscription;
exports.updateReducer = updateReducer;
exports.updateEffect = updateEffect;
exports.updateSubscription = updateSubscription;
exports.removeReducer = removeReducer;
exports.removeEffect = removeEffect;
exports.removeSubscription = removeSubscription;

var _utils = require('./utils');

var _fs = require('fs');

var _path = require('path');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _entry = require('./entry');

var _Model = require('../collections/Model');

var _Model2 = _interopRequireDefault(_Model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

_Model2.default.register();

function create(payload) {
  (0, _assert2.default)(payload.namespace, 'api/models/create: payload should have namespace');
  var template = (0, _utils.getTemplate)('models.create');
  var source = template(payload);
  var filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  (0, _assert2.default)(!(0, _fs.existsSync)(filePath), 'api/models/create: file exists');
  (0, _utils.writeFile)(filePath, source);

  // Add model to entry
  if (payload.entry && payload.modelPath) {
    (0, _entry.addModel)({
      sourcePath: payload.sourcePath,
      filePath: payload.entry,
      modelPath: payload.modelPath
    });
  }
}

function remove(payload) {
  var filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  (0, _utils.removeFile)(filePath);
}

function updateNamespace(payload) {
  _action('updateNamespace', payload, ['newNamespace']);
}

function updateState(payload) {
  _action('updateState', payload, ['source']);
}

function addReducer(payload) {
  _action('addReducer', payload, ['name', 'source'], ['source']);
}

function addEffect(payload) {
  _action('addEffect', payload, ['name', 'source'], ['source']);
}

function addSubscription(payload) {
  _action('addSubscription', payload, ['name', 'source'], ['source']);
}

function updateReducer(payload) {
  _action('updateReducer', payload, ['name', 'source']);
}

function updateEffect(payload) {
  _action('updateEffect', payload, ['name', 'source']);
}

function updateSubscription(payload) {
  _action('updateSubscription', payload, ['name', 'source']);
}

function removeReducer(payload) {
  _action('removeReducer', payload, ['name']);
}

function removeEffect(payload) {
  _action('removeEffect', payload, ['name']);
}

function removeSubscription(payload) {
  _action('removeSubscription', payload, ['name']);
}

/**
 * private
 */
function _action(type, payload, checklist) {
  var optional = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  var _arr = ['namespace'].concat(_toConsumableArray(checklist));

  for (var _i = 0; _i < _arr.length; _i++) {
    var checkitem = _arr[_i];
    if (optional.indexOf(checkitem) === -1) {
      (0, _assert2.default)(payload[checkitem], 'api/models/' + type + ': payload should have ' + checkitem);
    }
  }

  var filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  var source = (0, _utils.readFile)(filePath);
  var root = (0, _jscodeshift2.default)(source);
  var models = root.findModels(payload.namespace);
  var args = checklist.map(function (checkitem) {
    return payload[checkitem];
  });
  models[type].apply(models, args);
  (0, _utils.writeFile)(filePath, root.toSource());
}