import {writeFile, readFile, getTemplate} from "./utils";
import {existsSync} from "fs";
import {join, sep} from "path";
import j from "jscodeshift";
import assert from "assert";


export function createLocale(payload) {
  const filePath = join(payload.sourcePath, payload.filePath);
  assert(filePath, 'api/locale/create: locale/zh.js is out exists');
  const source = readFile(filePath);
  const root = j(source);
  const all = root.find(j.ExportDefaultDeclaration);
  const last = all.find(j.Property).at(0);
  last.insertBefore(j.property('init',
    j.literal('index.menu.item.' + payload.pathDot),
    j.literal(payload.namespace)));
  last.insertBefore(j.property('init',
    j.literal('index.' + payload.pathDot + '.entity'),
    j.literal(payload.namespace)));
  writeFile(filePath, root.toSource());
}


