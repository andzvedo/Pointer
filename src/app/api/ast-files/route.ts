import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'tools/figma-ast-split');

function readDirRecursive(dir: string): any {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.map(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return {
        type: 'directory',
        name: entry.name,
        children: readDirRecursive(fullPath),
      };
    } else {
      return {
        type: 'file',
        name: entry.name,
        path: path.relative(ROOT, fullPath),
      };
    }
  });
}

export async function GET() {
  const tree = readDirRecursive(ROOT);
  return NextResponse.json(tree);
}
