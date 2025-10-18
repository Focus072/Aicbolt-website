const puppeteer = require('puppeteer');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env.local' });

class LoadStressTests {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3003';
    this.db = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      failures: [],
      performance: []
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

  async simulateConcurrentUsers() {
    console.log('👥 Simulating concurrent users...');
    
    await this.test('Concurrent Page Loads', async () => {
      const concurrentUsers = 20;
      const pages = ['/', '/sign-in', '/profit-plan', '/dashboard'];
      const promises = [];
      
      for (let i = 0; i < concurrentUsers; i++) {
        const page = pages[i % pages.length];
        promises.push(
          axios.get(`${this.baseUrl}${page}`, { 
            timeout: 10000,
            validateStatus: (status) => status < 500
          }).then(response => ({
            user: i + 1,
            page: page,
            status: response.status,
            success: true
          })).catch(error => ({
            user: i + 1,
            page: page,
            status: 'error',
            success: false,
            error: error.message
          }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`   📊 Concurrent users: ${successful} successful, ${failed} failed`);
      
      if (successful < concurrentUsers * 0.8) {
        throw new Error(`High failure rate: ${failed}/${concurrentUsers} users failed`);
      }
    });

    await this.test('Concurrent API Calls', async () => {
      const concurrentCalls = 50;
      const endpoints = ['/api/user', '/api/dashboard', '/api/clients', '/api/projects'];
      const promises = [];
      
      for (let i = 0; i < concurrentCalls; i++) {
        const endpoint = endpoints[i % endpoints.length];
        promises.push(
          axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500
          }).then(response => ({
            call: i + 1,
            endpoint: endpoint,
            status: response.status,
            success: true
          })).catch(error => ({
            call: i + 1,
            endpoint: endpoint,
            status: 'error',
            success: false,
            error: error.message
          }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`   📊 Concurrent API calls: ${successful} successful, ${failed} failed`);
      
      if (successful < concurrentCalls * 0.7) {
        throw new Error(`High API failure rate: ${failed}/${concurrentCalls} calls failed`);
      }
    });
  }

  async simulateHighTraffic() {
    console.log('🚦 Simulating high traffic scenarios...');
    
    await this.test('Sustained High Traffic', async () => {
      const duration = 30000; // 30 seconds
      const interval = 100; // 100ms between requests
      const startTime = Date.now();
      let requestCount = 0;
      let successCount = 0;
      let failureCount = 0;
      
      const makeRequest = async () => {
        try {
          const response = await axios.get(`${this.baseUrl}/`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500
          });
          successCount++;
        } catch (error) {
          failureCount++;
        }
        requestCount++;
      };
      
      const intervalId = setInterval(async () => {
        if (Date.now() - startTime < duration) {
          await makeRequest();
        } else {
          clearInterval(intervalId);
          console.log(`   📊 Sustained traffic: ${requestCount} requests, ${successCount} successful, ${failureCount} failed`);
          
          if (failureCount > requestCount * 0.1) {
            throw new Error(`High failure rate during sustained traffic: ${failureCount}/${requestCount}`);
          }
        }
      }, interval);
      
      // Wait for the test to complete
      await new Promise(resolve => setTimeout(resolve, duration + 1000));
    });

    await this.test('Traffic Spike Simulation', async () => {
      const spikeRequests = 100;
      const promises = [];
      
      // Simulate a sudden traffic spike
      for (let i = 0; i < spikeRequests; i++) {
        promises.push(
          axios.get(`${this.baseUrl}/`, { 
            timeout: 10000,
            validateStatus: (status) => status < 500
          }).then(response => ({
            request: i + 1,
            status: response.status,
            success: true
          })).catch(error => ({
            request: i + 1,
            status: 'error',
            success: false,
            error: error.message
          }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`   📊 Traffic spike: ${successful} successful, ${failed} failed`);
      
      if (successful < spikeRequests * 0.6) {
        throw new Error(`System couldn't handle traffic spike: ${failed}/${spikeRequests} failed`);
      }
    });
  }

  async simulateDatabaseLoad() {
    console.log('🗄️ Simulating database load...');
    
    await this.test('Concurrent Database Queries', async () => {
      const concurrentQueries = 30;
      const queries = [
        'SELECT COUNT(*) FROM users',
        'SELECT COUNT(*) FROM teams',
        'SELECT COUNT(*) FROM team_members',
        'SELECT COUNT(*) FROM activity_logs',
        'SELECT u.username, t.name FROM users u LEFT JOIN team_members tm ON u.id = tm.user_id LEFT JOIN teams t ON tm.team_id = t.id'
      ];
      
      const promises = [];
      
      for (let i = 0; i < concurrentQueries; i++) {
        const query = queries[i % queries.length];
        promises.push(
          this.db.query(query).then(result => ({
            query: i + 1,
            success: true,
            rowCount: result.rows.length
          })).catch(error => ({
            query: i + 1,
            success: false,
            error: error.message
          }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`   📊 Concurrent DB queries: ${successful} successful, ${failed} failed`);
      
      if (successful < concurrentQueries * 0.8) {
        throw new Error(`Database load test failed: ${failed}/${concurrentQueries} queries failed`);
      }
    });

    await this.test('Database Connection Pool Stress', async () => {
      const maxConnections = 15;
      const connections = [];
      
      try {
        // Create multiple connection pools to stress the database
        for (let i = 0; i < maxConnections; i++) {
          const connection = new Pool({
            connectionString: process.env.POSTGRES_URL,
            max: 2
          });
          connections.push(connection);
          
          // Test each connection
          await connection.query('SELECT 1');
          console.log(`   ✅ Connection pool ${i + 1} established`);
        }
        
        console.log(`   📊 Successfully created ${connections.length} connection pools`);
      } catch (error) {
        console.log(`   🚨 Connection pool stress failed: ${error.message}`);
        throw error;
      } finally {
        // Clean up all connections
        for (const connection of connections) {
          try {
            await connection.end();
          } catch (error) {
            console.log(`   ⚠️ Error closing connection: ${error.message}`);
          }
        }
      }
    });
  }

  async simulateMemoryStress() {
    console.log('🧠 Simulating memory stress...');
    
    await this.test('Memory Usage Under Load', async () => {
      const initialMemory = process.memoryUsage();
      console.log(`   📊 Initial memory: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);
      
      // Create memory pressure by making many requests
      const requests = 100;
      const promises = [];
      
      for (let i = 0; i < requests; i++) {
        promises.push(
          axios.get(`${this.baseUrl}/`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500
          }).catch(error => ({ error: error.message }))
        );
      }
      
      await Promise.all(promises);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      console.log(`   📊 Final memory: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
      console.log(`   📊 Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
      
      if (memoryIncrease > 100 * 1024 * 1024) { // 100MB
        console.log('   ⚠️ High memory usage detected');
      }
    });

    await this.test('Memory Leak Detection', async () => {
      const measurements = [];
      
      // Take memory measurements over time
      for (let i = 0; i < 10; i++) {
        const memory = process.memoryUsage();
        measurements.push(memory.heapUsed);
        
        // Make some requests
        const promises = [];
        for (let j = 0; j < 10; j++) {
          promises.push(
            axios.get(`${this.baseUrl}/`, { 
              timeout: 3000,
              validateStatus: (status) => status < 500
            }).catch(error => ({ error: error.message }))
          );
        }
        await Promise.all(promises);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const trend = measurements[measurements.length - 1] - measurements[0];
      console.log(`   📊 Memory trend: ${Math.round(trend / 1024 / 1024)}MB over ${measurements.length} measurements`);
      
      if (trend > 50 * 1024 * 1024) { // 50MB
        console.log('   ⚠️ Potential memory leak detected');
      }
    });
  }

  async simulateNetworkIssues() {
    console.log('🌐 Simulating network issues...');
    
    await this.test('Network Latency Simulation', async () => {
      const requests = 20;
      const latencies = [];
      
      for (let i = 0; i < requests; i++) {
        const startTime = Date.now();
        try {
          await axios.get(`${this.baseUrl}/`, { 
            timeout: 10000,
            validateStatus: (status) => status < 500
          });
          const endTime = Date.now();
          latencies.push(endTime - startTime);
        } catch (error) {
          console.log(`   ⚠️ Request ${i + 1} failed: ${error.message}`);
        }
      }
      
      if (latencies.length > 0) {
        const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
        const maxLatency = Math.max(...latencies);
        const minLatency = Math.min(...latencies);
        
        console.log(`   📊 Latency stats: avg=${Math.round(avgLatency)}ms, min=${minLatency}ms, max=${maxLatency}ms`);
        
        if (avgLatency > 5000) {
          console.log('   ⚠️ High average latency detected');
        }
      }
    });

    await this.test('Network Timeout Simulation', async () => {
      const requests = 10;
      let timeoutCount = 0;
      
      for (let i = 0; i < requests; i++) {
        try {
          await axios.get(`${this.baseUrl}/`, { 
            timeout: 1000, // Very short timeout
            validateStatus: (status) => status < 500
          });
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            timeoutCount++;
            console.log(`   ⏰ Request ${i + 1} timed out`);
          } else {
            console.log(`   ⚠️ Request ${i + 1} failed: ${error.message}`);
          }
        }
      }
      
      console.log(`   📊 Timeout simulation: ${timeoutCount}/${requests} requests timed out`);
    });
  }

  async runAllTests() {
    console.log('🧪 Starting Load Stress Tests');
    console.log('============================');

    await this.init();

    await this.simulateConcurrentUsers();
    await this.simulateHighTraffic();
    await this.simulateDatabaseLoad();
    await this.simulateMemoryStress();
    await this.simulateNetworkIssues();

    console.log('\n🎯 Load Stress Test Results');
    console.log('===========================');
    console.log(`✅ Tests Passed: ${this.testResults.tests.length}`);
    console.log(`❌ Tests Failed: ${this.testResults.failures.length}`);
    console.log(`📊 Performance Tests: ${this.testResults.performance.length}`);

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
  const loadStressTests = new LoadStressTests();
  loadStressTests.runAllTests().catch(console.error);
}

module.exports = LoadStressTests;
