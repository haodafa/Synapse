#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');

// 只处理 `/workspace/synapse` 内的文件，不包含 node_modules、.git 等
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.env', '.sh'];

// 替换规则
const replacements = [
  { from: 'multica.ai', to: 'synapse.ai' },
  { from: 'multica://', to: 'synapse://' },
  { from: '@multica', to: '@synapse' },
  { from: 'Multica', to: 'Synapse' },
  { from: 'multica', to: 'synapse' },
];

// 递归遍历目录
function traverseDir(dir: string, callback: (file: string) => void) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (EXCLUDE_DIRS.includes(file)) continue;
      traverseDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

let replacedCount = 0;
const processedFiles = [];

// 处理文件
traverseDir(ROOT_DIR, (filePath) => {
  if (!INCLUDE_EXTENSIONS.some(ext => filePath.endsWith(ext))) return;
  // 跳过我们的脚本文件本身
  if (filePath.includes('scripts/')) return;

  let content = readFileSync(filePath, 'utf8');
  let hasChanges = false;
  let newContent = content;

  for (const { from, to } of replacements) {
    const regex = new RegExp(from, 'g');
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, to);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    writeFileSync(filePath, newContent, 'utf8');
    replacedCount++;
    processedFiles.push(filePath);
    console.log(`Replaced in: ${filePath}`);
  }
});

console.log(`\nTotal files modified: ${replacedCount}`);
if (processedFiles.slice(0, 20).forEach(f => console.log(`- ${f}`));
if (processedFiles.length > 20) {
  console.log(`... and ${processedFiles.length - 20} more`);
}