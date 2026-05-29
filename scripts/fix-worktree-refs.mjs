#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = '/workspace/synapse/packages/unified-daemon/src';

function replaceInFile(filePath, oldStr, newStr) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldStr)) {
    const newContent = content.replace(new RegExp(oldStr, 'g'), newStr);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      replaceInFile(fullPath, 'synapse-worktree-service', 'synapse-worktree-service');
      replaceInFile(fullPath, 'synapse-worktree-archive-service', 'synapse-worktree-archive-service');
    }
  }
}

processDirectory(ROOT_DIR);
console.log('Done!');
