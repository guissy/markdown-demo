'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getExpression = getExpression;
exports.getObjectProperty = getObjectProperty;
exports.getMemberProperty = getMemberProperty;
exports.getPropertyValue = getPropertyValue;
exports.recursiveParse = recursiveParse;

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getExpression(source) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var noParenthesis = opts.noParenthesis;

  var program = (0, _jscodeshift2.default)(noParenthesis ? source : '(' + source + ')').find(_jscodeshift2.default.Program).get();
  var node = program.node.body[0];
  return node.expression;
}

function getObjectProperty(node, key) {
  (0, _assert2.default)(node.type === 'ObjectExpression', '(utils)getObjectProperty: node is not an Object');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = node.properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var prop = _step.value;

      if (prop.key.name === key) {
        return prop.value;
      }
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

  return null;
}

function getMemberProperty(node) {
  return getPropertyValue(node.property);
}

function getPropertyValue(node) {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'Identifier':
      return node.name;
    default:
      throw new Error('(utils)getPropertyValue: unsupported property type');
  }
}

function recursiveParse(node) {
  if (node.type === 'ObjectExpression') {
    return node.properties.reduce(function (obj, property) {
      return _extends({}, obj, recursiveParse(property));
    }, {});
  }
  if (node.type === 'Property') {
    var propsName = void 0;
    if (node.key.type === 'Identifier') {
      propsName = node.key.name;
    }
    if (node.key.type === 'Literal') {
      propsName = node.key.value;
    }
    return _defineProperty({}, propsName, recursiveParse(node.value));
  }
  if (node.type === 'Literal') {
    return node.value;
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.map(recursiveParse);
  }
  if (node.type === 'FunctionExpression') {
    return node;
  }
  return null;
}