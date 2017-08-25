'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _Collection = require('jscodeshift/dist/Collection');

var _Collection2 = _interopRequireDefault(_Collection);

var _lodash = require('lodash/once');

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _Helper = require('./Helper');

var _Helper2 = _interopRequireDefault(_Helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_Helper2.default.register();

var methods = {
  findRouters: function findRouters() {
    if (!this.hasModule('dva/router')) return _Collection2.default.fromPaths([], this);
    return this.find(_jscodeshift2.default.JSXElement, {
      openingElement: {
        name: {
          type: 'JSXIdentifier',
          name: 'Router'
        }
      }
    });
  },


  // TODO: support config router with JavaScript Object
  getRouterInfo: function getRouterInfo() {
    var routeByIds = {};
    var ROUTER_COMPONENTS = ['Router', 'Route', 'Redirect', 'IndexRedirect', 'IndexRoute'];

    function parse(node) {
      var parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var parentId = arguments[2];
      var parentDepth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;

      (0, _assert2.default)(node.type === 'JSXElement', 'getRouterTree: node should be JSXElement, but got ' + node.type);
      var name = node.openingElement.name.name;
      (0, _assert2.default)(ROUTER_COMPONENTS.indexOf(name) > -1, 'getRouterTree: component should be one of ' + ROUTER_COMPONENTS.join(', '));

      var ret = { type: name };
      ret.depth = parentDepth + 1;
      ret.attributes = (0, _jscodeshift2.default)(node.openingElement).find(_jscodeshift2.default.JSXAttribute).simpleMap(function (path) {
        var node = path.node;
        return {
          name: node.name.name,
          value: getAttributeValue(node.value)
        };
      }).reduce(function (memo, _ref) {
        var name = _ref.name,
            value = _ref.value;

        memo[name] = value;
        return memo;
      }, {});

      var path = ret.attributes.path;
      if (path) {
        ret.absolutePath = path.charAt(0) === '/' ? path : parentPath + '/' + path;
      }

      if (ret.absolutePath) {
        ret.id = ret.type + '-' + ret.absolutePath;
      } else if (parentId) {
        ret.id = ret.type + '-parentId_' + parentId;
      } else {
        ret.id = ret.type + '-root';
      }

      if (node.children) {
        ret.children = node.children.filter(function (node) {
          return node.type === 'JSXElement';
        }).map(function (node) {
          return parse(node, ret.attributes.path, ret.id, ret.depth);
        });
      }

      routeByIds[ret.id] = ret;

      return {
        id: ret.id,
        children: ret.children
      };
    }

    function getAttributeValue(node) {
      if (node.type === 'Literal') {
        return node.value;
      } else if (node.type === 'JSXExpressionContainer' && node.expression.type === 'Identifier') {
        // TODO: Identifier 时应该如何展现? Router 应该处理和 Component 之间的关系
        return node.expression.name;
      }
      throw new Error('getRouterTree: unsupported attribute type');
    }

    return this.simpleMap(function (path) {
      return {
        tree: parse(path.node),
        routeByIds: routeByIds
      };
    });
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