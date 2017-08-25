"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMenu = createMenu;
exports.moveTo = moveTo;

var _utils = require("./utils");

var _fs = require("fs");

var _path2 = require("path");

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _jscodeshift = require("jscodeshift");

var _jscodeshift2 = _interopRequireDefault(_jscodeshift);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findMenurNode(root) {
  return root.find(_jscodeshift2.default.JSXElement, {
    openingElement: {
      name: {
        name: 'Menu'
      }
    }
  }).nodes()[0];
}

function findMenuById(root, id) {
  function find(node) {
    var parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var parentId = arguments[2];

    var type = node.openingElement.name.name;
    var attributes = node.openingElement.attributes;
    var path = void 0;
    for (var i = 0; i < attributes.length; i++) {
      if (attributes[i].name.name === 'key') {
        path = attributes[i].value.value;
      }
    }

    var absolutePath = void 0;
    if (path) {
      absolutePath = path.charAt(0) === '/' ? path : parentPath + "/" + path;
    }

    var currentId = void 0;
    if (absolutePath) {
      currentId = type + "-" + absolutePath;
    } else if (parentId) {
      currentId = type + "-parentId_" + parentId;
    } else {
      currentId = type + "-root";
    }

    // found!
    // console.log(currentId);
    if (currentId === id) return node;

    var found = void 0;
    if (node.children) {
      var childElements = node.children.filter(function (node) {
        return node.type === 'JSXElement';
      });
      for (var _i = 0; _i < childElements.length; _i++) {
        found = find(childElements[_i], path, currentId);
        if (found) break;
      }
    }
    return found;
  }

  return find(findMenurNode(root), id);
}

function findParentMenu(root, id) {
  if (!id) {
    return findMenurNode(root);
  } else {
    return findMenuById(root, id);
  }
}
function createJsxElement(el) {
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var child = arguments[2];

  return _jscodeshift2.default.jsxElement(_jscodeshift2.default.jsxOpeningElement(_jscodeshift2.default.jsxIdentifier(el), attributes.map(function (attr) {
    if (attr.isExpression) {
      return _jscodeshift2.default.jsxAttribute(_jscodeshift2.default.jsxIdentifier(attr.key), _jscodeshift2.default.jsxExpressionContainer(typeof attr.value === 'string' ? _jscodeshift2.default.identifier(attr.value) : attr.value));
    } else {
      return _jscodeshift2.default.jsxAttribute(_jscodeshift2.default.jsxIdentifier(attr.key), _jscodeshift2.default.literal(attr.value));
    }
  }), child.length === 0), child.length ? _jscodeshift2.default.jsxClosingElement(_jscodeshift2.default.jsxIdentifier(el)) : null, child);
}
function createElement(root, el) {
  var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var parentId = arguments[3];
  var child = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

  var parentMenu = findParentMenu(root, parentId);
  if (!parentMenu) {
    throw new Error('createMenu, no element find by parentId');
  }
  var jsxElement = createJsxElement(el, attributes, child);
  parentMenu.children.push(jsxElement);
  parentMenu.children.push(_jscodeshift2.default.jsxText('\n'));
}

function __createMenu(payload, type) {
  var path = payload.path,
      _payload$component = payload.component,
      component = _payload$component === undefined ? {} : _payload$component,
      parentId = payload.parentId;

  var filePath = (0, _path2.join)(payload.sourcePath, payload.filePath);
  var source = (0, _utils.readFile)(filePath);
  var root = (0, _jscodeshift2.default)(source);
  // const parentMenu = findParentMenu(root);
  var parentMenu = findParentMenu(root, parentId);
  if (!parentMenu) {
    throw new Error('createMenu, no element find by parentId');
  }

  // append Menu
  var attributes = [];
  if (path) {
    attributes.push({ key: 'key', value: path });
  }

  var icon = createJsxElement("Icon", [{ key: 'type', value: 'home' }], []);
  var label = createJsxElement('FormattedMessage', [{ key: 'id', value: 'index.menu.item.' + payload.pathDot }, { key: 'defaultMessage', value: payload.component.componentName }], []);
  var indexLink = createJsxElement("IndexLink", [{ key: 'to', value: '/index/' + payload.route }, { key: 'activeClassName', value: 'active' }], [_jscodeshift2.default.jsxText('\n'), icon, _jscodeshift2.default.jsxText('\n'), label, _jscodeshift2.default.jsxText('\n')]);
  createElement(root, type, attributes, parentId, [_jscodeshift2.default.jsxText('\n'), indexLink, _jscodeshift2.default.jsxText('\n')]);

  if (!component.componentName) return (0, _utils.writeFile)(filePath, root.toSource());
  (0, _assert2.default)(component.filePath, 'api/menu/create: payload.component should have filePath');

  (0, _utils.writeFile)(filePath, root.toSource());
}
function __createSubMenu(payload, type) {
  var path = payload.path,
      _payload$component2 = payload.component,
      component = _payload$component2 === undefined ? {} : _payload$component2,
      parentId = payload.parentId;

  var filePath = (0, _path2.join)(payload.sourcePath, payload.filePath);
  var source = (0, _utils.readFile)(filePath);
  var root = (0, _jscodeshift2.default)(source);
  // const parentMenu = findParentMenu(root);
  var parentMenu = findParentMenu(root, parentId);
  if (!parentMenu) {
    throw new Error('createSubMenu, no element find by parentId');
  }

  // <SubMenu key="user" title={<span><Icon type="user"/><span>
  //         <FormattedMessage id="index.menu.item.user" defaultMessage="Member" />
  //       </span></span>}>
  // </SubMenu>
  var icon = createJsxElement("Icon", [{ key: 'type', value: 'home' }], []);
  var label = createJsxElement('FormattedMessage', [{ key: 'id', value: 'index.menu.item.' + payload.pathDot }, { key: 'defaultMessage', value: payload.component.componentName }], []);
  var title = createJsxElement("span", [], [icon, _jscodeshift2.default.jsxText('\n'), label]);
  // append Menu
  var attributes = [];
  if (path) {
    attributes.push({ key: 'key', value: path });
    attributes.push({ key: 'title', value: title, isExpression: true });
  }
  // createElement(root, type, attributes, parentId, []);
  var jsxElement = createJsxElement(type, attributes, [_jscodeshift2.default.jsxText('\n')]);
  parentMenu.children.push(jsxElement);
  parentMenu.children.push(_jscodeshift2.default.jsxText('\n'));

  if (!component.componentName) return (0, _utils.writeFile)(filePath, root.toSource());
  (0, _assert2.default)(component.filePath, 'api/menu/create: payload.component should have filePath');

  (0, _utils.writeFile)(filePath, root.toSource());
}

function createMenu(payload) {
  var path = payload.path,
      _payload$component3 = payload.component,
      component = _payload$component3 === undefined ? {} : _payload$component3,
      parentId = payload.parentId;

  (0, _assert2.default)(payload.path || payload.component && payload.component.componentName, 'api/menu/createMenu: payload should at least have path or compnent');
  try {
    __createMenu(payload, 'Menu.Item');
  } catch (e) {
    if (e.message.includes('no element find by parentId')) {
      var _parentId = payload.parentId;
      var _path = payload.path;
      payload.parentId = '';
      payload.path = payload.route.split('/').shift();
      __createSubMenu(payload, 'SubMenu');
      payload.parentId = _parentId;
      payload.path = _path;
      __createMenu(payload, 'Menu.Item');
    }
  }
}

function moveTo(payload) {
  (0, _assert2.default)(payload.id, 'api/menu/moveTo: payload should have id & parentId');
  var filePath = (0, _path2.join)(payload.sourcePath, payload.filePath);
  var source = (0, _utils.readFile)(filePath);
  var root = (0, _jscodeshift2.default)(source);
  var menu = findRouteById(root, payload.id);
  if (!menu) {
    throw new Error("api/menu/moveTo: didn't find menu by id: " + id);
  }

  var parentRoute = void 0;
  if (payload.parentId) {
    parentRoute = findRouteById(root, payload.parentId);
    if (!parentRoute) {
      throw new Error("api/menu/moveTo: didn't find parent menu by id: " + parentId);
    }
  } else {
    parentRoute = findRouterNode(root);
  }

  root.find(_jscodeshift2.default.JSXElement, {
    start: menu.start,
    end: menu.end
  }).at(0).remove();

  if (parentRoute.openingElement.selfClosing) {
    parentRoute.openingElement.selfClosing = false;
    parentRoute.closingElement = _jscodeshift2.default.jsxClosingElement(_jscodeshift2.default.jsxIdentifier(parentRoute.openingElement.name.name));
  }

  if (parentRoute.children.length === 0) {
    parentRoute.children.push(_jscodeshift2.default.jsxText('\n'));
  }
  parentRoute.children.push(menu);
  parentRoute.children.push(_jscodeshift2.default.jsxText('\n'));

  (0, _utils.writeFile)(filePath, root.toSource());
}