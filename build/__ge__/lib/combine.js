'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = combine;

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _path = require('path');

var _glob = require('glob');

var _fs = require('fs');

var _transform = require('./transform');

var _transform2 = _interopRequireDefault(_transform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
//import Runner from 'jscodeshift/dist/Runner';


function combine(infos) {
  return Object.keys(infos).reduce(function (memo, filePath) {
    return merge(memo, infos[filePath]);
  }, {});
}

function merge(oldInfo, newInfo) {
  return {
    models: combineModels(oldInfo.models, newInfo.models),
    router: combineRouter(oldInfo.router, newInfo.router),
    dispatches: combineDispatches(oldInfo.dispatches, newInfo.dispatches),
    routeComponents: combineRouteComponents(oldInfo.routeComponents, newInfo.routeComponents)
  };
}

function combineModels(oldModels, newModels) {
  if (!oldModels) return newModels;
  return {
    data: [].concat(_toConsumableArray(oldModels.data), _toConsumableArray(newModels.data)),
    reducerByIds: _extends({}, oldModels.reducerByIds, newModels.reducerByIds),
    effectByIds: _extends({}, oldModels.effectByIds, newModels.effectByIds),
    subscriptionByIds: _extends({}, oldModels.subscriptionByIds, newModels.subscriptionByIds)
  };
}

function combineRouter(oldRouter, newRouter) {
  return oldRouter || newRouter;
}

function combineDispatches(oldDispatches, newDispatches) {
  var ret = _extends({}, oldDispatches);
  for (var key in newDispatches) {
    if (newDispatches.hasOwnProperty(key)) {
      if (!ret[key]) {
        ret[key] = newDispatches[key];
      } else {
        ret[key] = {
          input: [].concat(_toConsumableArray(ret[key].input), _toConsumableArray(newDispatches[key].input)),
          output: [].concat(_toConsumableArray(ret[key].output), _toConsumableArray(newDispatches[key].output))
        };
      }
    }
  }
  return ret;
}

function combineRouteComponents() {
  var oldRC = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var newRC = arguments[1];

  return [].concat(_toConsumableArray(oldRC), _toConsumableArray(newRC));
}
module.exports = exports['default'];