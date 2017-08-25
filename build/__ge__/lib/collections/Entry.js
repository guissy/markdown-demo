'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _lodash = require('lodash/once');

var _lodash2 = _interopRequireDefault(_lodash);

var _Collection = require('jscodeshift/dist/Collection');

var _Collection2 = _interopRequireDefault(_Collection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getImportRequirePath(identifierName, path) {
  var scope = path.scope.lookup(identifierName);
  if (scope) {
    var importPath = scope.getBindings()[identifierName][0].parent.parent;
    var importNode = importPath.value;
    if (_jscodeshift2.default.ImportDeclaration.check(importNode)) {
      return importNode.source.value;
    }
  }
}

function isDvaInstance(identifierName, path) {
  var scope = path.scope.lookup(identifierName);
  if (scope) {
    var declaratorPath = scope.getBindings()[identifierName][0].parent;
    var declaratorNode = declaratorPath.value;
    if (_jscodeshift2.default.VariableDeclarator.check(declaratorNode)) {
      var init = declaratorNode.init;

      if (_jscodeshift2.default.CallExpression.check(init) && _jscodeshift2.default.Identifier.check(init.callee)) {
        return getImportRequirePath(init.callee.name, path) === 'dva';
      }
    }
  }
}

var methods = {
  findModelInjectPoints: function findModelInjectPoints() {
    var pathes = [];
    this.find(_jscodeshift2.default.CallExpression).forEach(function (path) {
      var node = path.value;
      if (_jscodeshift2.default.MemberExpression.check(node.callee)) {
        var _node$callee = node.callee,
            object = _node$callee.object,
            property = _node$callee.property;

        if (['model', 'router'].indexOf(property.name) > -1 && isDvaInstance(object.name, path)) {
          pathes.push(path);
        }
      }
    });
    return _Collection2.default.fromPaths(pathes, this);
  },
  addModel: function addModel(modelPath) {
    var points = this.findModelInjectPoints();
    if (points.size() === 0) return;

    points.forEach(function (path) {
      var node = path.value;
      var r = node.arguments[0];
      if (_jscodeshift2.default.CallExpression.check(r) && _jscodeshift2.default.Identifier.check(r.callee) && r.callee.name === 'require' && r.arguments && r.arguments.length === 1 && _jscodeshift2.default.Literal.check(r.arguments[0]) && r.arguments[0].value === modelPath) {
        throw new Error('addModel: model ' + modelPath + ' exists');
      }
    });

    var _points$get$value$cal = points.get().value.callee,
        object = _points$get$value$cal.object,
        property = _points$get$value$cal.property;

    var insertMethod = property.name === 'model' ? 'insertAfter' : 'insertBefore';

    var collection = points
    // get parent statement
    .map(function (path) {
      return path.parent;
    }).at(0);

    collection[insertMethod].call(collection, _jscodeshift2.default.expressionStatement(_jscodeshift2.default.callExpression(_jscodeshift2.default.memberExpression(object, _jscodeshift2.default.identifier('model')), [_jscodeshift2.default.callExpression(_jscodeshift2.default.identifier('require'), [_jscodeshift2.default.literal(modelPath)])])));
  }
};

function register() {
  var jscodeshift = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _jscodeshift2.default;

  jscodeshift.registerMethods(methods);
}

exports.default = {
  register: (0, _lodash2.default)(register)
};
module.exports = exports['default'];