#!/usr/bin/env tsx

/**
 * Environment Variable Validation Script
 * Run this before deployment to ensure all required env vars are set
 * 
 * Usage: npx tsx scripts/validate-env.ts
 */

import { printEnvReport, validateEnv } from '../lib/env-validation';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Pre-Deployment Environment Check\n');

printEnvReport();

const result = validateEnv();

if (!result.valid) {
  console.error('💥 Validation failed! Fix the missing variables before deploying.\n');
  process.exit(1);
} else {
  console.log('🎉 Environment is ready for deployment!\n');
  process.exit(0);
}


