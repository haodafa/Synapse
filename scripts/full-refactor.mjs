#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 开始全面修复 @getsynapse 和 @multica 引用...');

// 替换规则
const replacements = [
  { from: /@getsynapse\//g, to: '@synapse/' },
  { from: /@multica\//g, to: '@synapse/' },
  { from: /test@getsynapse\.local/g, to: 'test@synapse.local' },
  { from: /test@getsynapse\.dev/g, to: 'test@synapse.dev' },
  { from: /maestro@getsynapse\.local/g, to: 'maestro@synapse.local' },
  { from: /"@getsynapse"/g, to: '"@synapse"' },
  { from: /'@getsynapse'/g, to: "'@synapse'" },
  { from: /synapse-config-schema/g, to: 'synapse-config-schema' },
  { from: /SynapseConfig/g, to: 'SynapseConfig' },
  { from: /SynapseClient/g, to: 'SynapseClient' },
  { from: /createSynapseClient/g, to: 'createSynapseClient' },
  { from: /@getsynapse\/client/g, to: '@synapse/client' },
  { from: /@getsynapse\/protocol/g, to: '@synapse/protocol' },
  { from: /@getsynapse\/server/g, to: '@synapse/unified-daemon' },
  { from: /@getsynapse\/cli/g, to: '@synapse/cli' },
  { from: /@getsynapse\/desktop/g, to: '@synapse/desktop' },
  { from: /@getsynapse\/app/g, to: '@synapse/app' },
  { from: /@getsynapse\/core/g, to: '@synapse/core' },
  { from: /@getsynapse\/ui/g, to: '@synapse/ui' },
  { from: /@getsynapse\/views/g, to: '@synapse/views' },
  { from: /@getsynapse\/web/g, to: '@synapse/web' },
  { from: /@getsynapse\/highlight/g, to: '@synapse/highlight' },
  { from: /synapse\s*CLI/gi, to: 'Synapse CLI' },
  { from: /synapse\s*command/gi, to: 'Synapse command' },
];

// 要处理的文件类型
const extensions = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml', '.sh', '.ps1'
];

// 要忽略的目录
const ignoreDirs = [
  'node_modules', '.git', 'dist', 'build', '.next', 'coverage',
  'synapse', 'multica'  // 忽略原始项目目录
];

// 获取所有需要处理的文件
function getAllFiles(dir) {
  const files = [];
  const items = execSync(`ls -a "${dir}"`, { encoding: 'utf8' }).split('\n').filter(Boolean);
  
  for (const item of items) {
    if (item === '.' || item === '..') continue;
    
    const fullPath = join(dir, item);
    const stat = execSync(`stat -c "%F" "${fullPath}" 2>/dev/null || echo "unknown"`, { encoding: 'utf8' }).trim();
    
    if (ignoreDirs.some(ignore => fullPath.includes(`/${ignore}/`) || fullPath.endsWith(`/${ignore}`))) {
      continue;
    }
    
    if (stat === 'directory') {
      files.push(...getAllFiles(fullPath));
    } else {
      const ext = item.substring(item.lastIndexOf('.'));
      if (extensions.includes(ext) || extensions.some(e => item.endsWith(e))) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

try {
  console.log('📁 扫描文件...');
  const allFiles = getAllFiles(rootDir);
  console.log(`✅ 找到 ${allFiles.length} 个文件`);
  
  let modifiedCount = 0;
  
  for (const file of allFiles) {
    try {
      let content = readFileSync(file, 'utf8');
      let originalContent = content;
      
      for (const { from, to } of replacements) {
        content = content.replace(from, to);
      }
      
      if (content !== originalContent) {
        writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`✓ 更新了: ${file}`);
      }
    } catch (e) {
      console.warn(`⚠️  跳过文件: ${file} - ${e.message}`);
    }
  }
  
  console.log(`\n🎉 完成！共更新了 ${modifiedCount} 个文件`);
  
} catch (error) {
  console.error('❌ 错误:', error);
  process.exit(1);
}
