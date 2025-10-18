#!/usr/bin/env node

/**
 * Resilience Testing Suite
 * Simulates real-world failures to test application stability
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  testDuration: 300000, // 5 minutes
  concurrentUsers: 50,
  failureRate: 0.1, // 10% failure rate
  logFile: path.join(__dirname, 'monitoring-reports', 'resilience-test.log')
};

class ResilienceTester {
  constructor() {
    this.isRunning = false;
    this.testResults = {
      startTime: null,
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      errors: [],
      stressTestResults: []
    };
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(CONFIG.logFile), { recursive: true });
      console.log('🧪 Resilience Tester initialized');
    } catch (error) {
      console.error('❌ Failed to initialize resilience tester:', error);
    }
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.testResults.startTime = new Date().toISOString();
    console.log('🚀 Starting resilience testing...');
    
    // Run different types of tests
    await Promise.all([
      this.runLoadTest(),
      this.runFailureSimulation(),
      this.runStressTest(),
      this.runRecoveryTest()
    ]);
    
    this.testResults.endTime = new Date().toISOString();
    await this.generateReport();
    
    this.isRunning = false;
    console.log('✅ Resilience testing completed');
  }

  async runLoadTest() {
    console.log('📊 Running load test...');
    const promises = [];
    
    for (let i = 0; i < CONFIG.concurrentUsers; i++) {
      promises.push(this.simulateUser(i));
    }
    
    await Promise.allSettled(promises);
  }

  async simulateUser(userId) {
    const endpoints = [
      '/',
      '/api/analytics',
      '/api/clients',
      '/api/projects',
      '/api/user',
      '/dashboard',
      '/sign-in'
    ];
    
    const startTime = Date.now();
    let requestCount = 0;
    
    while (this.isRunning && (Date.now() - startTime) < CONFIG.testDuration) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      await this.makeRequest(endpoint, userId);
      requestCount++;
      
      // Random delay between requests (100ms - 1000ms)
      await this.sleep(Math.random() * 900 + 100);
    }
    
    console.log(`👤 User ${userId} completed ${requestCount} requests`);
  }

  async makeRequest(endpoint, userId) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      });
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime, error.message);
    }
  }

  async runFailureSimulation() {
    console.log('💥 Running failure simulation...');
    
    // Simulate various failure scenarios
    const failureScenarios = [
      { name: 'High Latency', delay: 5000 },
      { name: 'Memory Pressure', requests: 100 },
      { name: 'Network Issues', timeout: 2000 }
    ];
    
    for (const scenario of failureScenarios) {
      await this.simulateFailure(scenario);
    }
  }

  async simulateFailure(scenario) {
    console.log(`🔥 Simulating: ${scenario.name}`);
    
    const promises = [];
    for (let i = 0; i < (scenario.requests || 10); i++) {
      promises.push(this.makeRequestWithFailure('/api/analytics', scenario));
    }
    
    await Promise.allSettled(promises);
  }

  async makeRequestWithFailure(endpoint, scenario) {
    try {
      const config = {
        timeout: scenario.timeout || 10000
      };
      
      if (scenario.delay) {
        await this.sleep(scenario.delay);
      }
      
      const response = await axios.get(`${CONFIG.baseUrl}${endpoint}`, config);
      this.updateMetrics(true, 0);
      
    } catch (error) {
      this.updateMetrics(false, 0, `${scenario.name}: ${error.message}`);
    }
  }

  async runStressTest() {
    console.log('⚡ Running stress test...');
    
    const stressLevels = [10, 25, 50, 100, 200];
    
    for (const level of stressLevels) {
      console.log(`🔥 Testing with ${level} concurrent requests...`);
      
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < level; i++) {
        promises.push(this.makeRequest('/api/analytics', i));
      }
      
      const results = await Promise.allSettled(promises);
      const duration = Date.now() - startTime;
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.length - successCount;
      
      this.testResults.stressTestResults.push({
        concurrentRequests: level,
        duration,
        successCount,
        failureCount,
        successRate: (successCount / results.length) * 100
      });
      
      console.log(`📈 Level ${level}: ${successCount}/${results.length} successful (${duration}ms)`);
      
      // Cool down between stress levels
      await this.sleep(2000);
    }
  }

  async runRecoveryTest() {
    console.log('🔄 Running recovery test...');
    
    // Simulate application restart scenario
    console.log('💤 Simulating application restart...');
    await this.sleep(5000);
    
    // Test recovery
    const recoveryChecks = [
      '/',
      '/api/analytics',
      '/dashboard'
    ];
    
    for (const endpoint of recoveryChecks) {
      try {
        const response = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
          timeout: 15000
        });
        console.log(`✅ Recovery check passed: ${endpoint}`);
      } catch (error) {
        console.log(`❌ Recovery check failed: ${endpoint} - ${error.message}`);
      }
    }
  }

  updateMetrics(success, responseTime, error = null) {
    this.testResults.totalRequests++;
    
    if (success) {
      this.testResults.successfulRequests++;
    } else {
      this.testResults.failedRequests++;
      if (error) {
        this.testResults.errors.push(error);
      }
    }
    
    this.testResults.averageResponseTime = 
      (this.testResults.averageResponseTime * (this.testResults.totalRequests - 1) + responseTime) / 
      this.testResults.totalRequests;
    
    this.testResults.maxResponseTime = Math.max(this.testResults.maxResponseTime, responseTime);
    this.testResults.minResponseTime = Math.min(this.testResults.minResponseTime, responseTime);
  }

  async generateReport() {
    const report = {
      ...this.testResults,
      summary: {
        totalDuration: new Date(this.testResults.endTime) - new Date(this.testResults.startTime),
        successRate: (this.testResults.successfulRequests / this.testResults.totalRequests) * 100,
        averageResponseTime: Math.round(this.testResults.averageResponseTime),
        maxResponseTime: this.testResults.maxResponseTime,
        minResponseTime: this.testResults.minResponseTime === Infinity ? 0 : this.testResults.minResponseTime,
        errorRate: (this.testResults.failedRequests / this.testResults.totalRequests) * 100
      }
    };
    
    // Save report
    const reportFile = path.join(__dirname, 'monitoring-reports', `resilience-test-${Date.now()}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    // Log summary
    console.log('\n📊 Resilience Test Results:');
    console.log(`Total Requests: ${report.totalRequests}`);
    console.log(`Success Rate: ${report.summary.successRate.toFixed(2)}%`);
    console.log(`Average Response Time: ${report.summary.averageResponseTime}ms`);
    console.log(`Max Response Time: ${report.summary.maxResponseTime}ms`);
    console.log(`Error Rate: ${report.summary.errorRate.toFixed(2)}%`);
    
    // Stress test results
    console.log('\n⚡ Stress Test Results:');
    report.stressTestResults.forEach(result => {
      console.log(`${result.concurrentRequests} concurrent: ${result.successRate.toFixed(2)}% success rate`);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Resilience testing stopped');
  }
}

// Start testing if run directly
if (require.main === module) {
  const tester = new ResilienceTester();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping resilience test...');
    tester.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping resilience test...');
    tester.stop();
    process.exit(0);
  });
  
  // Start testing
  tester.start();
}

module.exports = ResilienceTester;
