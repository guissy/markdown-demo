'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jscodeshift = require('jscodeshift');

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

var _lodash = require('lodash/once');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var methods = {
  simpleMap: function simpleMap(callback) {
    var result = [];
    this.forEach(function (path) {
      result.push(callback.apply(path, arguments));
    });
    return result;
  },
  hasModule: function hasModule(module) {
    return this.find(_jscodeshift2.default.ImportDeclaration, function (node) {
      return node.source.value === module;
    }).size() > 0 || this.findVariableDeclarators().filter(_jscodeshift2.default.filters.VariableDeclarator.requiresModule(module)).size() > 0;
  },
  hasReactModule: function hasReactModule() {
    return this.hasModule('react') || this.hasModule('react-native') || this.hasModule('react/addon');
  },


  // Not used yet
  getDeclarators: function getDeclarators(nameGetter) {
    return this.map(function (path) {
      /*jshint curly:false*/
      var scope = path.scope;
      if (!scope) return;
      var name = nameGetter.apply(path, arguments);
      if (!name) return;
      scope = scope.lookup(name);
      if (!scope) return;
      var bindings = scope.getBindings()[name];
      if (!bindings) return;
      var decl = Collection.fromPaths(bindings).closest(types.VariableDeclarator);
      if (decl.length === 1) {
        return decl.paths()[0];
      }
    }, types.VariableDeclarator);
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