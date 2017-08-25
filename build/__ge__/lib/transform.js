'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = transform;
exports.normalizeResult = normalizeResult;

var _lodash = require('lodash/uniq');

var _lodash2 = _interopRequireDefault(_lodash);

var _RouteComponent = require('./collections/RouteComponent');

var _RouteComponent2 = _interopRequireDefault(_RouteComponent);

var _Model = require('./collections/Model');

var _Model2 = _interopRequireDefault(_Model);

var _Router = require('./collections/Router');

var _Router2 = _interopRequireDefault(_Router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ID_SEP = '^^';

function transform(file, api) {
  var j = api.jscodeshift;
  _RouteComponent2.default.register(j);
  _Model2.default.register(j);
  _Router2.default.register(j);

  var root = j(file.source);

  var ret = {
    models: root.findModels().getModelInfo(),
    router: root.findRouters().getRouterInfo(),
    routeComponents: root.findRouteComponents().getRouteComponentInfo(root)
  };

  // Only one router.
  if (ret.router && ret.router.length) {
    ret.router = ret.router[0];
  } else {
    ret.router = null;
  }

  return normalizeResult(ret, file.path);
};

function normalizeResult(obj, filePath) {
  var dispatches = {};

  function addDispatch(names, _ref) {
    var newInput = _ref.input,
        newOutput = _ref.output;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var name = _step.value;

        var dispatch = dispatches[name] || {};
        var input = dispatch.input || [];
        var output = dispatch.output || [];
        dispatches[name] = {
          input: (0, _lodash2.default)(input.concat(newInput || [])),
          output: (0, _lodash2.default)(output.concat(newOutput || []))
        };
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  if (obj.routeComponents) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = obj.routeComponents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var rc = _step2.value;

        rc.filePath = filePath;
        rc.id = 'RouteComponent' + ID_SEP + filePath + ID_SEP + rc.name;
        addDispatch(rc.dispatches, { input: [rc.id] });
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  if (obj.models) {
    (function () {
      var reducerByIds = {};
      var effectByIds = {};
      var subscriptionByIds = {};

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        var _loop = function _loop() {
          var model = _step3.value;

          var reducerNames = model.reducers.map(function (item) {
            return item.name;
          });
          var effectNames = model.effects.map(function (item) {
            return item.name;
          });
          var actionMap = reducerNames.concat(effectNames).reduce(function (memo, key) {
            memo[key] = true;
            return memo;
          }, {});

          var namespace = model.namespace;
          model.id = 'Model' + ID_SEP + filePath + ID_SEP + model.namespace;
          model.filePath = filePath;

          model.reducers = model.reducers.map(function (reducer) {
            var id = 'Reducer' + ID_SEP + filePath + ID_SEP + reducer.name;
            addDispatch([namespace + '/' + reducer.name], { output: [id] });
            reducerByIds[id] = _extends({}, reducer, { id: id, filePath: filePath, modelId: model.id });
            return id;
          });
          model.effects = model.effects.map(function (effect) {
            var id = 'Effect' + ID_SEP + filePath + ID_SEP + effect.name;
            addDispatch([namespace + '/' + effect.name], { output: [id] });
            var dispatches = effect.dispatches.map(function (name) {
              var newName = actionMap[name] ? model.namespace + '/' + name : name;
              addDispatch([newName], { input: [id] });
              return newName;
            });
            effectByIds[id] = _extends({}, effect, { id: id, filePath: filePath, dispatches: dispatches, modelId: model.id });
            return id;
          });
          model.subscriptions = model.subscriptions.map(function (subscription) {
            var id = 'Subscription' + ID_SEP + filePath + ID_SEP + subscription.name;
            var dispatches = subscription.dispatches.map(function (name) {
              var newName = actionMap[name] ? model.namespace + '/' + name : name;
              addDispatch([newName], { input: [id] });
              return newName;
            });
            subscriptionByIds[id] = _extends({}, subscription, { id: id, filePath: filePath, dispatches: dispatches, modelId: model.id });
            return id;
          });
        };

        for (var _iterator3 = obj.models[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      obj.models = {
        data: obj.models,
        reducerByIds: reducerByIds,
        effectByIds: effectByIds,
        subscriptionByIds: subscriptionByIds
      };
    })();
  }

  if (obj.router) {
    obj.router.filePath = filePath;
  }

  obj.dispatches = dispatches;

  return obj;
}