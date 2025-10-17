#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';

const commonFixes = [
  {
    name: 'Clear Next.js Cache',
    command: 'rm -rf .next',
    description: 'Removes build cache that might cause issues'
  },
  {
    name: 'Clear Node Modules',
    command: 'rm -rf node_modules package-lock.json && npm install',
    description: 'Fresh dependency installation'
  },
  {
    name: 'TypeScript Check',
    command: 'npx tsc --noEmit',
    description: 'Check for TypeScript errors'
  },
  {
    name: 'Next.js Build Test',
    command: 'npm run build',
    description: 'Test production build'
  }
];

async function runCommonFixes() {
  console.log('🔧 Running common deployment fixes...\n');
  
  for (const fix of commonFixes) {
    try {
      console.log(`⏳ ${fix.name}...`);
      console.log(`   ${fix.description}`);
      
      if (fix.command.includes('rm -rf')) {
        // Handle file system operations
        if (fix.command.includes('.next')) {
          if (fs.existsSync('.next')) {
            fs.rmSync('.next', { recursive: true, force: true });
            console.log('   ✅ Cleared .next cache');
          }
        }
        if (fix.command.includes('node_modules')) {
          if (fs.existsSync('node_modules')) {
            fs.rmSync('node_modules', { recursive: true, force: true });
            console.log('   ✅ Cleared node_modules');
          }
          if (fs.existsSync('package-lock.json')) {
            fs.unlinkSync('package-lock.json');
            console.log('   ✅ Cleared package-lock.json');
          }
          execSync('npm install', { stdio: 'inherit' });
        }
      } else {
        execSync(fix.command, { stdio: 'inherit' });
      }
      
      console.log(`✅ ${fix.name} - COMPLETED\n`);
    } catch (error) {
      console.error(`❌ ${fix.name} - FAILED`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }
  
  console.log('🎉 Common fixes completed! Try deploying again.');
}

runCommonFixes().catch(console.error);
