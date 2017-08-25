import {writeFile, readFile} from "./utils";
import {existsSync} from "fs";
import {join, sep} from "path";
import assert from "assert";
import j from "jscodeshift";

function findMenurNode(root) {
  return root.find(
    j.JSXElement, {
      openingElement: {
        name: {
          name: 'Menu'
        }
      }
    }
  ).nodes()[0];
}

function findMenuById(root, id) {
  function find(node, parentPath = '', parentId) {
    const type = node.openingElement.name.name;
    const attributes = node.openingElement.attributes;
    let path;
    for (let i = 0; i < attributes.length; i++) {
      if (attributes[i].name.name === 'key') {
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
    // console.log(currentId);
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

  return find(findMenurNode(root), id);
}

function findParentMenu(root, id) {
  if (!id) {
    return findMenurNode(root);
  } else {
    return findMenuById(root, id);
  }
}
function createJsxElement(el, attributes = [], child) {
  return j.jsxElement(
    j.jsxOpeningElement(
      j.jsxIdentifier(el),
      attributes.map(attr => {
        if (attr.isExpression) {
          return j.jsxAttribute(
            j.jsxIdentifier(attr.key),
            j.jsxExpressionContainer(
              typeof attr.value === 'string' ?
                j.identifier(attr.value) :
                attr.value
            )
          )
        } else {
          return j.jsxAttribute(
            j.jsxIdentifier(attr.key),
            j.literal(attr.value)
          );
        }
      }),
      child.length===0
    ),
    child.length ? j.jsxClosingElement(
      j.jsxIdentifier(el)
    ) : null,
    child,
  );
}
function createElement(root, el, attributes = [], parentId, child = []) {
  const parentMenu = findParentMenu(root, parentId);
  if (!parentMenu) {
    throw new Error('createMenu, no element find by parentId');
  }
  const jsxElement = createJsxElement(el, attributes, child);
  parentMenu.children.push(jsxElement);
  parentMenu.children.push(j.jsxText('\n'));
}

function __createMenu(payload, type) {
  const { path, component = {}, parentId } = payload;
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  // const parentMenu = findParentMenu(root);
  const parentMenu = findParentMenu(root, parentId);
  if (!parentMenu) {
    throw new Error('createMenu, no element find by parentId');
  }

  // append Menu
  const attributes = [];
  if (path) {
    attributes.push({ key: 'key', value: path });
  }

  const icon = createJsxElement("Icon", [
    {key: 'type', value: 'home'}
    ], []);
  const label = createJsxElement('FormattedMessage', [
    {key: 'id', value: 'index.menu.item.' + payload.pathDot},
    {key: 'defaultMessage', value: payload.component.componentName},
  ], []);
  const indexLink = createJsxElement("IndexLink", [
    {key: 'to', value: '/index/' + payload.route},
    {key: 'activeClassName', value: 'active'}
  ], [j.jsxText('\n'), icon, j.jsxText('\n'), label, j.jsxText('\n')]);
  createElement(root, type, attributes, parentId, [j.jsxText('\n'), indexLink, j.jsxText('\n')]);

  if (!component.componentName) return writeFile(filePath, root.toSource());
  assert(
    component.filePath,
    'api/menu/create: payload.component should have filePath'
  );

  writeFile(filePath, root.toSource());
}
function __createSubMenu(payload, type) {
  const { path, component = {}, parentId } = payload;
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  // const parentMenu = findParentMenu(root);
  const parentMenu = findParentMenu(root, parentId);
  if (!parentMenu) {
    throw new Error('createSubMenu, no element find by parentId');
  }

  // <SubMenu key="user" title={<span><Icon type="user"/><span>
  //         <FormattedMessage id="index.menu.item.user" defaultMessage="Member" />
  //       </span></span>}>
  // </SubMenu>
  const icon = createJsxElement("Icon", [
    {key: 'type', value: 'home'}
  ], []);
  const label = createJsxElement('FormattedMessage', [
    {key: 'id', value: 'index.menu.item.' + payload.pathDot},
    {key: 'defaultMessage', value: payload.component.componentName},
  ], []);
  const title = createJsxElement("span", [], [icon, j.jsxText('\n'), label]);
  // append Menu
  const attributes = [];
  if (path) {
    attributes.push({ key: 'key', value: path });
    attributes.push({ key: 'title', value: title, isExpression: true});
  }
  // createElement(root, type, attributes, parentId, []);
  const jsxElement = createJsxElement(type, attributes, [j.jsxText('\n')]);
  parentMenu.children.push(jsxElement);
  parentMenu.children.push(j.jsxText('\n'));

  if (!component.componentName) return writeFile(filePath, root.toSource());
  assert(
    component.filePath,
    'api/menu/create: payload.component should have filePath'
  );

  writeFile(filePath, root.toSource());
}

export function createMenu(payload) {
  const { path, component = {}, parentId } = payload;
  assert(
    payload.path || (payload.component && payload.component.componentName),
    'api/menu/createMenu: payload should at least have path or compnent'
  );
  try {
    __createMenu(payload, 'Menu.Item');
  } catch(e) {
    if (e.message.includes('no element find by parentId')) {
      const _parentId = payload.parentId;
      const _path = payload.path;
      payload.parentId = '';
      payload.path = payload.route.split('/').shift();
      __createSubMenu(payload, 'SubMenu');
      payload.parentId = _parentId;
      payload.path = _path;
      __createMenu(payload, 'Menu.Item');
    }
  }
}


export function moveTo(payload) {
  assert(
    payload.id,
    'api/menu/moveTo: payload should have id & parentId'
  );
  const filePath = join(payload.sourcePath, payload.filePath);
  const source = readFile(filePath);
  const root = j(source);
  const menu = findRouteById(root, payload.id);
  if (!menu) {
    throw new Error(`api/menu/moveTo: didn\'t find menu by id: ${id}`);
  }

  let parentRoute;
  if (payload.parentId) {
    parentRoute = findRouteById(root, payload.parentId);
    if (!parentRoute) {
      throw new Error(`api/menu/moveTo: didn\'t find parent menu by id: ${parentId}`);
    }
  } else {
    parentRoute = findRouterNode(root);
  }

  root.find(j.JSXElement, {
    start: menu.start,
    end: menu.end,
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
  parentRoute.children.push(menu);
  parentRoute.children.push(j.jsxText('\n'));


  writeFile(filePath, root.toSource());
}

