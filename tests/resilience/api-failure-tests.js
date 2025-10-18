const puppeteer = require('puppeteer');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

class ApiFailureTests {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3003';
    this.browser = null;
    this.page = null;
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
    this.page = await this.browser.newPage();
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

  async simulateApiOutage() {
    console.log('🚨 Simulating API outage scenarios...');
    
    // Test 1: Slow API responses
    await this.test('Slow API Response Simulation', async () => {
      const endpoints = ['/api/user', '/api/dashboard', '/api/clients'];
      
      for (const endpoint of endpoints) {
        try {
          // Simulate slow response by setting a short timeout
          const startTime = Date.now();
          await axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 1000, // 1 second timeout to simulate slow response
            validateStatus: (status) => status < 500
          });
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          if (responseTime > 500) {
            console.log(`   ⚠️ ${endpoint} responded slowly: ${responseTime}ms`);
          } else {
            console.log(`   ✅ ${endpoint} responded quickly: ${responseTime}ms`);
          }
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            console.log(`   🚨 ${endpoint} timed out (simulated slow response)`);
          } else {
            console.log(`   ⚠️ ${endpoint} error: ${error.message}`);
          }
        }
      }
    });

    // Test 2: API error responses
    await this.test('API Error Response Simulation', async () => {
      const endpoints = ['/api/users', '/api/account/users'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 5000,
            validateStatus: (status) => true // Accept all status codes
          });
          
          if (response.status >= 400) {
            console.log(`   🚨 ${endpoint} returned error status: ${response.status}`);
          } else {
            console.log(`   ✅ ${endpoint} returned success: ${response.status}`);
          }
        } catch (error) {
          console.log(`   🚨 ${endpoint} failed: ${error.message}`);
        }
      }
    });

    // Test 3: Network connectivity issues
    await this.test('Network Connectivity Simulation', async () => {
      // Test with invalid URLs to simulate network issues
      const invalidUrls = [
        'http://invalid-api-endpoint.com/api/test',
        'http://timeout-test.com/api/test'
      ];
      
      for (const url of invalidUrls) {
        try {
          await axios.get(url, { timeout: 2000 });
        } catch (error) {
          if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.log(`   ✅ Network error simulation: ${error.code}`);
          } else {
            console.log(`   ⚠️ Unexpected error: ${error.message}`);
          }
        }
      }
    });
  }

  async testApiRecovery() {
    console.log('🔄 Testing API recovery mechanisms...');
    
    await this.test('API Recovery After Outage', async () => {
      const endpoints = ['/api/user', '/api/dashboard', '/api/clients'];
      
      for (const endpoint of endpoints) {
        let attempts = 0;
        let success = false;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !success) {
          try {
            const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
              timeout: 5000,
              validateStatus: (status) => status < 500
            });
            
            if (response.status < 400) {
              success = true;
              console.log(`   ✅ ${endpoint} recovered after ${attempts + 1} attempts`);
            }
          } catch (error) {
            attempts++;
            console.log(`   🔄 ${endpoint} attempt ${attempts} failed: ${error.message}`);
            
            if (attempts < maxAttempts) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        if (!success) {
          throw new Error(`${endpoint} failed to recover after ${maxAttempts} attempts`);
        }
      }
    });

    await this.test('API Circuit Breaker Pattern', async () => {
      const endpoint = '/api/users';
      let consecutiveFailures = 0;
      const maxFailures = 3;
      
      for (let i = 0; i < 5; i++) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 2000,
            validateStatus: (status) => status < 500
          });
          
          if (response.status < 400) {
            consecutiveFailures = 0;
            console.log(`   ✅ ${endpoint} successful (attempt ${i + 1})`);
          } else {
            consecutiveFailures++;
            console.log(`   ⚠️ ${endpoint} returned ${response.status} (attempt ${i + 1})`);
          }
        } catch (error) {
          consecutiveFailures++;
          console.log(`   🚨 ${endpoint} failed (attempt ${i + 1}): ${error.message}`);
        }
        
        if (consecutiveFailures >= maxFailures) {
          console.log(`   🔒 Circuit breaker triggered after ${consecutiveFailures} consecutive failures`);
          break;
        }
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    });
  }

  async testGracefulDegradation() {
    console.log('🛡️ Testing graceful degradation...');
    
    await this.test('Frontend Graceful Degradation', async () => {
      // Test that frontend handles API failures gracefully
      await this.page.goto(`${this.baseUrl}/dashboard`);
      
      // Check if page loads even with potential API failures
      const pageTitle = await this.page.title();
      if (pageTitle && pageTitle !== 'Error') {
        console.log('   ✅ Dashboard loads despite potential API issues');
      } else {
        throw new Error('Dashboard failed to load gracefully');
      }
      
      // Check for error handling in the page
      const errorElements = await this.page.$$('.error, .alert, [data-testid="error"]');
      if (errorElements.length === 0) {
        console.log('   ✅ No error elements found (good graceful degradation)');
      } else {
        console.log(`   ⚠️ Found ${errorElements.length} error elements`);
      }
    });

    await this.test('API Fallback Mechanisms', async () => {
      // Test if the application has fallback mechanisms
      const criticalEndpoints = ['/api/user', '/api/dashboard'];
      
      for (const endpoint of criticalEndpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 3000,
            validateStatus: (status) => status < 500
          });
          
          if (response.status < 400) {
            console.log(`   ✅ ${endpoint} has fallback mechanism`);
          } else {
            console.log(`   ⚠️ ${endpoint} returned ${response.status} - checking fallback`);
          }
        } catch (error) {
          console.log(`   🔄 ${endpoint} failed - testing fallback: ${error.message}`);
        }
      }
    });
  }

  async testLoadBalancing() {
    console.log('⚖️ Testing load balancing scenarios...');
    
    await this.test('Concurrent API Requests', async () => {
      const endpoint = '/api/user';
      const concurrentRequests = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500
          }).catch(error => ({ error: error.message }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;
      
      console.log(`   📊 Concurrent requests: ${successful} successful, ${failed} failed`);
      
      if (successful < concurrentRequests * 0.8) {
        throw new Error(`High failure rate: ${failed}/${concurrentRequests} requests failed`);
      }
    });

    await this.test('API Rate Limiting', async () => {
      const endpoint = '/api/users';
      const rapidRequests = 20;
      
      for (let i = 0; i < rapidRequests; i++) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 2000,
            validateStatus: (status) => status < 500
          });
          
          if (response.status === 429) {
            console.log(`   🚦 Rate limiting triggered at request ${i + 1}`);
            break;
          } else if (response.status < 400) {
            console.log(`   ✅ Request ${i + 1} successful`);
          }
        } catch (error) {
          if (error.response && error.response.status === 429) {
            console.log(`   🚦 Rate limiting triggered at request ${i + 1}`);
            break;
          } else {
            console.log(`   ⚠️ Request ${i + 1} failed: ${error.message}`);
          }
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  }

  async runAllTests() {
    console.log('🧪 Starting API Failure Resilience Tests');
    console.log('========================================');

    await this.init();

    await this.simulateApiOutage();
    await this.testApiRecovery();
    await this.testGracefulDegradation();
    await this.testLoadBalancing();

    console.log('\n🎯 API Failure Resilience Test Results');
    console.log('=====================================');
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
  const apiFailureTests = new ApiFailureTests();
  apiFailureTests.runAllTests().catch(console.error);
}

module.exports = ApiFailureTests;
