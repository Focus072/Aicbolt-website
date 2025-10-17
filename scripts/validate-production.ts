#!/usr/bin/env tsx

import { z } from 'zod';

// Production environment validation schema
const productionEnvSchema = z.object({
  POSTGRES_URL: z.string().url('POSTGRES_URL must be a valid URL'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  SCRAPER_API_KEY: z.string().min(10, 'SCRAPER_API_KEY must be at least 10 characters'),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
});

function validateEnvironment() {
  console.log('🔍 Validating production environment...');
  
  try {
    const env = {
      POSTGRES_URL: process.env.POSTGRES_URL,
      AUTH_SECRET: process.env.AUTH_SECRET,
      SCRAPER_API_KEY: process.env.SCRAPER_API_KEY,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    };

    productionEnvSchema.parse(env);
    console.log('✅ All environment variables are valid!');
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    return false;
  }
}

if (validateEnvironment()) {
  process.exit(0);
} else {
  process.exit(1);
}
