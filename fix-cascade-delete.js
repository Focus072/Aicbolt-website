const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Fixing cascade delete constraints...');

try {
  // Change to the project directory
  process.chdir(path.join(__dirname, 'saas-starter'));
  
  console.log('📁 Changed to project directory');
  
  // Generate migration
  console.log('🔄 Generating migration...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
  
  console.log('✅ Migration generated successfully!');
  
  // Push migration to database
  console.log('🚀 Pushing migration to database...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  
  console.log('✅ Migration applied successfully!');
  console.log('🎉 Cascade delete constraints are now fixed!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
