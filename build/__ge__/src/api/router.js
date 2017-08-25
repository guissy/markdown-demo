import {
  getTemplate,
  writeFile,
  readFile,
  removeFile,
} from './utils';
import { existsSync } from 'fs';
import { getExpression } from '../utils/index';
import { join, sep } from 'path';
import relative from 'relative';
import assert from 'assert';
import j from 'jscodeshift';

let hasImport = false;

function findRouterNode(root) {
  return root.find(
    j.JSXElement, {
      openingElement: {
        name: {
          name: 'Router'
        }
      }
    }
  ).nodes()[0];
}

function findRouteById(root, id) {
  function find(node, parentPath = '', parentId) {
    const type = node.openingElement.name.name;
    const attributes = node.openingElement.attributes;
    let path;
    for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].name.name === 'path') {
        path = attributes[i].value.value;
      }
    }

    let absolutePath;
    if (path) {
      absolutePath = path.charAt(0) === '/' ? path : `${parentPath}/${path}`;
    }

    let currentId;
    if (absolutePath) {
      currentId = `${type}-${absolutePath}`;
    } else if (parentId) {
      currentId = `${type}-parentId_${parentId}`;
    } else {
      currentId = `${type}-root`;
    }

    // found!
    if (currentId === id) return node;

    let found;
    if (node.children) {
      const childElements = node.children.filter(node => node.type === 'JSXElement');
      for (let i = 0; i < childElements.length; i++) {
        found = find(childElements[i], path, currentId);
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

function createElement(root, el, attributes = [], parentId) {
  const parentRoute = findParentRoute(root, parentId);
  if (!parentRoute) {
    throw new Error('createRoute, no element find by parentId');
  }
  const jsxElement = j.jsxElement(
    j.jsxOpeningElement(
      j.jsxIdentifier(el),
      attributes.map(attr => {
        if (attr.isExpression) {
          return j.jsxAttribute(
            j.jsxIdentifier(attr.key),
            j.jsxExpressionContainer(
              j.identifier(attr.value)
            )
          )
        } else {
          return j.jsxAttribute(
            j.jsxIdentifier(attr.key),
            j.literal(attr.value)
          );
        }
      }),
      true
    ),
    null,
    [],
  );
  const index = parentRoute.children
    .findIndex(node=>
      node.type==='JSXElement' &&
      node.openingElement.attributes.some(attr=>
      attr.name.name==='path' && attr.value.value==='*')
    );
  if (index>=0) {
    parentRoute.children.splice(index, 0, jsxElement, j.jsxText('\n'));
  } else {
    parentRoute.children.push(jsxElement);
    parentRoute.children.push(j.jsxText('\n'));
  }

}

function __createRoute(payload, type) {
  const { path, component = {}, parentId } = payload;
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  // const parentRoute = findParentRoute(root);
  const parentRoute = findParentRoute(root, parentId);
  if (!parentRoute) {
    throw new Error('createRoute, no element find by parentId');
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

  if (!component.componentName) return writeFile(filePath, root.toSource());
  assert(
    component.filePath,
    'api/router/create: payload.component should have filePath'
  );

  // create & import component
  let relativePath;
  const componentFilePath = join(payload.sourcePath, component.filePath);
  if (existsSync(componentFilePath)) {
    relativePath = relative(filePath, componentFilePath);
    if (relativePath.charAt(0) !== '.') {
      relativePath = './' + relativePath;
    }
    relativePath = relativePath.split(sep).join('/');  // workaround for windows
  }

  const imports = root.find(j.ImportDeclaration);
  if (!hasImport) {
    hasImport = true;
    const lastImport = imports.at(imports.size() - 1);
    lastImport.insertAfter(
      j.importDeclaration(
        [j.importDefaultSpecifier(
          j.identifier(component.componentName)
        )],
        j.literal(relativePath)
      )
    );
  }
  writeFile(filePath, root.toSource());
}

export function createRoute(payload) {
  const { path, component = {}, parentId } = payload;
  assert(
    payload.path || (payload.component && payload.component.componentName),
    'api/router/createRoute: payload should at least have path or compnent'
  );
  try {
    __createRoute(payload, 'Route');
  } catch(e) {
    if (e.message.includes('no element find by parentId')) {
      const parentPrefix = parentId.split('/').pop();
      const parentSuffix = payload.path;
      __createRoute({
        filePath: payload.filePath,
        sourcePath: payload.sourcePath,
        path: parentPrefix,
        parentId: 'Route-//index',
      }, 'Route');
      createIndexRoute({
        filePath: payload.filePath,
        sourcePath: payload.sourcePath,
        parentId: 'Route-//index',
        component: payload.component
      });
      __createRoute({
        filePath: payload.filePath,
        sourcePath: payload.sourcePath,
        path: parentSuffix,
        parentId: 'Route-//index',
        component: payload.component
      }, 'Route');
      moveTo({
        filePath: payload.filePath,
        sourcePath: payload.sourcePath,
        id: 'IndexRoute-parentId_Route-//index',
        parentId: 'Route-index/'+parentPrefix
      });
      moveTo({
        filePath: payload.filePath,
        sourcePath: payload.sourcePath,
        id: 'Route-index/'+parentSuffix,
        parentId: 'Route-index/'+parentPrefix
      });
    }
  }
}

export function createIndexRoute(payload) {
  const { component = {}, parentId } = payload;
  assert(
    payload.component && payload.component.componentName,
    'api/router/createIndexRoute: payload should at have compnent'
  );
  __createRoute(payload, 'IndexRoute');
}

export function createRedirect(payload) {
  assert(
    payload.from && payload.to,
    'api/router/createRedirect: payload should have from or to'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);

  createElement(
    root,
    'Redirect',
    [
      { key: 'from', value: payload.from },
      { key: 'to', value: payload.to },
    ],
    payload.parentId
  );

  writeFile(filePath, root.toSource());
}

export function createIndexRedirect(payload) {
  assert(
    payload.to,
    'api/router/createIndexRedirect: payload should have to'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);

  createElement(
    root,
    'IndexRedirect',
    [
      { key: 'to', value: payload.to },
    ],
    payload.parentId
  );

  writeFile(filePath, root.toSource());
}

export function remove(payload) {
  assert(
    payload.id,
    'api/router/remove: payload should have id'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  const route = findRouteById(root, payload.id);
  if (!route) {
    throw new Error(`api/router/remove: didn\'t find route by id: ${id}`);
  }

  // don't know why j(route).remove dosen't work
  // here use a workaround, find it again and then remove it.
  // TODO: need to remove the empty line left behind
  root.find(j.JSXElement, {
    start: route.start,
    end: route.end,
  }).at(0).remove();

  writeFile(filePath, root.toSource());
}

export function moveTo(payload) {
  assert(
    payload.id,
    'api/router/moveTo: payload should have id & parentId'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  const route = findRouteById(root, payload.id);
  if (!route) {
    throw new Error(`api/router/moveTo: didn\'t find route by id: ${id}`);
  }

  let parentRoute;
  if (payload.parentId) {
    parentRoute = findRouteById(root, payload.parentId);
    if (!parentRoute) {
      throw new Error(`api/router/moveTo: didn\'t find parent route by id: ${parentId}`);
    }
  } else {
    parentRoute = findRouterNode(root);
  }

  root.find(j.JSXElement, {
    start: route.start,
    end: route.end,
  }).at(0).remove();

  if (parentRoute.openingElement.selfClosing) {
    parentRoute.openingElement.selfClosing = false;
    parentRoute.closingElement = j.jsxClosingElement(
      j.jsxIdentifier(parentRoute.openingElement.name.name)
    );
  }

  if (parentRoute.children.length===0) {
    parentRoute.children.push(j.jsxText('\n'));
  }
  parentRoute.children.push(route);
  parentRoute.children.push(j.jsxText('\n'));


  writeFile(filePath, root.toSource());
}
