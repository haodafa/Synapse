#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', 'packages', 'unified-daemon');

const replacements = [
  { from: /@getsynapse\//g, to: '@synapse/' },
  { from: /@getsynapse/g, to: '@synapse' },
  { from: /synapse-config/g, to: 'synapse-config' },
  { from: /SynapseConfig/g, to: 'SynapseConfig' },
  { from: /SYNAPSE_/g, to: 'SYNAPSE_' },
  { from: /Synapse\s*Node/g, to: 'Synapse Node' },
  { from: /synapse-env/g, to: 'synapse-env' },
  { from: /synapse-home/g, to: 'synapse-home' },
  { from: /synapse-daemon/g, to: 'synapse-daemon' },
  { from: /synapse-integration/g, to: 'synapse-integration' },
  { from: /synapse-command/g, to: 'synapse-command' },
  { from: /createSynapseClient/g, to: 'createSynapseClient' },
  { from: /SynapseClient/g, to: 'SynapseClient' },
  { from: /SynapseLifecycle/g, to: 'SynapseLifecycle' },
  { from: /SynapseScript/g, to: 'SynapseScript' },
  { from: /SynapseWorktree/g, to: 'SynapseWorktree' },
  { from: /SynapseMetadata/g, to: 'SynapseMetadata' },
  { from: /SynapseEnv/g, to: 'SynapseEnv' },
  { from: /SynapseHome/g, to: 'SynapseHome' },
  { from: /SynapseDaemon/g, to: 'SynapseDaemon' },
];

const processFile = (filePath) => {
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const { from, to } of replacements) {
      if (content.match(from)) {
        content = content.replace(from, to);
        modified = true;
      }
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (err) {
    console.warn(`⚠️ Skipping: ${filePath} - ${err.message}`);
  }
};

const walkDir = (dir) => {
  const items = readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    if (item.name === 'node_modules' || item.name === 'dist' || item.name === '.git') {
      continue;
    }
    
    const fullPath = join(dir, item.name);
    
    if (item.isDirectory()) {
      walkDir(fullPath);
    } else if (item.isFile() && (
      item.name.endsWith('.ts') || 
      item.name.endsWith('.tsx') || 
      item.name.endsWith('.js') ||
      item.name.endsWith('.jsx') ||
      item.name.endsWith('.json') ||
      item.name.endsWith('.md') ||
      item.name.endsWith('.mjs')
    )) {
      processFile(fullPath);
    }
  }
};

console.log('🔧 Starting comprehensive replacement in unified-daemon...');
walkDir(rootDir);
console.log('✅ Replacement complete!');
