#!/usr/bin/env zx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const ROOT_DIR = '/workspace/synapse/packages/synapse-server';
console.log('开始修复测试文件中的旧引用...');

const testFiles = await glob(`${ROOT_DIR}/**/*_test.go`);

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
