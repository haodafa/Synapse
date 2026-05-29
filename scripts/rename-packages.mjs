
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagesDir = path.resolve(__dirname, '..', 'packages');

const renameMap = {
  '@getpaseo/': '@synapse/',
  '@multica/': '@synapse/',
  getpaseo: 'synapse',
  multica: 'synapse'
};

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const [oldName, newName] of Object.entries(renameMap)) {
      if (content.includes(oldName)) {
        content = content.split(oldName).join(newName);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('Updated:', filePath);
    }
  } catch (err) {
    console.error('Error processing:', filePath, err.message);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name === 'package.json') {
      replaceInFile(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ||
               entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

console.log('Starting package renaming...');
processDirectory(packagesDir);
console.log('Done!');
