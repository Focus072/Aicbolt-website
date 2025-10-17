/**
 * Environment Variable Validation for Production
 * Ensures all required env vars are set before deployment
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
  example?: string;
}

const ENV_VARIABLES: EnvConfig[] = [
  {
    name: 'POSTGRES_URL',
    required: true,
    description: 'PostgreSQL database connection string',
    example: 'postgresql://user:password@host:5432/database',
  },
  {
    name: 'AUTH_SECRET',
    required: true,
    description: 'Secret key for authentication',
    example: 'your-secure-random-secret-here',
  },
  {
    name: 'SCRAPER_API_KEY',
    required: true,
    description: 'API key for n8n scraper authentication',
    example: 'your-secure-random-api-key-here',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Public URL of your application (for invite links)',
    example: 'https://yourdomain.com',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret key for payments',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    description: 'Stripe webhook secret',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    description: 'Stripe publishable key',
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for sending emails (if using Resend)',
  },
];

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate all environment variables
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  ENV_VARIABLES.forEach((envVar) => {
    const value = process.env[envVar.name];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push(envVar.name);
      } else {
        warnings.push(envVar.name);
      }
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Print validation report to console
 */
export function printEnvReport(): void {
  console.log('\n🔍 Environment Variables Validation\n');
  console.log('='.repeat(60));

  const result = validateEnv();

  ENV_VARIABLES.forEach((envVar) => {
    const value = process.env[envVar.name];
    const status = value
      ? '✓'
      : envVar.required
      ? '✗'
      : '⚠';
    const statusColor = value
      ? '\x1b[32m'
      : envVar.required
      ? '\x1b[31m'
      : '\x1b[33m';
    const reset = '\x1b[0m';

    console.log(`${statusColor}${status}${reset} ${envVar.name.padEnd(35)} ${
      value ? 'Set' : envVar.required ? 'MISSING (Required)' : 'Not set (Optional)'
    }`);
    
    if (!value && envVar.example) {
      console.log(`  ${' '.repeat(36)} Example: ${envVar.example}`);
    }
  });

  console.log('='.repeat(60));

  if (result.missing.length > 0) {
    console.log(`\n❌ ${result.missing.length} required variable(s) missing:`);
    result.missing.forEach((name) => {
      console.log(`   - ${name}`);
    });
    console.log('\n⚠️  Application may not function correctly!\n');
  } else {
    console.log('\n✅ All required environment variables are set!\n');
  }

  if (result.warnings.length > 0) {
    console.log(`⚠️  ${result.warnings.length} optional variable(s) not set:`);
    result.warnings.forEach((name) => {
      console.log(`   - ${name}`);
    });
    console.log();
  }
}

/**
 * Throw error if required env vars are missing
 */
export function requireEnv(): void {
  const result = validateEnv();
  
  if (!result.valid) {
    const error = new Error(
      `Missing required environment variables: ${result.missing.join(', ')}`
    );
    console.error('\n❌ Environment validation failed!\n');
    printEnvReport();
    throw error;
  }
}


