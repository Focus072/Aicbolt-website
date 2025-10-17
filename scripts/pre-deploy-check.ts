#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const checks = [
  {
    name: 'TypeScript Compilation',
    command: 'npx tsc --noEmit',
    critical: true
  },
  {
    name: 'Next.js Build',
    command: 'npm run build',
    critical: true
  },
  {
    name: 'Environment Variables',
    command: 'npx tsx scripts/validate-production.ts',
    critical: true
  }
];

async function runPreDeployChecks() {
  console.log('🚀 Running pre-deployment checks...\n');
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      console.log(`⏳ Running: ${check.name}...`);
      execSync(check.command, { stdio: 'pipe' });
      console.log(`✅ ${check.name} - PASSED\n`);
    } catch (error) {
      console.error(`❌ ${check.name} - FAILED`);
      console.error(error instanceof Error ? error.message : String(error));
      console.log('');
      
      if (check.critical) {
        allPassed = false;
      }
    }
  }
  
  if (allPassed) {
    console.log('🎉 All checks passed! Ready for deployment.');
    process.exit(0);
  } else {
    console.log('💥 Critical checks failed. Fix issues before deploying.');
    process.exit(1);
  }
}

runPreDeployChecks().catch(console.error);
