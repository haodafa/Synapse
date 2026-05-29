#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = '/workspace/synapse';

const REPLACEMENTS = [
  { from: 'scope: "@boudra"', to: 'scope: "@synapse"' },
  { from: '@boudra', to: 'haodafa' },
  { from: 'MULTICA', to: 'SYNAPSE' },
  { from: 'multica', to: 'synapse' },
  { from: 'Multica', to: 'Synapse' },
];

const FILES_TO_FIX = [
  '/workspace/synapse/.github/workflows/android-apk-release.yml',
  '/workspace/synapse/.github/workflows/deploy-app.yml',
  '/workspace/synapse/.github/workflows/desktop-release.yml',
  '/workspace/synapse/.github/workflows/desktop-rollout.yml',
  '/workspace/synapse/packages/cli/src/cli.ts',
  '/workspace/synapse/packages/core/autopilots/webhook.ts',
  '/workspace/synapse/packages/core/types/autopilot.ts',
  '/workspace/synapse/packages/unified-daemon/src/daemon.ts',
  '/workspace/synapse/packages/web/features/landing/i18n/en.ts',
  '/workspace/synapse/packages/web/features/landing/i18n/zh.ts',
  '/workspace/synapse/packages/web/lib/locale-routing.ts',
  '/workspace/synapse/packages/web/lib/request-locale.ts',
  '/workspace/synapse/packages/web/proxy.ts',
];

console.log('🔧 开始修复代码问题...\n');

let fixedCount = 0;

for (const filePath of FILES_TO_FIX) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const { from, to } of REPLACEMENTS) {
      if (content.includes(from)) {
        const regex = new RegExp(from, 'g');
        content = content.replace(regex, to);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复: ${path.relative(ROOT_DIR, filePath)}`);
      fixedCount++;
    }
  } catch (err) {
    console.error(`❌ 错误: ${filePath}`, err.message);
  }
}

console.log(`\n✅ 完成！修复了 ${fixedCount} 个文件`);
