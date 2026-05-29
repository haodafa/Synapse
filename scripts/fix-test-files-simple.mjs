#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = '/workspace/synapse/packages/synapse-server';
console.log('开始修复测试文件中的旧引用...');

function findTestFiles(dir) {
  const results = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...findTestFiles(filePath));
    } else if (file.endsWith('_test.go')) {
      results.push(filePath);
    }
  }
  return results;
}

const testFiles = findTestFiles(ROOT_DIR);

for (const file of testFiles) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;

  // 替换邮箱域名
  if (content.includes('@multica.ai')) {
    content = content.replace(/@multica\.ai/g, '@synapse.ai');
    modified = true;
  }
  
  // 替换测试域名
  if (content.includes('@multica.test')) {
    content = content.replace(/@multica\.test/g, '@synapse.test');
    modified = true;
  }
  
  // 替换代理名称
  if (content.includes('multica-agent')) {
    content = content.replace(/multica-agent/g, 'synapse-agent');
    modified = true;
  }
  
  // 替换字符串中的 Multica
  if (content.includes('Multica')) {
    content = content.replace(/Multica/g, 'Synapse');
    modified = true;
  }

  if (modified) {
    writeFileSync(file, content);
    console.log(`  已修复: ${file}`);
  }
}

console.log('所有测试文件修复完成！');
