#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DIRECTORIES = [
  '/workspace/synapse/packages/app',
  '/workspace/synapse/packages/desktop',
  '/workspace/synapse/packages/website',
];

const REPLACEMENTS = [
  { from: '@getpaseo/client', to: '@synapse/client' },
  { from: '@getpaseo/expo-two-way-audio', to: '@getpaseo/expo-two-way-audio' }, // 保留第三方包名
  { from: '@getpaseo/highlight', to: '@synapse/highlight' },
  { from: '@getpaseo/protocol', to: '@synapse/protocol' },
  { from: '@getpaseo/server', to: '@synapse/unified-daemon' },
  { from: 'paseo-app', to: 'synapse-app' },
  { from: 'paseo-', to: 'synapse-' },
  { from: 'Paseo', to: 'Synapse' },
  { from: 'paseo', to: 'synapse' },
  { from: 'PASEO_', to: 'SYNAPSE_' },
];

function processFile(filePath) {
  try {
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
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

function traverseDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') {
          continue;
        }
        traverseDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml', '.html', '.css', '.scss'].includes(ext)) {
          processFile(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
}

console.log('Starting replacement process...');
for (const dir of DIRECTORIES) {
  console.log(`Processing directory: ${dir}`);
  traverseDirectory(dir);
}
console.log('Replacement process complete!');
