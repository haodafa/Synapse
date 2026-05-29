#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const WORKFLOW_DIR = '/workspace/synapse/.github/workflows';
const SCRIPTS_DIR = '/workspace/synapse/scripts';

const replacements = [
  { from: 'synapse', to: 'synapse' },
  { from: 'Synapse', to: 'Synapse' },
  { from: 'SYNAPSE', to: 'SYNAPSE' },
  { from: '@getsynapse', to: '@synapse' },
  { from: 'getsynapse/synapse', to: 'haodafa/Synapse' },
  { from: 'desktop-v', to: 'desktop-v' },
  { from: 'synapse.sh', to: 'github.com/haodafa/Synapse' },
];

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  for (const replacement of replacements) {
    const regex = new RegExp(replacement.from, 'g');
    newContent = newContent.replace(regex, replacement.to);
  }
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.yml')) {
      replaceInFile(fullPath);
    }
  }
}

console.log('Processing workflow files...');
processDirectory(WORKFLOW_DIR);

console.log('\nProcessing scripts...');
const scriptFiles = fs.readdirSync(SCRIPTS_DIR);
for (const file of scriptFiles) {
  if (file.endsWith('.mjs') || file.endsWith('.ts')) {
    replaceInFile(path.join(SCRIPTS_DIR, file));
  }
}

console.log('\nAll done!');
