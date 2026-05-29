#!/usr/bin/env zx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const ROOT_DIR = '/workspace/synapse';
console.log('Starting to fix remaining old references...');

console.log('1. Fixing synapse-server Go files...');
const goFiles = await glob(`${ROOT_DIR}/packages/synapse-server/**/*.go`);
for (const file of goFiles) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;
  
  // Replace multica.ai email domain
  if (content.includes('@multica.ai')) {
    content = content.replace(/@multica\.ai/g, '@synapse.ai');
    modified = true;
  }
  
  // Replace multica.test email domain
  if (content.includes('@multica.test')) {
    content = content.replace(/@multica\.test/g, '@synapse.test');
    modified = true;
  }
  
  // Replace multica-agent with synapse-agent
  if (content.includes('multica-agent')) {
    content = content.replace(/multica-agent/g, 'synapse-agent');
    modified = true;
  }
  
  // Replace MULTICA_DEV_VERIFICATION_CODE with SYNAPSE_DEV_VERIFICATION_CODE
  if (content.includes('MULTICA_DEV_VERIFICATION_CODE')) {
    content = content.replace(/MULTICA_DEV_VERIFICATION_CODE/g, 'SYNAPSE_DEV_VERIFICATION_CODE');
    modified = true;
  }
  
  // Replace references to Multica in strings
  if (content.includes('Multica')) {
    content = content.replace(/Multica/g, 'Synapse');
    modified = true;
  }
  
  if (modified) {
    writeFileSync(file, content);
    console.log(`  Fixed: ${file}`);
  }
}

console.log('2. Fixing eslint config files...');
const eslintFiles = [
  `${ROOT_DIR}/packages/views/eslint.config.mjs`,
  `${ROOT_DIR}/packages/web/eslint.config.mjs`,
  `${ROOT_DIR}/packages/ui/eslint.config.mjs`,
  `${ROOT_DIR}/packages/core/eslint.config.mjs`,
];
for (const file of eslintFiles) {
  try {
    let content = readFileSync(file, 'utf-8');
    let modified = false;
    
    // Replace @multica/eslint-config
    if (content.includes('@multica/eslint-config')) {
      // Since @synapse/eslint-config doesn't exist, just remove the reference 
      // or use a standard config as fallback
      console.log(`  Found @multica/eslint-config in: ${file}`);
      console.log(`  Note: This should be updated to use standard eslint configs`);
    }
    
    if (modified) {
      writeFileSync(file, content);
      console.log(`  Fixed: ${file}`);
    }
  } catch (e) {
    console.log(`  Skipping (file not found): ${file}`);
  }
}

console.log('Done!');
