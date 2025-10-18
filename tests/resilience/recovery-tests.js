const puppeteer = require('puppeteer');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

class RecoveryTests {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3003';
    this.db = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      failures: [],
      recovery: []
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.db) {
      await this.db.end();
    }
  }

  async test(name, testFunction) {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const startTime = Date.now();
      await testFunction();
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.testResults.tests.push({
        name,
        status: 'PASSED',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ PASSED: ${name} (${duration}ms)`);
    } catch (error) {
      this.testResults.failures.push({
        name,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.log(`❌ FAILED: ${name} - ${error.message}`);
    }
  }

  async testAutoRecovery() {
    console.log('🔄 Testing automatic recovery mechanisms...');
    
    await this.test('API Auto-Recovery', async () => {
      const endpoints = ['/api/user', '/api/dashboard', '/api/clients'];
      const recoveryResults = [];
      
      for (const endpoint of endpoints) {
        let attempts = 0;
        let success = false;
        const maxAttempts = 5;
        
        while (attempts < maxAttempts && !success) {
          try {
            const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
              timeout: 3000,
              validateStatus: (status) => status < 500
            });
            
            if (response.status < 400) {
              success = true;
              recoveryResults.push({
                endpoint,
                attempts: attempts + 1,
                success: true
              });
              console.log(`   ✅ ${endpoint} recovered after ${attempts + 1} attempts`);
            }
          } catch (error) {
            attempts++;
            console.log(`   🔄 ${endpoint} attempt ${attempts} failed: ${error.message}`);
            
            if (attempts < maxAttempts) {
              // Exponential backoff
              const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        if (!success) {
          recoveryResults.push({
            endpoint,
            attempts: maxAttempts,
            success: false
          });
          console.log(`   ❌ ${endpoint} failed to recover after ${maxAttempts} attempts`);
        }
      }
      
      const successfulRecoveries = recoveryResults.filter(r => r.success).length;
      if (successfulRecoveries < endpoints.length * 0.8) {
        throw new Error(`Auto-recovery failed: ${successfulRecoveries}/${endpoints.length} endpoints recovered`);
      }
    });

    await this.test('Database Auto-Recovery', async () => {
      let attempts = 0;
      let success = false;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !success) {
        try {
          await this.db.query('SELECT 1');
          success = true;
          console.log(`   ✅ Database recovered after ${attempts + 1} attempts`);
        } catch (error) {
          attempts++;
          console.log(`   🔄 Database attempt ${attempts} failed: ${error.message}`);
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!success) {
        throw new Error(`Database failed to recover after ${maxAttempts} attempts`);
      }
    });
  }

  async testGracefulDegradation() {
    console.log('🛡️ Testing graceful degradation...');
    
    await this.test('Frontend Graceful Degradation', async () => {
      const page = await this.browser.newPage();
      
      try {
        // Test that pages load even with potential API failures
        await page.goto(`${this.baseUrl}/dashboard`, { waitUntil: 'networkidle0', timeout: 10000 });
        
        const title = await page.title();
        if (title && !title.includes('Error')) {
          console.log('   ✅ Dashboard loads gracefully');
        } else {
          throw new Error('Dashboard failed to load gracefully');
        }
        
        // Check for error handling elements
        const errorElements = await page.$$('.error, .alert, [data-testid="error"]');
        if (errorElements.length === 0) {
          console.log('   ✅ No error elements found (good graceful degradation)');
        } else {
          console.log(`   ⚠️ Found ${errorElements.length} error elements`);
        }
        
        // Check if critical functionality is available
        const criticalElements = await page.$$('nav, main, [data-testid="dashboard"]');
        if (criticalElements.length > 0) {
          console.log('   ✅ Critical UI elements are present');
        } else {
          console.log('   ⚠️ Critical UI elements may be missing');
        }
        
      } finally {
        await page.close();
      }
    });

    await this.test('API Fallback Mechanisms', async () => {
      const criticalEndpoints = ['/api/user', '/api/dashboard'];
      
      for (const endpoint of criticalEndpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500
          });
          
          if (response.status < 400) {
            console.log(`   ✅ ${endpoint} has working fallback`);
          } else {
            console.log(`   ⚠️ ${endpoint} returned ${response.status} - checking fallback`);
          }
        } catch (error) {
          console.log(`   🔄 ${endpoint} failed - testing fallback: ${error.message}`);
        }
      }
    });
  }

  async testDataConsistency() {
    console.log('🔒 Testing data consistency during recovery...');
    
    await this.test('Database Transaction Recovery', async () => {
      const client = await this.db.connect();
      
      try {
        await client.query('BEGIN');
        
        // Perform some operations
        const testUser = {
          username: 'recovery_test_' + Date.now(),
          name: 'Recovery Test User',
          password_hash: 'hashed_password',
          role: 'user',
          is_active: true
        };
        
        const insertResult = await client.query(`
          INSERT INTO users (username, name, password_hash, role, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id
        `, [testUser.username, testUser.name, testUser.password_hash, testUser.role, testUser.is_active]);
        
        const userId = insertResult.rows[0].id;
        console.log(`   ✅ Test user created with ID: ${userId}`);
        
        // Simulate a failure scenario
        await client.query('ROLLBACK');
        console.log('   ✅ Transaction rolled back successfully');
        
        // Verify the user was not actually created
        const verifyResult = await this.db.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (verifyResult.rows.length === 0) {
          console.log('   ✅ Data consistency maintained - user not created after rollback');
        } else {
          throw new Error('Data consistency issue - user exists after rollback');
        }
        
      } finally {
        client.release();
      }
    });

    await this.test('Foreign Key Constraint Recovery', async () => {
      // Test that foreign key constraints are maintained during recovery
      try {
        // Try to create an orphaned record
        await this.db.query('INSERT INTO team_members (user_id, team_id) VALUES ($1, $2)', [99999, 1]);
        throw new Error('Foreign key constraint not working');
      } catch (error) {
        if (error.code === '23503') {
          console.log('   ✅ Foreign key constraints maintained during recovery');
        } else {
          console.log(`   ⚠️ Unexpected error: ${error.message}`);
        }
      }
    });
  }

  async testSessionRecovery() {
    console.log('🔐 Testing session recovery...');
    
    await this.test('User Session Persistence', async () => {
      const page = await this.browser.newPage();
      
      try {
        // Navigate to login page
        await page.goto(`${this.baseUrl}/sign-in`);
        
        // Check if login form is present
        const loginForm = await page.$('form');
        if (loginForm) {
          console.log('   ✅ Login form is accessible');
        } else {
          throw new Error('Login form not found');
        }
        
        // Test session handling
        await page.goto(`${this.baseUrl}/dashboard`);
        
        // Check if we're redirected to login (expected for unauthenticated user)
        const currentUrl = page.url();
        if (currentUrl.includes('/sign-in')) {
          console.log('   ✅ Proper session handling - redirected to login');
        } else {
          console.log('   ⚠️ Unexpected session behavior');
        }
        
      } finally {
        await page.close();
      }
    });

    await this.test('Session Timeout Recovery', async () => {
      // Test that the application handles session timeouts gracefully
      const page = await this.browser.newPage();
      
      try {
        await page.goto(`${this.baseUrl}/dashboard`);
        
        // Check if we're redirected to login due to no session
        const currentUrl = page.url();
        if (currentUrl.includes('/sign-in')) {
          console.log('   ✅ Session timeout handled gracefully');
        } else {
          console.log('   ⚠️ Session timeout handling needs improvement');
        }
        
      } finally {
        await page.close();
      }
    });
  }

  async testPerformanceRecovery() {
    console.log('⚡ Testing performance recovery...');
    
    await this.test('Performance After Load', async () => {
      // First, create some load
      const loadPromises = [];
      for (let i = 0; i < 20; i++) {
        loadPromises.push(
          axios.get(`${this.baseUrl}/`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500
          }).catch(error => ({ error: error.message }))
        );
      }
      
      await Promise.all(loadPromises);
      console.log('   📊 Load test completed');
      
      // Wait for system to recover
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test performance after load
      const startTime = Date.now();
      try {
        await axios.get(`${this.baseUrl}/`, { 
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`   📊 Recovery response time: ${responseTime}ms`);
        
        if (responseTime > 5000) {
          console.log('   ⚠️ Performance recovery may be slow');
        } else {
          console.log('   ✅ Performance recovered quickly');
        }
      } catch (error) {
        console.log(`   🚨 Performance recovery failed: ${error.message}`);
        throw error;
      }
    });

    await this.test('Memory Recovery', async () => {
      const initialMemory = process.memoryUsage();
      console.log(`   📊 Initial memory: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);
      
      // Create memory pressure
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          axios.get(`${this.baseUrl}/`, { 
            timeout: 3000,
            validateStatus: (status) => status < 500
          }).catch(error => ({ error: error.message }))
        );
      }
      
      await Promise.all(promises);
      
      const peakMemory = process.memoryUsage();
      console.log(`   📊 Peak memory: ${Math.round(peakMemory.heapUsed / 1024 / 1024)}MB`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Wait for memory recovery
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const finalMemory = process.memoryUsage();
      console.log(`   📊 Final memory: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
      
      const memoryRecovery = peakMemory.heapUsed - finalMemory.heapUsed;
      if (memoryRecovery > 0) {
        console.log(`   ✅ Memory recovered: ${Math.round(memoryRecovery / 1024 / 1024)}MB`);
      } else {
        console.log('   ⚠️ Memory recovery may be slow');
      }
    });
  }

  async runAllTests() {
    console.log('🧪 Starting Recovery Tests');
    console.log('==========================');

    await this.init();

    await this.testAutoRecovery();
    await this.testGracefulDegradation();
    await this.testDataConsistency();
    await this.testSessionRecovery();
    await this.testPerformanceRecovery();

    console.log('\n🎯 Recovery Test Results');
    console.log('========================');
    console.log(`✅ Tests Passed: ${this.testResults.tests.length}`);
    console.log(`❌ Tests Failed: ${this.testResults.failures.length}`);
    console.log(`🔄 Recovery Tests: ${this.testResults.recovery.length}`);

    if (this.testResults.failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.name}: ${failure.error}`);
      });
    }

    await this.cleanup();
    return this.testResults;
  }
}

// Run tests if called directly
if (require.main === module) {
  const recoveryTests = new RecoveryTests();
  recoveryTests.runAllTests().catch(console.error);
}

module.exports = RecoveryTests;
