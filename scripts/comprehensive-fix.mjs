#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const SYNAPSE_DIR = ROOT_DIR;

// 只处理 /workspace/synapse 目录
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml', '.css', '.scss', '.env', '.sh'];

// 替换映射
const REPLACEMENTS = [
  // 品牌名称
  { from: /Multica/g, to: 'Synapse' },
  { from: /multica/g, to: 'synapse' },
  
  // API 相关
  { from: /multica_csrf/g, to: 'synapse_csrf' },
  { from: /multica_helper/g, to: 'synapse_helper' },
  { from: /multica\./g, to: 'synapse.' },
  { from: /@multica\//g, to: '@synapse/' },
  
  // 域名相关
  { from: /multica\.ai/g, to: 'synapse.ai' },
  
  // URL 协议
  { from: /multica:\/\//g, to: 'synapse://' },
];

// 目录重命名映射
const DIR_RENAMES = [
  { from: 'multica-server', to: 'synapse-server' },
];

// 文件重命名映射
const FILE_RENAMES = [
  { from: /multica/g, to: 'synapse' },
];

console.log('🔍 开始全面修复 Synapse 项目...\n');

// 第一步：重命名目录
console.log('📁 步骤 1: 重命名目录...');
DIR_RENAMES.forEach(({ from, to }) => {
  const packagesDir = join(SYNAPSE_DIR, 'packages');
  if (existsSync(join(packagesDir, from))) {
    try {
      renameSync(join(packagesDir, from), join(packagesDir, to));
      console.log(`  ✅ 重命名目录: ${from} → ${to}`);
    } catch (e) {
      console.log(`  ❌ 无法重命名目录 ${from}:`, e.message);
    }
  }
});

// 第二步：遍历文件并替换内容
console.log('\n📝 步骤 2: 替换文件内容...');
let filesProcessed = 0;
let filesChanged = 0;

function processDirectory(dir) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    if (EXCLUDE_DIRS.includes(entry)) continue;
    
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  // 检查文件扩展名
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  if (!INCLUDE_EXTENSIONS.includes(ext) && !INCLUDE_EXTENSIONS.some(e => filePath.endsWith(e))) {
    return;
  }
  
  // 跳过我们的脚本文件
  if (filePath.includes('scripts/')) return;
  
  filesProcessed++;
  
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch (e) {
    // 跳过无法读取的文件
    return;
  }
  
  let newContent = content;
  let hasChanges = false;
  
  // 应用所有替换
  for (const { from, to } of REPLACEMENTS) {
    if (from.test(newContent)) {
      newContent = newContent.replace(from, to);
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    try {
      writeFileSync(filePath, newContent, 'utf8');
      filesChanged++;
      if (filesChanged <= 20) {
        console.log(`  ✏️  已更新: ${filePath.substring(SYNAPSE_DIR.length + 1)}`);
      }
    } catch (e) {
      console.log(`  ❌ 无法写入 ${filePath}:`, e.message);
    }
  }
}

processDirectory(SYNAPSE_DIR);

console.log(`\n📊 处理完成!`);
console.log(`  扫描文件: ${filesProcessed}`);
console.log(`  更新文件: ${filesChanged}`);

if (filesChanged > 20) {
  console.log(`  (还有 ${filesChanged - 20} 个文件已更新，未全部显示)`);
}

console.log('\n✅ 所有修复完成!');
