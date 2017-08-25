

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.createRoute = createRoute;
exports.createIndexRoute = createIndexRoute;
exports.createRedirect = createRedirect;
exports.createIndexRedirect = createIndexRedirect;
exports.remove = remove;
exports.moveTo = moveTo;

const _utils = require('./utils');

const _fs = require('fs');

const _index = require('../utils/index');

const _path = require('path');

const _relative = require('relative');

const _relative2 = _interopRequireDefault(_relative);

const _assert = require('assert');

const _assert2 = _interopRequireDefault(_assert);

const _jscodeshift = require('jscodeshift');

const _jscodeshift2 = _interopRequireDefault(_jscodeshift);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let hasImport = false;

function findRouterNode(root) {
  return root.find(_jscodeshift2.default.JSXElement, {
    openingElement: {
      name: {
        name: 'Router',
      },
    },
  }).nodes()[0];
}

function findRouteById(root, id) {
  function find(node) {
    const parentPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    const parentId = arguments[2];

    const type = node.openingElement.name.name;
    const attributes = node.openingElement.attributes;
    let path = void 0;
    for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].name.name === 'path') {
        path = attributes[i].value.value;
      }
    }

    let absolutePath = void 0;
    if (path) {
      absolutePath = path.charAt(0) === '/' ? path : `${parentPath}/${path}`;
    }

    let currentId = void 0;
    if (absolutePath) {
      currentId = `${type}-${absolutePath}`;
    } else if (parentId) {
      currentId = `${type}-parentId_${parentId}`;
    } else {
      currentId = `${type}-root`;
    }

    // found!
    if (currentId === id) return node;

    let found = void 0;
    if (node.children) {
      const childElements = node.children.filter((node) => {
        return node.type === 'JSXElement';
      });
      for (let _i = 0; _i < childElements.length; _i++) {
        found = find(childElements[_i], path, currentId);
        if (found) break;
      }
    }
    return found;
  }

  return find(findRouterNode(root), id);
}

function findParentRoute(root, id) {
  if (!id) {
    return findRouterNode(root);
  } else {
    return findRouteById(root, id);
  }
}

function createElement(root, el) {
  const attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  const parentId = arguments[3];

  const parentRoute = findParentRoute(root, parentId);
  if (!parentRoute) {
    throw new Error('createRoute, no element find by parentId');
  }
  const jsxElement = _jscodeshift2.default.jsxElement(_jscodeshift2.default.jsxOpeningElement(_jscodeshift2.default.jsxIdentifier(el), attributes.map((attr) => {
    if (attr.isExpression) {
      return _jscodeshift2.default.jsxAttribute(_jscodeshift2.default.jsxIdentifier(attr.key), _jscodeshift2.default.jsxExpressionContainer(_jscodeshift2.default.identifier(attr.value)));
    } else {
      return _jscodeshift2.default.jsxAttribute(_jscodeshift2.default.jsxIdentifier(attr.key), _jscodeshift2.default.literal(attr.value));
    }
  }), true), null, []);
  const index = parentRoute.children.findIndex((node) => {
    return node.type === 'JSXElement' && node.openingElement.attributes.some((attr) => {
      return attr.name.name === 'path' && attr.value.value === '*';
    });
  });
  if (index >= 0) {
    parentRoute.children.splice(index, 0, jsxElement, _jscodeshift2.default.jsxText('\n'));
  } else {
    parentRoute.children.push(jsxElement);
    parentRoute.children.push(_jscodeshift2.default.jsxText('\n'));
  }
}

function __createRoute(payload, type) {
  let path = payload.path,
    _payload$component = payload.component,
    component = _payload$component === undefined ? {} : _payload$component,
    parentId = payload.parentId;

  const filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  const source = (0, _utils.readFile)(filePath);
  const root = (0, _jscodeshift2.default)(source);
  // const parentRoute = findParentRoute(root);
  const parentRoute = findParentRoute(root, parentId);
  if (!parentRoute) {
    throw new Error(`createRoute, no element find by parentId ${parentId}`);
  }

  // append Route
  const attributes = [];
  if (path) {
    attributes.push({ key: 'path', value: path });
  }
  if (component.componentName) {
    attributes.push({ key: 'component', value: component.componentName, isExpression: true });
  }
  createElement(root, type, attributes, parentId);

  if (!component.componentName) return (0, _utils.writeFile)(filePath, root.toSource());
  (0, _assert2.default)(component.filePath, 'api/router/create: payload.component should have filePath');

  // create & import component
  let relativePath = void 0;
  const componentFilePath = (0, _path.join)(payload.sourcePath, component.filePath);
  if ((0, _fs.existsSync)(componentFilePath)) {
    relativePath = (0, _relative2.default)(filePath, componentFilePath);
    if (relativePath.charAt(0) !== '.') {
      relativePath = `./${relativePath}`;
    }
    relativePath = relativePath.split(_path.sep).join('/'); // workaround for windows
    const temp = relativePath.split('.');
    temp.pop();
    relativePath = temp.join('.');
  }

  const imports = root.find(_jscodeshift2.default.ImportDeclaration);
  if (!hasImport) {
    hasImport = true;
    const lastImport = imports.at(imports.size() - 1);
    lastImport.insertAfter(_jscodeshift2.default.importDeclaration([_jscodeshift2.default.importDefaultSpecifier(_jscodeshift2.default.identifier(component.componentName))], _jscodeshift2.default.literal(relativePath)));
  }
  (0, _utils.writeFile)(filePath, root.toSource());
}

function createRoute(payload) {
  let path = payload.path,
    _payload$component2 = payload.component,
    component = _payload$component2 === undefined ? {} : _payload$component2,
    parentId = payload.parentId;

  (0, _assert2.default)(payload.path || payload.component && payload.component.componentName, 'api/router/createRoute: payload should at least have path or compnent');
  try {
    __createRoute(payload, 'Route');
  } catch (e) {
    if (e.message.includes('no element find by parentId')) {
      const parentPrefix = parentId.split('/').pop();
      const parentSuffix = payload.path;

      __createRoute({
        filePath: payload.filePath,
        sourcePath: payload.sourcePath,
        path: parentSuffix,
        parentId: 'Route-/',
        component: payload.component,
      }, 'Route');

    }
  }
}

function createIndexRoute(payload) {
  let _payload$component3 = payload.component,
    component = _payload$component3 === undefined ? {} : _payload$component3,
    parentId = payload.parentId;

  (0, _assert2.default)(payload.component && payload.component.componentName, 'api/router/createIndexRoute: payload should at have compnent');
  __createRoute(payload, 'IndexRoute');
}

function createRedirect(payload) {
  (0, _assert2.default)(payload.from && payload.to, 'api/router/createRedirect: payload should have from or to');
  const filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  const source = (0, _utils.readFile)(filePath);
  const root = (0, _jscodeshift2.default)(source);

  createElement(root, 'Redirect', [{ key: 'from', value: payload.from }, { key: 'to', value: payload.to }], payload.parentId);

  (0, _utils.writeFile)(filePath, root.toSource());
}

function createIndexRedirect(payload) {
  (0, _assert2.default)(payload.to, 'api/router/createIndexRedirect: payload should have to');
  const filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  const source = (0, _utils.readFile)(filePath);
  const root = (0, _jscodeshift2.default)(source);

  createElement(root, 'IndexRedirect', [{ key: 'to', value: payload.to }], payload.parentId);

  (0, _utils.writeFile)(filePath, root.toSource());
}

function remove(payload) {
  (0, _assert2.default)(payload.id, 'api/router/remove: payload should have id');
  const filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  const source = (0, _utils.readFile)(filePath);
  const root = (0, _jscodeshift2.default)(source);
  const route = findRouteById(root, payload.id);
  if (!route) {
    throw new Error(`api/router/remove: didn't find route by id: ${id}`);
  }

  // don't know why j(route).remove dosen't work
  // here use a workaround, find it again and then remove it.
  // TODO: need to remove the empty line left behind
  root.find(_jscodeshift2.default.JSXElement, {
    start: route.start,
    end: route.end,
  }).at(0).remove();

  (0, _utils.writeFile)(filePath, root.toSource());
}

function moveTo(payload) {
  (0, _assert2.default)(payload.id, 'api/router/moveTo: payload should have id & parentId');
  const filePath = (0, _path.join)(payload.sourcePath, payload.filePath);
  const source = (0, _utils.readFile)(filePath);
  const root = (0, _jscodeshift2.default)(source);
  const route = findRouteById(root, payload.id);
  if (!route) {
    throw new Error(`api/router/moveTo: didn't find route by id: ${payload.id}`);
  }

  let parentRoute = void 0;
  if (payload.parentId) {
    parentRoute = findRouteById(root, payload.parentId);
    if (!parentRoute) {
      throw new Error(`api/router/moveTo: didn't find parent route by id: ${payload.parentId}`);
    }
  } else {
    parentRoute = findRouterNode(root);
  }

  root.find(_jscodeshift2.default.JSXElement, {
    start: route.start,
    end: route.end,
  }).at(0).remove();

  if (parentRoute.openingElement.selfClosing) {
    parentRoute.openingElement.selfClosing = false;
    parentRoute.closingElement = _jscodeshift2.default.jsxClosingElement(_jscodeshift2.default.jsxIdentifier(parentRoute.openingElement.name.name));
  }

  if (parentRoute.children.length === 0) {
    parentRoute.children.push(_jscodeshift2.default.jsxText('\n'));
  }
  parentRoute.children.push(route);
  parentRoute.children.push(_jscodeshift2.default.jsxText('\n'));

  (0, _utils.writeFile)(filePath, root.toSource());
}
