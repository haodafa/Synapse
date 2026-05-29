#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = '/workspace/synapse';

const CHECKS = [
  {
    name: '检查旧的品牌引用 (@getpaseo)',
    patterns: ['@getpaseo', '@boudra'],
    exclude: ['expo-two-way-audio'],
    files: []
  },
  {
    name: '检查 Multica 旧引用',
    patterns: ['@multica', 'multica', 'Multica', 'MULTICA'],
    exclude: ['node_modules'],
    files: []
  }
];

function shouldExclude(filePath, excludePatterns) {
  for (const pattern of excludePatterns) {
    if (filePath.includes(pattern)) {
      return true;
    }
  }
  return false;
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml']) {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          continue;
        }
        results.push(...scanDirectory(fullPath, extensions));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning ${dir}:`, err.message);
  }
  
  return results;
}

function checkFile(filePath, pattern) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(pattern, 'g');
    return content.match(regex);
  } catch (err) {
    return null;
  }
}

console.log('🔍 开始代码审查...\n');

const files = scanDirectory(ROOT_DIR);
console.log(`📁 扫描了 ${files.length} 个文件\n`);

const issues = [];

for (const check of CHECKS) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔎 ${check.name}`);
  console.log('='.repeat(60));
  
  let foundIssues = false;
  
  for (const file of files) {
    if (shouldExclude(file, check.exclude || [])) {
      continue;
    }
    
    for (const pattern of check.patterns) {
      const matches = checkFile(file, pattern);
      
      if (matches && matches.length > 0) {
        foundIssues = true;
        const relativePath = path.relative(ROOT_DIR, file);
        console.log(`❌ ${relativePath}`);
        console.log(`   找到 ${matches.length} 处 "${pattern}"`);
        issues.push({ file, pattern, count: matches.length });
      }
    }
  }
  
  if (!foundIssues) {
    console.log('✅ 没有发现问题');
  }
}

console.log('\n');
console.log('='.repeat(60));
console.log('📊 审查总结');
console.log('='.repeat(60));

if (issues.length === 0) {
  console.log('✅ 代码审查通过！所有旧引用已替换。\n');
} else {
  console.log(`⚠️  发现 ${issues.length} 个文件存在问题\n`);
  
  console.log('需要检查的文件：');
  const uniqueFiles = [...new Set(issues.map(i => i.file))];
  for (const file of uniqueFiles.slice(0, 20)) {
    console.log(`  - ${path.relative(ROOT_DIR, file)}`);
  }
  
  if (uniqueFiles.length > 20) {
    console.log(`  ... 还有 ${uniqueFiles.length - 20} 个文件`);
  }
}
