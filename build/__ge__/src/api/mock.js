import {writeFile, readFile, getTemplate} from "./utils";
import {existsSync} from "fs";
import {join, sep} from "path";
import j from "jscodeshift";


export function createMock(payload) {
  const filePath = join(payload.sourcePath, payload.filePath);
  const template = getTemplate('mock.create');
  const source = template(payload);
  const root = j(source);
  writeFile(filePath, root.toSource());
}


